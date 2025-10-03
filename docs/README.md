# Extractor de Precios de Bolsa SIMEM

![Extractor de Precios de Bolsa](https://img.shields.io/badge/Sector-Energía-blue)
![Versión](https://img.shields.io/badge/Versión-1.0-green)

## 📋 Descripción

Herramienta web para extraer datos de precios de bolsa del Sistema de Intercambios del Mercado Eléctrico Mayorista (SIMEM) de Colombia. Permite obtener información histórica de precios de energía en diferentes modalidades (nacional, internacional y TIE) para análisis y reportes del sector eléctrico.

## ✨ Características

- **Extracción de datos** por rango de fechas personalizable
- **Descarga automática** en formato CSV
- **Sistema de reintentos** para garantizar la obtención de datos
- **Múltiples proxies CORS** para evitar restricciones de acceso
- **Interfaz intuitiva** con información detallada sobre las variables
- **Visualización en tiempo real** del progreso de extracción
- **Registro de actividad** con mensajes informativos, advertencias y errores

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

## 🚀 Cómo usar

1. Abre el archivo `index.html` en tu navegador web
2. Selecciona la **Fecha Inicial** y **Fecha Final** para el rango de datos que deseas extraer
3. Haz clic en el botón **Extraer Datos**
4. Espera a que se complete el proceso de extracción
5. El archivo CSV se descargará automáticamente con el nombre `precios_bolsa_FECHA-INICIAL_FECHA-FINAL.csv`

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

## 📄 Licencia

Este proyecto es de uso libre para fines educativos y profesionales.

---

*Nota: Esta herramienta no está afiliada oficialmente con SIMEM o XM S.A. E.S.P.*