/**
 * Vista de Datos - Maneja la presentación y la interfaz de usuario
 * Responsabilidades:
 * - Actualizar el DOM
 * - Manejar eventos de usuario
 * - Mostrar progreso y mensajes
 * - Gestionar elementos de la UI
 */
class DataView {
    constructor() {
        this.elements = {
            fechaInicial: document.getElementById('fechaInicial'),
            fechaFinal: document.getElementById('fechaFinal'),
            extractBtn: document.getElementById('extractBtn'),
            progressContainer: document.getElementById('progressContainer'),
            progressBar: document.getElementById('progressBar'),
            statusMessage: document.getElementById('statusMessage'),
            logs: document.getElementById('logs'),
            cacheDates: document.getElementById('cacheDates'),
            cacheRecords: document.getElementById('cacheRecords'),
            cacheSize: document.getElementById('cacheSize'),
            lastUpdate: document.getElementById('lastUpdate'),
            logCount: document.getElementById('logCount'),
            downloadContainer: document.getElementById('downloadContainer'),
            downloadBtn: document.getElementById('downloadBtn'),
            downloadRecords: document.getElementById('downloadRecords'),
            downloadDateRange: document.getElementById('downloadDateRange')
        };

        this.eventListeners = {};
        this.logCount = 0;
        this.lastUpdateTime = null;
    }

    /**
     * Inicializar la vista
     */
    initialize() {
        this.setupEventListeners();
        this.updateCacheStats();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Event listener para el botón de extracción
        if (this.elements.extractBtn) {
            this.eventListeners.extractBtn = () => {
                if (this.onExtract) {
                    this.onExtract();
                }
            };
            this.elements.extractBtn.addEventListener('click', this.eventListeners.extractBtn);
        }

        // Event listener para limpiar caché
        const clearCacheBtn = document.querySelector('.btn-secondary');
        if (clearCacheBtn) {
            this.eventListeners.clearCacheBtn = () => {
                if (this.onClearCache) {
                    this.onClearCache();
                }
            };
            clearCacheBtn.addEventListener('click', this.eventListeners.clearCacheBtn);
        }

        // Event listeners para botones de preset de fechas
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(button => {
            this.eventListeners[`preset-${button.dataset.days}`] = () => {
                this.setPresetDates(parseInt(button.dataset.days));
            };
            button.addEventListener('click', this.eventListeners[`preset-${button.dataset.days}`]);
        });

        // Event listener para el botón de descarga
        if (this.elements.downloadBtn) {
            this.eventListeners.downloadBtn = () => {
                if (this.onDownload) {
                    this.onDownload();
                }
            };
            this.elements.downloadBtn.addEventListener('click', this.eventListeners.downloadBtn);
        }
    }

    /**
     * Establecer fechas preset
     */
    setPresetDates(days) {
        const endDate = new Date();
        const startDate = new Date();

        if (days === 1) {
            // Hoy
            startDate.setHours(0, 0, 0, 0);
        } else {
            // Días anteriores
            startDate.setDate(startDate.getDate() - (days - 1));
            startDate.setHours(0, 0, 0, 0);
        }

        if (this.elements.fechaInicial) {
            this.elements.fechaInicial.value = this.formatDate(startDate);
        }
        if (this.elements.fechaFinal) {
            this.elements.fechaFinal.value = this.formatDate(endDate);
        }

        // Agregar log de preset aplicado
        this.addLog(`📅 Fechas configuradas: ${days} día${days !== 1 ? 's' : ''}`, 'info');
    }

    /**
     * Formatear fecha para input date
     */
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Obtener fechas del formulario
     */
    getDateRange() {
        if (!this.elements.fechaInicial || !this.elements.fechaFinal) {
            throw new Error('Elementos de fecha no encontrados');
        }

        return {
            startDate: this.elements.fechaInicial.value,
            endDate: this.elements.fechaFinal.value
        };
    }

    /**
     * Mostrar progreso de extracción
     */
    showProgress(current, total) {
        const percentage = Math.round((current / total) * 100);

        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = percentage + '%';
            this.elements.progressBar.textContent = percentage + '%';
            this.elements.progressBar.setAttribute('aria-valuenow', percentage);
        }

        if (this.elements.progressContainer) {
            this.elements.progressContainer.style.display = 'block';
        }
    }

    /**
     * Mostrar progreso inicial
     */
    showInitialProgress() {
        if (this.elements.progressContainer) {
            this.elements.progressContainer.style.display = 'block';
        }
        if (this.elements.progressBar) {
            this.elements.progressBar.style.width = '0%';
            this.elements.progressBar.textContent = '0%';
        }
    }

    /**
     * Ocultar progreso
     */
    hideProgress() {
        if (this.elements.progressContainer) {
            this.elements.progressContainer.style.display = 'none';
        }
    }

    /**
     * Mostrar mensaje de estado
     */
    showStatus(message, type = 'info') {
        if (!this.elements.statusMessage) return;

        // Limpiar clases anteriores
        this.elements.statusMessage.className = 'alert';

        let icon = '';
        let alertType = 'alert-info';

        switch (type) {
            case 'error':
                icon = '<i class="fas fa-times-circle me-2"></i>';
                alertType = 'alert-danger';
                break;
            case 'success':
                icon = '<i class="fas fa-check-circle me-2"></i>';
                alertType = 'alert-success';
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle me-2"></i>';
                alertType = 'alert-warning';
                break;
            default:
                icon = '<i class="fas fa-spinner fa-spin me-2"></i>';
                alertType = 'alert-info';
        }

        this.elements.statusMessage.classList.add(alertType);
        this.elements.statusMessage.innerHTML = `${icon}${message}`;
    }

    /**
     * Agregar mensaje al log
     */
    addLog(message, type = 'info') {
        if (!this.elements.logs) return;

        const p = document.createElement('p');
        p.className = 'mb-1';

        // Agregar icono según el tipo de mensaje
        let icon = '';
        switch (type) {
            case 'success':
                icon = '<i class="fas fa-check-circle text-success me-2"></i>';
                p.classList.add('success-log');
                break;
            case 'error':
                icon = '<i class="fas fa-times-circle text-danger me-2"></i>';
                p.classList.add('error-log');
                break;
            case 'warning':
                icon = '<i class="fas fa-exclamation-triangle text-warning me-2"></i>';
                p.classList.add('warning-log');
                break;
            case 'retry':
                icon = '<i class="fas fa-redo text-primary me-2"></i>';
                p.classList.add('retry-log');
                break;
            case 'cache':
                icon = '<i class="fas fa-database text-info me-2"></i>';
                p.classList.add('cache-log');
                break;
            default:
                icon = '<i class="fas fa-info-circle text-muted me-2"></i>';
        }

        p.innerHTML = `${icon}<small>[${new Date().toLocaleTimeString()}]</small> ${message}`;

        // Remover mensaje de "no hay logs" si existe
        const noLogsMsg = this.elements.logs.querySelector('.no-logs-message');
        if (noLogsMsg) {
            noLogsMsg.remove();
        }

        this.elements.logs.appendChild(p);
        this.elements.logs.scrollTop = this.elements.logs.scrollHeight;

        // Actualizar contador de logs
        this.logCount++;
        this.updateLogCount();
    }

    /**
     * Actualizar contador de logs
     */
    updateLogCount() {
        if (!this.elements.logCount) return;

        this.elements.logCount.textContent = `${this.logCount} entrada${this.logCount !== 1 ? 's' : ''}`;
    }

    /**
     * Limpiar logs
     */
    clearLogs() {
        if (this.elements.logs) {
            this.elements.logs.innerHTML = `
                <div class="no-logs-message">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Los mensajes de actividad aparecerán aquí</p>
                </div>
            `;
        }
    }

    /**
     * Actualizar estadísticas de caché
     */
    updateCacheStats(stats = null) {
        if (stats) {
            // Actualizar elementos individuales
            if (this.elements.cacheDates) {
                this.elements.cacheDates.textContent = stats.totalFechas.toLocaleString();
            }
            if (this.elements.cacheRecords) {
                this.elements.cacheRecords.textContent = stats.totalRegistros.toLocaleString();
            }
            if (this.elements.cacheSize) {
                this.elements.cacheSize.textContent = `${stats.tamanoMB} MB`;
            }

            // Actualizar timestamp de última actualización
            this.updateLastUpdateTime();
        } else {
            // Estado de carga
            if (this.elements.cacheDates) {
                this.elements.cacheDates.textContent = '-';
            }
            if (this.elements.cacheRecords) {
                this.elements.cacheRecords.textContent = '-';
            }
            if (this.elements.cacheSize) {
                this.elements.cacheSize.textContent = '-';
            }
        }
    }

    /**
     * Actualizar timestamp de última actualización
     */
    updateLastUpdateTime() {
        if (!this.elements.lastUpdate) return;

        const now = new Date();
        const timeString = now.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        this.elements.lastUpdate.textContent = timeString;
        this.lastUpdateTime = now;
    }

    /**
     * Habilitar/deshabilitar botón de extracción
     */
    setExtractButtonEnabled(enabled) {
        if (this.elements.extractBtn) {
            this.elements.extractBtn.disabled = !enabled;
        }
    }

    /**
     * Mostrar indicador de carga
     */
    showLoading(message = 'Procesando...') {
        this.showStatus(message, 'info');
    }

    /**
     * Mostrar éxito
     */
    showSuccess(message) {
        this.showStatus(message, 'success');
    }

    /**
     * Mostrar error
     */
    showError(message) {
        this.showStatus(message, 'error');
    }

    /**
     * Mostrar advertencia
     */
    showWarning(message) {
        this.showStatus(message, 'warning');
    }

    /**
     * Mostrar mensaje de extracción completada
     */
    showExtractionComplete(stats) {
        const message = `Extracción completada. ${stats.totalRecords} registros descargados`;
        this.showSuccess(message);

        if (stats.cacheHits > 0) {
            this.addLog(
                `📊 Días obtenidos desde caché: ${stats.cacheHits} de ${stats.daysProcessed} (${stats.cachePercentage}%)`,
                'cache'
            );
        }
    }

    /**
     * Mostrar panel de descarga con datos disponibles
     */
    showDownloadPanel(downloadInfo) {
        if (this.elements.downloadContainer) {
            this.elements.downloadContainer.style.display = 'block';
        }

        // Actualizar información del panel de descarga
        this.updateDownloadInfo(downloadInfo);
    }

    /**
     * Ocultar panel de descarga
     */
    hideDownloadPanel() {
        if (this.elements.downloadContainer) {
            this.elements.downloadContainer.style.display = 'none';
        }
    }

    /**
     * Actualizar información del panel de descarga
     */
    updateDownloadInfo(downloadInfo) {
        if (downloadInfo) {
            // Actualizar número de registros
            if (this.elements.downloadRecords) {
                this.elements.downloadRecords.textContent = downloadInfo.totalRecords.toLocaleString();
            }

            // Actualizar rango de fechas
            if (this.elements.downloadDateRange) {
                this.elements.downloadDateRange.textContent = `${downloadInfo.startDate} - ${downloadInfo.endDate}`;
            }
        }
    }

    /**
     * Mostrar estadísticas finales
     */
    showFinalStats(stats) {
        this.addLog(`✅ Extracción completada: ${stats.totalRecords} registros de ${stats.daysProcessed} día(s)`, 'success');

        if (stats.cacheHits > 0) {
            this.addLog(
                `📊 Días obtenidos desde caché: ${stats.cacheHits} de ${stats.daysProcessed} (${stats.cachePercentage}%)`,
                'cache'
            );
        }
    }

    /**
     * Limpiar vista para nueva extracción
     */
    clearForNewExtraction() {
        this.clearLogs();
        this.hideProgress();
        this.hideDownloadPanel();
        this.showLoading('Iniciando extracción...');
        this.logCount = 0;
        this.updateLogCount();
    }

    /**
     * Limpiar logs
     */
    clearLogs() {
        if (this.elements.logs) {
            this.elements.logs.innerHTML = `
                <div class="no-logs-message">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Los mensajes de actividad aparecerán aquí</p>
                </div>
            `;
        }
        this.logCount = 0;
        this.updateLogCount();
    }

    /**
     * Configurar callbacks para eventos
     */
    setCallbacks(callbacks) {
        this.onExtract = callbacks.onExtract;
        this.onClearCache = callbacks.onClearCache;
        this.onDownload = callbacks.onDownload;
    }

    /**
     * Destruir la vista y limpiar event listeners
     */
    destroy() {
        // Remover event listeners
        if (this.elements.extractBtn && this.eventListeners.extractBtn) {
            this.elements.extractBtn.removeEventListener('click', this.eventListeners.extractBtn);
        }

        const clearCacheBtn = document.querySelector('.btn-secondary');
        if (clearCacheBtn && this.eventListeners.clearCacheBtn) {
            clearCacheBtn.removeEventListener('click', this.eventListeners.clearCacheBtn);
        }

        // Remover event listeners de botones preset
        const presetButtons = document.querySelectorAll('.preset-btn');
        presetButtons.forEach(button => {
            const listenerKey = `preset-${button.dataset.days}`;
            if (this.eventListeners[listenerKey]) {
                button.removeEventListener('click', this.eventListeners[listenerKey]);
            }
        });

        // Remover event listener del botón de descarga
        if (this.elements.downloadBtn && this.eventListeners.downloadBtn) {
            this.elements.downloadBtn.removeEventListener('click', this.eventListeners.downloadBtn);
        }

        this.eventListeners = {};
    }
}

// Exportar para uso global
window.DataView = DataView;