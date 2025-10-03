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
             downloadDateRange: document.getElementById('downloadDateRange'),
             // Elementos de gráficos
             visualizationContainer: document.getElementById('visualizationContainer'),
             chartDiv: document.getElementById('chart_div'),
             chartTypeLine: document.getElementById('chartTypeLine'),
             chartTypeBar: document.getElementById('chartTypeBar'),
             chartTypeColumn: document.getElementById('chartTypeColumn'),
             viewModeChart: document.getElementById('viewModeChart'),
             refreshChart: document.getElementById('refreshChart'),
             exportChart: document.getElementById('exportChart'),
             chartDataPoints: document.getElementById('chartDataPoints'),
             chartDateRange: document.getElementById('chartDateRange')
         };

        this.eventListeners = {};
        this.logCount = 0;
        this.lastUpdateTime = null;

        // Propiedades para gráficos
        this.chartData = [];
        this.currentChartType = 'line';
        this.currentViewMode = 'chart';
        this.chart = null;
        this.googleChartsLoaded = false;
    }

    /**
     * Inicializar la vista
     */
    initialize() {
        this.setupEventListeners();
        this.setupChartEventListeners();
        this.initializeGoogleCharts();
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
     * Configurar event listeners específicos de gráficos
     */
    setupChartEventListeners() {
        // Event listeners para cambio de tipo de gráfico
        if (this.elements.chartTypeLine) {
            this.eventListeners.chartTypeLine = () => {
                this.currentChartType = 'line';
                this.updateChart();
            };
            this.elements.chartTypeLine.addEventListener('change', this.eventListeners.chartTypeLine);
        }

        if (this.elements.chartTypeBar) {
            this.eventListeners.chartTypeBar = () => {
                this.currentChartType = 'bar';
                this.updateChart();
            };
            this.elements.chartTypeBar.addEventListener('change', this.eventListeners.chartTypeBar);
        }

        if (this.elements.chartTypeColumn) {
            this.eventListeners.chartTypeColumn = () => {
                this.currentChartType = 'column';
                this.updateChart();
            };
            this.elements.chartTypeColumn.addEventListener('change', this.eventListeners.chartTypeColumn);
        }

        // Event listeners para cambio de modo de vista
        if (this.elements.viewModeChart) {
            this.eventListeners.viewModeChart = () => {
                this.currentViewMode = 'chart';
                this.showChartView();
            };
            this.elements.viewModeChart.addEventListener('change', this.eventListeners.viewModeChart);
        }

        // Event listener para actualizar gráfico
        if (this.elements.refreshChart) {
            this.eventListeners.refreshChart = () => {
                this.refreshChart();
            };
            this.elements.refreshChart.addEventListener('click', this.eventListeners.refreshChart);
        }

        // Event listener para exportar gráfico
        if (this.elements.exportChart) {
            this.eventListeners.exportChart = () => {
                this.exportChartImage();
            };
            this.elements.exportChart.addEventListener('click', this.eventListeners.exportChart);
        }
    }

    /**
     * Inicializar Google Charts
     */
    initializeGoogleCharts() {
        if (typeof google === 'undefined') {
            this.addLog('❌ Error: Google Charts no está disponible', 'error');
            return;
        }

        google.charts.load('current', {
            'packages': ['corechart', 'line', 'bar'],
            'language': 'es'
        });

        google.charts.setOnLoadCallback(() => {
            this.googleChartsLoaded = true;
            this.addLog('✅ Google Charts inicializado correctamente', 'success');
        });
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
     * Mostrar datos (gráficos)
     */
    showData(data) {
        this.chartData = data || [];

        // Mostrar contenedor de visualización
        if (this.elements.visualizationContainer) {
            this.elements.visualizationContainer.style.display = 'block';
        }

        this.updateChart();
        this.updateChartInfo();
    }


    /**
     * Ocultar visualización
     */
    hideVisualization() {
        if (this.elements.visualizationContainer) {
            this.elements.visualizationContainer.style.display = 'none';
        }
    }


    /**
     * Actualizar gráfico
     */
    updateChart() {
        if (!this.googleChartsLoaded || !this.chartData || this.chartData.length === 0) {
            this.showEmptyChart();
            return;
        }

        if (!this.elements.chartDiv) return;

        try {
            const data = this.prepareChartData();
            const options = this.getChartOptions();

            switch (this.currentChartType) {
                case 'line':
                    this.chart = new google.visualization.LineChart(this.elements.chartDiv);
                    break;
                case 'bar':
                    this.chart = new google.visualization.BarChart(this.elements.chartDiv);
                    break;
                case 'column':
                    this.chart = new google.visualization.ColumnChart(this.elements.chartDiv);
                    break;
                default:
                    this.chart = new google.visualization.LineChart(this.elements.chartDiv);
            }

            this.chart.draw(data, options);
        } catch (error) {
            this.addLog(`❌ Error al actualizar gráfico: ${error.message}`, 'error');
        }
    }

    /**
     * Preparar datos para el gráfico
     */
    prepareChartData() {
        const data = new google.visualization.DataTable();

        // Agregar columnas
        data.addColumn('datetime', 'Fecha y Hora');
        data.addColumn('number', 'Precio Nacional (PB_Nal)');
        data.addColumn('number', 'Precio Internacional (PB_Int)');
        data.addColumn('number', 'Precio TIE (PB_Tie)');

        // Preparar datos agrupados por fecha
        const groupedData = {};

        this.chartData.forEach(row => {
            const date = new Date(row.FechaHora);
            const dateKey = date.toISOString().split('T')[0];

            if (!groupedData[dateKey]) {
                groupedData[dateKey] = {
                    date: date,
                    PB_Nal: null,
                    PB_Int: null,
                    PB_Tie: null
                };
            }

            if (row.CodigoVariable === 'PB_Nal') {
                groupedData[dateKey].PB_Nal = parseFloat(row.Valor) || 0;
            } else if (row.CodigoVariable === 'PB_Int') {
                groupedData[dateKey].PB_Int = parseFloat(row.Valor) || 0;
            } else if (row.CodigoVariable === 'PB_Tie') {
                groupedData[dateKey].PB_Tie = parseFloat(row.Valor) || 0;
            }
        });

        // Convertir a array y ordenar por fecha
        const chartRows = Object.values(groupedData)
            .filter(row => row.PB_Nal !== null || row.PB_Int !== null || row.PB_Tie !== null)
            .sort((a, b) => a.date - b.date)
            .slice(-100); // Limitar a últimos 100 puntos para mejor rendimiento

        chartRows.forEach(row => {
            data.addRow([
                row.date,
                row.PB_Nal,
                row.PB_Int,
                row.PB_Tie
            ]);
        });

        return data;
    }

    /**
     * Obtener opciones del gráfico
     */
    getChartOptions() {
        const baseOptions = {
            title: 'Precios de Bolsa Eléctrica',
            titleTextStyle: {
                fontSize: 18,
                bold: true,
                color: '#495057'
            },
            backgroundColor: 'transparent',
            legend: {
                position: 'top',
                textStyle: {
                    color: '#6c757d'
                }
            },
            colors: ['#007bff', '#28a745', '#ffc107'],
            hAxis: {
                title: 'Fecha y Hora',
                titleTextStyle: {
                    color: '#6c757d'
                },
                textStyle: {
                    color: '#6c757d'
                },
                format: 'dd/MM/yy'
            },
            vAxis: {
                title: 'Precio (COP/kWh)',
                titleTextStyle: {
                    color: '#6c757d'
                },
                textStyle: {
                    color: '#6c757d'
                },
                format: 'decimal'
            },
            chartArea: {
                backgroundColor: 'transparent',
                width: '80%',
                height: '70%'
            },
            height: 500,
            width: '100%'
        };

        // Opciones específicas por tipo de gráfico
        switch (this.currentChartType) {
            case 'line':
                return {
                    ...baseOptions,
                    curveType: 'function',
                    lineWidth: 3,
                    pointSize: 4
                };
            case 'bar':
                return {
                    ...baseOptions,
                    bar: {
                        groupWidth: '75%'
                    }
                };
            case 'column':
                return {
                    ...baseOptions,
                    bar: {
                        groupWidth: '75%'
                    }
                };
            default:
                return baseOptions;
        }
    }

    /**
     * Mostrar gráfico vacío
     */
    showEmptyChart() {
        if (!this.elements.chartDiv) return;

        this.elements.chartDiv.innerHTML = `
            <div class="empty-chart-message">
                <i class="fas fa-chart-line fa-3x text-muted mb-3"></i>
                <p class="text-muted">No hay datos para mostrar en el gráfico</p>
                <small class="text-muted">Realice una extracción de datos para ver el gráfico</small>
            </div>
        `;
    }

    /**
     * Actualizar información del gráfico
     */
    updateChartInfo() {
        if (this.elements.chartDataPoints) {
            this.elements.chartDataPoints.textContent = this.chartData.length.toLocaleString();
        }

        if (this.elements.chartDateRange && this.chartData.length > 0) {
            const dates = this.chartData.map(row => new Date(row.FechaHora));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));

            const formatDate = (date) => {
                return date.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            };

            this.elements.chartDateRange.textContent = `${formatDate(minDate)} - ${formatDate(maxDate)}`;
        }
    }

    /**
     * Mostrar vista de gráfico
     */
    showChartView() {
        if (this.elements.tableContainer) {
            this.elements.tableContainer.style.display = 'none';
        }
        if (this.elements.visualizationContainer) {
            this.elements.visualizationContainer.style.display = 'block';
        }
        this.updateChart();
    }


    /**
     * Refrescar gráfico
     */
    refreshChart() {
        this.updateChart();
        this.updateChartInfo();
        this.addLog('📊 Gráfico actualizado', 'info');
    }

    /**
     * Exportar imagen del gráfico
     */
    exportChartImage() {
        if (!this.chart) {
            this.showWarning('No hay gráfico para exportar');
            return;
        }

        try {
            const chartContainer = this.elements.chartDiv;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Configurar canvas con el tamaño del gráfico
            canvas.width = chartContainer.offsetWidth;
            canvas.height = chartContainer.offsetHeight;

            // Crear imagen base64 del gráfico
            const imgData = this.chart.getImageURI();

            const img = new Image();
            img.onload = () => {
                ctx.drawImage(img, 0, 0);

                // Crear enlace de descarga
                const link = document.createElement('a');
                link.download = `grafico_precios_${new Date().toISOString().slice(0, 10)}.png`;
                link.href = canvas.toDataURL();
                link.click();
            };
            img.src = imgData;

            this.addLog('📷 Gráfico exportado correctamente', 'success');
        } catch (error) {
            this.showError('Error al exportar gráfico');
            this.addLog(`❌ Error en exportación de gráfico: ${error.message}`, 'error');
        }
    }





    /**
     * Formatear código de variable
     */
    formatVariableCode(code) {
        const codes = {
            'PB_Nal': 'Nacional',
            'PB_Int': 'Internacional',
            'PB_Tie': 'TIE'
        };
        return codes[code] || code;
    }

    /**
     * Formatear fecha y hora
     */
    formatDateTime(dateTime) {
        try {
            const date = new Date(dateTime);
            return date.toLocaleString('es-ES', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        } catch (error) {
            return dateTime;
        }
    }

    /**
     * Formatear número
     */
    formatNumber(value) {
        const num = parseFloat(value);
        if (isNaN(num)) return value;
        return num.toLocaleString('es-ES', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
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
        this.hideVisualization();
        this.showEmptyChart();
        this.showLoading('Iniciando extracción...');
        this.logCount = 0;
        this.updateLogCount();

        // Limpiar datos de gráficos
        this.chartData = [];
        this.currentChartType = 'line';
        this.currentViewMode = 'chart';
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