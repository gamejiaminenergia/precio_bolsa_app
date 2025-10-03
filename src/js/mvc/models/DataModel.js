/**
 * Modelo de Datos - Maneja la comunicación con la API y procesamiento de datos
 * Responsabilidades:
 * - Comunicación con la API de SIMEM
 * - Procesamiento y formateo de datos
 * - Gestión del sistema de caché
 * - Validación de datos
 */
class DataModel {
    constructor() {
        this.cacheManager = null;
        this.isExtracting = false;
        this.MAX_RETRIES = 3;
        this.RETRY_DELAY = 1000;
    }

    /**
     * Inicializar el modelo con el gestor de caché
     */
    initialize(cacheManager) {
        this.cacheManager = cacheManager;
    }

    /**
     * Formatear fecha para la API
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Validar rango de fechas
     */
    validateDateRange(startDate, endDate) {
        if (!startDate || !endDate) {
            throw new Error('Ambas fechas son requeridas');
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error('Fechas inválidas');
        }

        if (end < start) {
            throw new Error('La fecha final debe ser posterior a la fecha inicial');
        }

        const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        if (daysDiff > 31) {
            if (!confirm(`Estás a punto de consultar ${daysDiff} días. Esto puede tardar varios minutos. ¿Deseas continuar?`)) {
                throw new Error('Operación cancelada por el usuario');
            }
        }

        return { start, end, daysDiff: daysDiff + 1 };
    }

    /**
     * Obtener datos para una fecha específica
     */
    async fetchDataForDate(date) {
        const dateStr = this.formatDate(date);

        // Verificar caché primero
        if (this.cacheManager) {
            const existsInCache = await this.cacheManager.existeCacheParaFecha(dateStr);
            if (existsInCache) {
                const cachedData = await this.cacheManager.obtenerDatosDeCache(dateStr);
                if (cachedData && cachedData.length > 0) {
                    return {
                        date: dateStr,
                        data: cachedData,
                        fromCache: true
                    };
                }
            }
        }

        // Si no está en caché, consultar la API
        const apiUrl = `https://www.simem.co/backend-files/api/PublicData?startDate=${dateStr}&endDate=${dateStr}&datasetId=EC6945`;

        const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
            `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
            `https://cors-anywhere.herokuapp.com/${apiUrl}`
        ];

        for (let i = 0; i < proxies.length; i++) {
            const result = await this.fetchWithRetry(proxies[i]);

            if (result.success) {
                // Guardar en caché para futuras consultas
                if (this.cacheManager && result.records.length > 0) {
                    await this.cacheManager.guardarEnCache(dateStr, result.records);
                }

                return {
                    date: dateStr,
                    data: result.records,
                    fromCache: false
                };
            }

            if (i < proxies.length - 1) {
                await this.sleep(500);
            }
        }

        return {
            date: dateStr,
            data: [],
            fromCache: false,
            error: 'No se pudieron obtener datos después de todos los intentos'
        };
    }

    /**
     * Fetch con sistema de reintentos
     */
    async fetchWithRetry(url, retryCount = 0) {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success && data.result && data.result.records) {
                return {
                    success: true,
                    records: data.result.records
                };
            } else {
                throw new Error('Respuesta sin datos válidos');
            }
        } catch (error) {
            if (retryCount < this.MAX_RETRIES) {
                await this.sleep(this.RETRY_DELAY * (retryCount + 1));
                return this.fetchWithRetry(url, retryCount + 1);
            } else {
                return {
                    success: false,
                    error: error.message
                };
            }
        }
    }

    /**
     * Extraer datos para un rango de fechas con progreso en tiempo real
     */
    async extractData(startDate, endDate, progressCallback = null) {
        if (this.isExtracting) {
            throw new Error('Ya hay una extracción en curso');
        }

        this.isExtracting = true;
        const validation = this.validateDateRange(startDate, endDate);

        const results = [];
        const progress = {
            current: 0,
            total: validation.daysDiff,
            totalRecords: 0,
            cacheHits: 0
        };

        try {
            const currentDate = new Date(validation.start);

            while (currentDate <= validation.end) {
                const dateStr = this.formatDate(currentDate);
                const result = await this.fetchDataForDate(currentDate);

                if (result.fromCache) {
                    progress.cacheHits++;
                }

                if (result.data && result.data.length > 0) {
                    results.push(...result.data);
                    progress.totalRecords += result.data.length;
                }

                progress.current++;

                // Reportar progreso en tiempo real
                if (progressCallback) {
                    const currentProgress = {
                        day: dateStr,
                        dayIndex: progress.current,
                        totalDays: progress.total,
                        recordsInDay: result.data ? result.data.length : 0,
                        fromCache: result.fromCache,
                        totalRecords: progress.totalRecords,
                        cacheHits: progress.cacheHits,
                        percentage: Math.round((progress.current / progress.total) * 100)
                    };

                    // Llamar al callback de forma asíncrona para no bloquear
                    setTimeout(() => progressCallback(currentProgress), 0);
                }

                // Avanzar al siguiente día
                currentDate.setDate(currentDate.getDate() + 1);

                // Pequeña pausa para no sobrecargar la API
                if (!result.fromCache) {
                    await this.sleep(300);
                }
            }

            return {
                success: true,
                data: results,
                stats: {
                    totalRecords: progress.totalRecords,
                    daysProcessed: progress.current,
                    cacheHits: progress.cacheHits,
                    cachePercentage: Math.round((progress.cacheHits / progress.current) * 100)
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error.message,
                data: results,
                stats: {
                    totalRecords: progress.totalRecords,
                    daysProcessed: progress.current,
                    cacheHits: progress.cacheHits
                }
            };
        } finally {
            this.isExtracting = false;
        }
    }

    /**
     * Convertir datos a formato CSV
     */
    convertToCSV(records) {
        if (records.length === 0) return '';

        const headers = Object.keys(records[0]);
        const csvRows = [];

        csvRows.push(headers.join(','));

        for (const record of records) {
            const values = headers.map(header => {
                const value = record[header];
                const escaped = ('' + value).replace(/"/g, '\\"');
                return `"${escaped}"`;
            });
            csvRows.push(values.join(','));
        }

        return csvRows.join('\n');
    }

    /**
     * Descargar CSV
     */
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Obtener estadísticas del caché
     */
    async getCacheStats() {
        if (!this.cacheManager) {
            return null;
        }
        return await this.cacheManager.getCacheStats();
    }

    /**
     * Limpiar caché completa
     */
    async clearCache() {
        if (!this.cacheManager) {
            throw new Error('Sistema de caché no disponible');
        }
        return await this.cacheManager.limpiarCache();
    }

    /**
     * Utilidad para dormir
     */
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Exportar para uso global
window.DataModel = DataModel;