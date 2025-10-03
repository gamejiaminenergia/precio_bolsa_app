# Arquitectura MVC - Extractor de Precios de Bolsa SIMEM

## 📋 Descripción General

Este proyecto implementa el patrón de arquitectura **Modelo-Vista-Controlador (MVC)** para mejorar la organización, mantenibilidad y escalabilidad del código.

## 🏗️ Estructura de la Arquitectura

```
src/js/mvc/
├── controllers/
│   └── DataController.js     # Coordinación entre modelo y vista
├── models/
│   └── DataModel.js          # Modelo de datos y lógica de negocio
├── views/
│   └── DataView.js           # Manejo de interfaz y presentación
└── services/                 # Servicios adicionales (futuro)
```

## 🎯 Responsabilidades de Cada Componente

### Modelo (Model) - `DataModel.js`

**Responsabilidades:**
- ✅ Comunicación con la API de SIMEM
- ✅ Procesamiento y formateo de datos
- ✅ Gestión del sistema de caché
- ✅ Validación de datos de entrada
- ✅ Lógica de negocio relacionada con datos
- ✅ Generación de archivos CSV
- ✅ Manejo de errores de red y reintentos

**Métodos principales:**
- `extractData(startDate, endDate)` - Extrae datos para un rango de fechas
- `fetchDataForDate(date)` - Obtiene datos para una fecha específica
- `convertToCSV(records)` - Convierte datos a formato CSV
- `validateDateRange(startDate, endDate)` - Valida fechas de entrada

### Vista (View) - `DataView.js`

**Responsabilidades:**
- ✅ Actualización del DOM
- ✅ Manejo de eventos de usuario
- ✅ Mostrar progreso y mensajes de estado
- ✅ Gestión de elementos de la interfaz
- ✅ Formateo de mensajes para el usuario

**Métodos principales:**
- `showProgress(current, total)` - Muestra barra de progreso
- `addLog(message, type)` - Agrega mensajes al log
- `showStatus(message, type)` - Muestra mensajes de estado
- `getDateRange()` - Obtiene fechas del formulario
- `setCallbacks(callbacks)` - Configura callbacks de eventos

### Controlador (Controller) - `DataController.js`

**Responsabilidades:**
- ✅ Coordinación entre Modelo y Vista
- ✅ Manejo del flujo de la aplicación
- ✅ Gestión del estado global
- ✅ Respuesta a eventos de usuario
- ✅ Control de errores de alto nivel

**Métodos principales:**
- `initialize()` - Inicializa la aplicación
- `handleExtract()` - Maneja el proceso de extracción
- `handleClearCache()` - Maneja limpieza de caché
- `updateCacheStats()` - Actualiza estadísticas mostradas

## 🔄 Flujo de Trabajo

### Proceso de Extracción de Datos:

1. **Usuario** hace clic en "Extraer Datos"
2. **Vista** captura el evento y obtiene las fechas
3. **Vista** notifica al **Controlador** mediante callback
4. **Controlador** valida y prepara los datos
5. **Controlador** llama al **Modelo** para ejecutar la extracción
6. **Modelo** procesa los datos y maneja la API
7. **Modelo** devuelve resultados al **Controlador**
8. **Controlador** actualiza la **Vista** con el progreso y resultados
9. **Vista** muestra el progreso y mensajes al usuario

### Flujo Visual:
```
Usuario → Vista → Controlador → Modelo → API
   ↘️           ↙️           ↙️
   ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

## 🎨 Patrón Observer

La arquitectura utiliza un patrón **Observer** para la comunicación:

- **Vista** observa eventos del usuario
- **Controlador** observa eventos de la **Vista**
- **Modelo** notifica progreso al **Controlador**
- **Controlador** actualiza la **Vista** con cambios

## 💡 Beneficios de la Arquitectura

### ✅ Ventajas Implementadas:

1. **Separación de responsabilidades**
   - Cada componente tiene un propósito único
   - Código más fácil de entender y mantener

2. **Reutilización de código**
   - El modelo puede ser usado por diferentes vistas
   - La lógica de negocio está centralizada

3. **Facilidad de testing**
   - Cada componente puede ser testeado independientemente
   - Mocking más sencillo

4. **Mantenibilidad**
   - Cambios en la UI no afectan la lógica de negocio
   - Cambios en la API solo requieren modificar el modelo

5. **Escalabilidad**
   - Fácil agregar nuevas funcionalidades
   - Estructura preparada para crecimiento

## 🔧 Configuración y Uso

### Inicialización Automática:

```javascript
// El controlador se inicializa automáticamente cuando carga la página
document.addEventListener('DOMContentLoaded', async () => {
    window.appController = await window.initializeApp();
});
```

### Uso Manual:

```javascript
// Crear e inicializar controlador manualmente
const controller = new DataController();
await controller.initialize();
```

## 📊 Gestión del Estado

### Estado Centralizado:
- El **Controlador** mantiene el estado global de la aplicación
- La **Vista** refleja el estado actual al usuario
- El **Modelo** maneja el estado de los datos

### Estados Principales:
- `isExtracting` - Indica si hay una extracción en proceso
- `cacheManager` - Estado del sistema de caché
- `currentProgress` - Progreso actual de la operación

## 🚀 Mejores Prácticas Implementadas

1. **Inyección de Dependencias**
   - El modelo recibe el cacheManager como dependencia
   - Fácil de mockear para testing

2. **Manejo de Errores**
   - Cada capa maneja sus errores apropiadamente
   - El controlador centraliza el manejo de errores de usuario

3. **Callbacks y Eventos**
   - Comunicación desacoplada entre componentes
   - Fácil agregar nuevos observadores

4. **Destrucción Limpia**
   - Cada componente puede ser destruido correctamente
   - Limpieza de event listeners

## 🔮 Posibles Extensiones

### Servicios Adicionales:
- **ApiService** - Abstracción de llamadas HTTP
- **CacheService** - Gestión avanzada de caché
- **ExportService** - Diferentes formatos de exportación
- **ValidationService** - Validaciones complejas

### Nuevas Vistas:
- **ChartView** - Visualización de gráficos
- **TableView** - Vista tabular de datos
- **SettingsView** - Configuración de aplicación

## 📝 Notas de Desarrollo

- La arquitectura mantiene compatibilidad con el código existente
- Los archivos originales se mantienen como referencia
- La transición puede ser gradual
- Fácil rollback si es necesario

---

*Esta arquitectura proporciona una base sólida para el mantenimiento y crecimiento futuro de la aplicación.*