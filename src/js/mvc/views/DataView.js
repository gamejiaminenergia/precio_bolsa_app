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
            cacheStats: document.getElementById('cacheStats')
        };

        this.eventListeners = {};
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

        this.elements.statusMessage.className = 'status-message';

        let icon = '';
        switch (type) {
            case 'error':
                icon = '❌';
                this.elements.statusMessage.classList.add('error');
                break;
            case 'success':
                icon = '✅';
                this.elements.statusMessage.classList.add('success');
                break;
            case 'warning':
                icon = '⚠️';
                this.elements.statusMessage.classList.add('warning');
                break;
            default:
                icon = '<span class="spinner"></span>';
        }

        this.elements.statusMessage.innerHTML = `<p>${icon} ${message}</p>`;
    }

    /**
     * Agregar mensaje al log
     */
    addLog(message, type = 'info') {
        if (!this.elements.logs) return;

        const p = document.createElement('p');

        switch (type) {
            case 'success':
                p.className = 'success-log';
                break;
            case 'error':
                p.className = 'error-log';
                break;
            case 'warning':
                p.className = 'warning-log';
                break;
            case 'retry':
                p.className = 'retry-log';
                break;
            case 'cache':
                p.className = 'cache-log';
                break;
        }

        p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
        this.elements.logs.appendChild(p);
        this.elements.logs.scrollTop = this.elements.logs.scrollHeight;
    }

    /**
     * Limpiar logs
     */
    clearLogs() {
        if (this.elements.logs) {
            this.elements.logs.innerHTML = '';
        }
    }

    /**
     * Actualizar estadísticas de caché
     */
    updateCacheStats(stats = null) {
        if (!this.elements.cacheStats) return;

        if (stats) {
            this.elements.cacheStats.innerHTML = `
                <strong>📊 Estadísticas de Caché:</strong><br>
                Fechas almacenadas: ${stats.totalFechas}<br>
                Total registros: ${stats.totalRegistros.toLocaleString()}<br>
                Tamaño: ${stats.tamanoMB} MB
            `;
        } else {
            this.elements.cacheStats.innerHTML = `
                <strong>📊 Estadísticas de Caché:</strong><br>
                Cargando...
            `;
        }
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
        this.showLoading('Iniciando extracción...');
    }

    /**
     * Configurar callbacks para eventos
     */
    setCallbacks(callbacks) {
        this.onExtract = callbacks.onExtract;
        this.onClearCache = callbacks.onClearCache;
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

        this.eventListeners = {};
    }
}

// Exportar para uso global
window.DataView = DataView;