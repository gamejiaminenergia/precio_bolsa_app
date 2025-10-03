// Sistema de caché robusto usando IndexedDB para almacenamiento persistente
// IndexedDB permite almacenar grandes volúmenes de datos (GB) vs localStorage (~5-10MB)

const DB_NAME = 'SIMEM_Cache_DB';
const DB_VERSION = 1;
const STORE_NAME = 'price_data';

class CacheManager {
    constructor() {
        this.db = null;
        this.initPromise = this.initDB();
    }

    // Inicializar la base de datos IndexedDB
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('Error al abrir IndexedDB:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('✅ IndexedDB inicializado correctamente');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Crear el almacén de objetos si no existe
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'fecha' });
                    objectStore.createIndex('fecha', 'fecha', { unique: true });
                    console.log('📦 Almacén de objetos creado');
                }
            };
        });
    }

    // Verificar si existe caché para una fecha específica
    async existeCacheParaFecha(fecha) {
        try {
            await this.initPromise;
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORE_NAME], 'readonly');
                const objectStore = transaction.objectStore(STORE_NAME);
                const request = objectStore.get(fecha);

                request.onsuccess = () => {
                    resolve(request.result !== undefined);
                };

                request.onerror = () => {
                    console.error('Error al verificar caché:', request.error);
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('Error en existeCacheParaFecha:', error);
            return false;
        }
    }

    // Obtener datos de la caché
    async obtenerDatosDeCache(fecha) {
        try {
            await this.initPromise;
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORE_NAME], 'readonly');
                const objectStore = transaction.objectStore(STORE_NAME);
                const request = objectStore.get(fecha);

                request.onsuccess = () => {
                    if (request.result) {
                        resolve(request.result.datos);
                    } else {
                        resolve(null);
                    }
                };

                request.onerror = () => {
                    console.error('Error al obtener datos de caché:', request.error);
                    resolve(null);
                };
            });
        } catch (error) {
            console.error('Error en obtenerDatosDeCache:', error);
            return null;
        }
    }

    // Guardar datos en la caché
    async guardarEnCache(fecha, datos) {
        try {
            await this.initPromise;
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORE_NAME], 'readwrite');
                const objectStore = transaction.objectStore(STORE_NAME);
                
                const cacheEntry = {
                    fecha: fecha,
                    datos: datos,
                    timestamp: new Date().toISOString(),
                    registros: datos.length
                };
                
                const request = objectStore.put(cacheEntry);

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = () => {
                    console.error('Error al guardar en caché:', request.error);
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('Error en guardarEnCache:', error);
            return false;
        }
    }

    // Obtener todas las fechas en caché
    async getCacheDates() {
        try {
            await this.initPromise;
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORE_NAME], 'readonly');
                const objectStore = transaction.objectStore(STORE_NAME);
                const request = objectStore.getAllKeys();

                request.onsuccess = () => {
                    resolve(request.result || []);
                };

                request.onerror = () => {
                    console.error('Error al obtener fechas de caché:', request.error);
                    resolve([]);
                };
            });
        } catch (error) {
            console.error('Error en getCacheDates:', error);
            return [];
        }
    }

    // Obtener estadísticas de la caché
    async getCacheStats() {
        try {
            await this.initPromise;
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORE_NAME], 'readonly');
                const objectStore = transaction.objectStore(STORE_NAME);
                const request = objectStore.getAll();

                request.onsuccess = () => {
                    const entries = request.result || [];
                    let totalRegistros = 0;
                    let tamanoAproximado = 0;

                    entries.forEach(entry => {
                        totalRegistros += entry.registros || 0;
                        // Calcular tamaño aproximado en bytes
                        tamanoAproximado += JSON.stringify(entry).length * 2;
                    });

                    resolve({
                        totalFechas: entries.length,
                        totalRegistros: totalRegistros,
                        tamanoBytes: tamanoAproximado,
                        tamanoMB: (tamanoAproximado / (1024 * 1024)).toFixed(2),
                        fechas: entries.map(e => ({
                            fecha: e.fecha,
                            registros: e.registros,
                            timestamp: e.timestamp
                        }))
                    });
                };

                request.onerror = () => {
                    console.error('Error al obtener estadísticas:', request.error);
                    resolve({
                        totalFechas: 0,
                        totalRegistros: 0,
                        tamanoBytes: 0,
                        tamanoMB: '0.00',
                        fechas: []
                    });
                };
            });
        } catch (error) {
            console.error('Error en getCacheStats:', error);
            return {
                totalFechas: 0,
                totalRegistros: 0,
                tamanoBytes: 0,
                tamanoMB: '0.00',
                fechas: []
            };
        }
    }

    // Limpiar toda la caché
    async limpiarCache() {
        try {
            await this.initPromise;
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORE_NAME], 'readwrite');
                const objectStore = transaction.objectStore(STORE_NAME);
                const request = objectStore.clear();

                request.onsuccess = () => {
                    console.log('🗑️ Caché limpiada correctamente');
                    resolve(true);
                };

                request.onerror = () => {
                    console.error('Error al limpiar caché:', request.error);
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('Error en limpiarCache:', error);
            return false;
        }
    }

    // Eliminar entrada específica de la caché
    async eliminarFecha(fecha) {
        try {
            await this.initPromise;
            
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([STORE_NAME], 'readwrite');
                const objectStore = transaction.objectStore(STORE_NAME);
                const request = objectStore.delete(fecha);

                request.onsuccess = () => {
                    resolve(true);
                };

                request.onerror = () => {
                    console.error('Error al eliminar fecha de caché:', request.error);
                    resolve(false);
                };
            });
        } catch (error) {
            console.error('Error en eliminarFecha:', error);
            return false;
        }
    }
}

// Crear instancia global del gestor de caché
window.cacheManager = new CacheManager();

// Mantener compatibilidad con el código anterior
window.cacheLocal = {
    existeCacheParaFecha: (fecha) => window.cacheManager.existeCacheParaFecha(fecha),
    obtenerDatosDeCache: (fecha) => window.cacheManager.obtenerDatosDeCache(fecha),
    guardarEnCache: (fecha, datos) => window.cacheManager.guardarEnCache(fecha, datos),
    getCacheDates: () => window.cacheManager.getCacheDates(),
    limpiarCache: () => window.cacheManager.limpiarCache(),
    getCacheStats: () => window.cacheManager.getCacheStats()
};