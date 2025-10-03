/**
 * Controlador de Datos - Coordina entre Modelo y Vista
 * Responsabilidades:
 * - Manejar eventos de la vista
 * - Coordinar flujo de datos entre modelo y vista
 * - Gestionar estado de la aplicación
 * - Controlar el flujo de la aplicación
 */
class DataController {
    constructor() {
        this.model = null;
        this.view = null;
        this.cacheManager = null;
        this.lastExtractedData = null;
        this.lastExtractionInfo = null;
    }

    /**
     * Inicializar el controlador
     */
    async initialize() {
        // Inicializar el gestor de caché
        this.cacheManager = window.cacheManager;

        // Inicializar el modelo
        this.model = new DataModel();
        this.model.initialize(this.cacheManager);

        // Inicializar la vista
        this.view = new DataView();
        this.view.initialize();

        // Configurar callbacks de la vista
        this.view.setCallbacks({
            onExtract: () => this.handleExtract(),
            onClearCache: () => this.handleClearCache(),
            onDownload: () => this.handleDownload()
        });

        // Mostrar estadísticas iniciales de caché
        await this.updateCacheStats();

        console.log('✅ Controlador inicializado correctamente');
    }

    /**
     * Manejar evento de extracción de datos con progreso en tiempo real
     */
    async handleExtract() {
        try {
            // Obtener fechas de la vista
            const { startDate, endDate } = this.view.getDateRange();

            // Limpiar vista para nueva extracción
            this.view.clearForNewExtraction();

            // Mostrar progreso inicial
            this.view.showInitialProgress();

            // Iniciar extracción
            this.view.showLoading('Iniciando extracción...');
            this.view.setExtractButtonEnabled(false);

            // Verificar inicialización del sistema de caché
            if (this.cacheManager) {
                this.view.addLog("Sistema de caché IndexedDB inicializado correctamente", "info");
            } else {
                this.view.addLog("Advertencia: Sistema de caché no disponible", "warning");
            }

            // Ejecutar extracción con callback de progreso
            const result = await this.model.extractData(startDate, endDate, (progress) => {
                // Actualizar barra de progreso
                this.view.showProgress(progress.dayIndex, progress.totalDays);

                // Mostrar información detallada del día actual
                if (progress.fromCache) {
                    this.view.addLog(`📂 ${progress.day}: ${progress.recordsInDay} registros obtenidos desde caché`, 'cache');
                } else {
                    this.view.addLog(`📡 ${progress.day}: ${progress.recordsInDay} registros obtenidos desde API`, 'success');
                }

                // Actualizar estado
                this.view.showLoading(`Procesando día ${progress.dayIndex}/${progress.totalDays} (${progress.percentage}%)...`);
            });

            if (result.success) {
                // Mostrar progreso final
                this.view.showProgress(100, 100);

                // Mostrar estadísticas finales
                this.view.showFinalStats(result.stats);

                // Actualizar estadísticas de caché
                await this.updateCacheStats();

                // Almacenar datos de la extracción exitosa
                if (result.data.length > 0) {
                    this.lastExtractedData = result.data;
                    this.lastExtractionInfo = {
                        totalRecords: result.stats.totalRecords,
                        startDate: startDate,
                        endDate: endDate,
                        extractionDate: new Date().toISOString()
                    };

                    // Mostrar panel de descarga con los datos disponibles
                    this.view.showDownloadPanel(this.lastExtractionInfo);

                    const csvContent = this.model.convertToCSV(result.data);
                    const filename = `precios_bolsa_${this.model.formatDate(new Date(startDate))}_${this.model.formatDate(new Date(endDate))}.csv`;
                    this.model.downloadCSV(csvContent, filename);

                    this.view.addLog(`📥 Archivo CSV descargado: ${filename}`, "success");
                    this.view.showExtractionComplete(result.stats);
                } else {
                    this.view.showWarning("No se obtuvieron datos para descargar");
                }
            } else {
                this.view.showError(result.error);
                this.view.addLog(`❌ Error en extracción: ${result.error}`, 'error');
            }

        } catch (error) {
            this.view.showError(error.message);
            this.view.addLog(`❌ Error: ${error.message}`, 'error');
        } finally {
            this.view.setExtractButtonEnabled(true);
        }
    }

    /**
     * Manejar evento de limpiar caché
     */
    async handleClearCache() {
        try {
            if (!this.cacheManager) {
                this.view.showError('Sistema de caché no disponible');
                return;
            }

            const stats = await this.model.getCacheStats();

            if (stats.totalFechas === 0) {
                this.view.showWarning('La caché ya está vacía');
                return;
            }

            const confirmMessage = `¿Estás seguro de que deseas limpiar toda la caché?\n\n` +
                `Se eliminarán:\n` +
                `- ${stats.totalFechas} fechas\n` +
                `- ${stats.totalRegistros} registros\n` +
                `- ${stats.tamanoMB} MB de datos\n\n` +
                `Esta acción no se puede deshacer.`;

            if (confirm(confirmMessage)) {
                const result = await this.model.clearCache();

                if (result) {
                    this.view.addLog('🗑️ Caché limpiada correctamente', 'success');
                    await this.updateCacheStats();
                    this.view.showSuccess('Caché limpiada exitosamente');
                } else {
                    this.view.showError('Error al limpiar la caché');
                    this.view.addLog('❌ Error al limpiar la caché', 'error');
                }
            }
        } catch (error) {
            this.view.showError(error.message);
            this.view.addLog(`❌ Error al limpiar caché: ${error.message}`, 'error');
        }
    }

    /**
     * Actualizar estadísticas de caché en la vista
     */
    async updateCacheStats() {
        try {
            const stats = await this.model.getCacheStats();
            this.view.updateCacheStats(stats);
        } catch (error) {
            console.error('Error al actualizar estadísticas de caché:', error);
        }
    }

    /**
     * Manejar evento de descarga manual de datos
     */
    handleDownload() {
        if (!this.lastExtractedData || this.lastExtractedData.length === 0) {
            this.view.showWarning("No hay datos disponibles para descargar. Realice una extracción primero.");
            return;
        }

        try {
            const csvContent = this.model.convertToCSV(this.lastExtractedData);
            const filename = `precios_bolsa_${this.model.formatDate(new Date(this.lastExtractionInfo.startDate))}_${this.model.formatDate(new Date(this.lastExtractionInfo.endDate))}.csv`;
            this.model.downloadCSV(csvContent, filename);

            this.view.addLog(`📥 Archivo CSV descargado manualmente: ${filename}`, "success");
        } catch (error) {
            this.view.showError("Error al generar el archivo CSV");
            this.view.addLog(`❌ Error en descarga manual: ${error.message}`, 'error');
        }
    }

    /**
     * Obtener estadísticas actuales
     */
    async getStats() {
        return await this.model.getCacheStats();
    }

    /**
     * Destruir el controlador
     */
    destroy() {
        if (this.view) {
            this.view.destroy();
        }
    }
}

// Función global para inicializar la aplicación
window.initializeApp = async function() {
    const controller = new DataController();
    await controller.initialize();
    return controller;
};

// Auto-inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
    try {
        window.appController = await window.initializeApp();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
    }
});

// Exportar para uso global
window.DataController = DataController;