# ⚡ Precio Bolsa Eléctrica - Herramienta Libre y Gratuita

![Precio Bolsa Eléctrica](https://img.shields.io/badge/Sector-Energía-blue)
![Versión](https://img.shields.io/badge/Versión-2.0-green)
![Licencia](https://img.shields.io/badge/Licencia-Libre-brightgreen)
![Estado](https://img.shields.io/badge/Estado-Open%20Source-success)

## 🎯 ¿Por qué usar esta herramienta?

**La forma más simple y rápida de obtener datos del mercado eléctrico colombiano.** Sin instalaciones complicadas, registros o costos. Solo abre tu navegador y obtén los datos que necesitas en minutos.

Esta herramienta libre aprovecha la API pública de SIMEM para brindarte acceso inmediato a información histórica de precios de energía, perfecta para análisis, reportes y toma de decisiones en el sector eléctrico.

## ✨ Ventajas principales

### 🚀 **Simplicidad extrema**
- **Sin instalaciones** - Solo abre tu navegador web
- **Sin registros** - No necesitas crear cuentas o proporcionar datos personales
- **Sin costos** - Totalmente gratuito y de código abierto
- **Interfaz intuitiva** - Diseñada para que cualquiera pueda usarla

### ⚡ **Rapidez y eficiencia**
- **Extracción inteligente** - Procesa datos día por día para máxima velocidad
- **Caché automático** - Los datos se almacenan localmente para consultas futuras
- **Progreso en tiempo real** - Ve exactamente cuánto falta para completar tu descarga
- **Descarga automática** - El CSV se genera y descarga automáticamente

### 🛡️ **Confiabilidad garantizada**
- **Múltiples fuentes** - Usa diferentes servidores proxy para evitar bloqueos
- **Reintentos automáticos** - Si falla una consulta, automáticamente intenta de nuevo
- **Registro detallado** - Cada paso del proceso queda registrado para tu tranquilidad

## 📊 Variables disponibles

| Código | Descripción | Unidad |
|--------|-------------|--------|
| PB_Nal | Precio de bolsa nacional | COP/kWh |
| PB_Int | Precio de bolsa internacional | COP/kWh |
| PB_Tie | Precio de bolsa TIE (Ecuador) | COP/kWh |

## 📈 Estructura del CSV generado

El archivo CSV descargado contiene las siguientes columnas:

- **CodigoVariable:** Código de la variable (PB_Nal, PB_Int, PB_Tie)
- **FechaHora:** Fecha y hora de representación del dato
- **Valor:** Valor de la variable en COP/kWh
- **UnidadMedida:** Unidad de medida (COP/kWh)
- **Version:** Versión de la liquidación (TX1, TX2, TX3, TXR, TXF)
- **CodigoDuracion:** Código de duración en formato ISO8601 (PT1H = 1 hora)

## 🚀 Cómo usar - ¡Es realmente fácil!

### **3 pasos simples:**

1. **🔓 Abre tu navegador** - Solo abre el archivo `index.html` (sin instalaciones)
2. **📅 Elige fechas** - Selecciona el período que necesitas (desde una semana hasta varios meses)
3. **⚡ Haz clic** - Presiona "Iniciar Extracción" y listo

### **¿Qué pasa después?**
- **⏱️ Proceso automático** - La herramienta hace todo el trabajo por ti
- **📊 Progreso visible** - Ves exactamente cuánto falta en tiempo real
- **💾 Descarga automática** - El CSV se descarga automáticamente cuando termina
- **🔄 Datos listos para usar** - Abre el archivo en Excel, Python, o cualquier herramienta de análisis

**¡Todo en menos de 5 minutos!** 🚀

### ✨ Características de la Nueva Arquitectura

- **Interfaz mejorada** con mejor manejo de errores y mensajes informativos
- **Sistema de caché inteligente** que almacena datos localmente para consultas futuras
- **Progreso en tiempo real** con barra de progreso y logs detallados
- **Manejo robusto de errores** con reintentos automáticos y múltiples proxies
- **Código organizado** siguiendo las mejores prácticas de desarrollo

## 📚 Documentación de Arquitectura

Para más detalles sobre la arquitectura MVC implementada, consulta el archivo [`docs/ARQUITECTURA_MVC.md`](docs/ARQUITECTURA_MVC.md)

## 🔧 Detalles técnicos

- **Arquitectura MVC** (Modelo-Vista-Controlador) para mejor organización
- Desarrollado con HTML, CSS y JavaScript moderno con módulos ES6
- Utiliza la API pública de SIMEM para obtener los datos
- Implementa múltiples proxies CORS para evitar restricciones de acceso:
  - corsproxy.io
  - allorigins.win
  - cors-anywhere.herokuapp.com
- Sistema de reintentos configurable (máximo 3 intentos por consulta)
- Sistema de caché avanzado con IndexedDB para almacenamiento persistente

## 🏗️ Arquitectura del Proyecto

El proyecto sigue el patrón **MVC** para una mejor separación de responsabilidades:

```
src/js/mvc/
├── controllers/
│   └── DataController.js     # Coordinación y flujo
├── models/
│   └── DataModel.js         # Lógica de datos y API
└── views/
    └── DataView.js          # Interfaz y presentación
```

- **Modelo**: Maneja la comunicación con APIs y procesamiento de datos
- **Vista**: Gestiona la interfaz de usuario y eventos DOM
- **Controlador**: Coordina entre modelo y vista, maneja el flujo de la aplicación

## ⚠️ Limitaciones

- La disponibilidad de los datos depende del estado de la API de SIMEM
- Los proxies CORS utilizados pueden tener limitaciones de uso o estar temporalmente inactivos
- La extracción de grandes rangos de fechas puede tardar varios minutos

## 👨‍💻 Autor

- **Aldemar Mejía** - [mejia414@hotmail.com](mailto:mejia414@hotmail.com)

## 📄 Licencia - ¡Totalmente Libre!

Esta herramienta es **100% libre y gratuita** para uso personal, educativo, profesional y comercial. Puedes:

- ✅ **Usarla gratis** sin límites de tiempo o funcionalidades
- ✅ **Compartir** con colegas y amigos
- ✅ **Modificar** el código fuente para adaptarlo a tus necesidades
- ✅ **Distribuir** versiones modificadas (mencionando el autor original)
- ✅ **Usar en proyectos comerciales** sin restricciones

### 🤝 Contribuir al proyecto
¿Encontraste un bug o tienes una mejora? ¡Las contribuciones son bienvenidas! Esta herramienta es de la comunidad para la comunidad.

---

## ⚖️ Descargo de responsabilidad

*Esta herramienta utiliza datos públicos de SIMEM pero no está afiliada oficialmente con SIMEM o XM S.A. E.S.P. El uso de los datos es responsabilidad exclusiva del usuario.*