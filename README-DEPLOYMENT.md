# 🚀 Despliegue en Render.com

Este documento explica cómo desplegar la aplicación **Precio Bolsa Eléctrica** en [Render.com](https://render.com/).

## 📋 Prerrequisitos

- Cuenta activa en [Render.com](https://render.com/)
- Repositorio Git (GitHub, GitLab, Bitbucket)
- Conocimientos básicos de Git

## 🏗️ Archivos de Despliegue

Los siguientes archivos han sido creados para facilitar el despliegue:

### `Dockerfile`
- Basado en Node.js 18 Alpine (imagen ligera)
- Configura usuario no-root por seguridad
- Expone puerto 3000
- Instala dependencias y copia archivos de la aplicación

### `server.js`
- Servidor HTTP simple usando Express.js
- Sirve archivos estáticos desde la raíz del proyecto
- Configura headers de seguridad y caché
- Manejo de rutas SPA (Single Page Application)

### `render.yaml`
- Configuración específica para Render.com
- Define servicio web tipo Node.js
- Configura health checks automáticos
- Variables de entorno optimizadas

### `package.json`
- Dependencias mínimas (solo Express para el servidor)
- Scripts de inicio y desarrollo
- Información del proyecto

### `.dockerignore`
- Excluye archivos innecesarios del contexto de construcción
- Reduce tiempo de construcción y tamaño de imagen

## 🚀 Pasos para Desplegar

### 1. Preparar Repositorio

```bash
# Asegurar que todos los archivos estén en Git
git add .
git commit -m "Add deployment files for Render.com"
git push origin main
```

### 2. Crear Servicio Web en Render.com

1. **Iniciar sesión** en [Render.com](https://dashboard.render.com/)
2. Hacer clic en **"New +"** → **"Web Service"**
3. **Conectar repositorio** Git
4. Render detectará automáticamente la configuración

### 3. Configuración del Servicio

Render debería detectar automáticamente:
- **Runtime**: Node.js
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Port**: 3000

### 4. Variables de Entorno (Opcional)

Si necesitas personalizar, agrega estas variables en Render:

```bash
NODE_ENV=production
PORT=3000
```

### 5. Desplegar

1. Hacer clic en **"Create Web Service"**
2. Esperar la construcción automática (2-3 minutos)
3. ¡Tu aplicación estará disponible!

## 🌐 URL de la Aplicación

Una vez desplegada, tu aplicación estará disponible en:
```
https://tu-app.onrender.com
```

## 🔧 Características del Despliegue

### ✅ Optimizaciones Incluidas

- **Imagen Docker optimizada** (Alpine Linux)
- **Caché inteligente** para archivos estáticos
- **Headers de seguridad** configurados
- **Compresión automática** de archivos
- **Health checks** automáticos
- **Usuario no-root** por seguridad

### 📊 Recursos Asignados

- **RAM**: 512 MB (suficiente para aplicación web)
- **CPU**: Compartido (adecuado para tráfico normal)
- **Disco**: 1 GB (para caché de datos)

### 💰 Costo Estimado

- **Plan gratuito**: $0/mes
- **Límite**: 750 horas/mes
- **Características**: Despliegues automáticos, HTTPS, dominio personalizado

## 🛠️ Comandos Útiles

### Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor local
npm start

# Ver aplicación en navegador
# http://localhost:3000
```

### Despliegue

```bash
# Construir imagen localmente (opcional)
docker build -t precio-bolsa-app .

# Ejecutar contenedor localmente (opcional)
docker run -p 3000:3000 precio-bolsa-app
```

## 🔍 Monitoreo y Logs

### En Render.com:

1. **Dashboard** → Tu servicio → **Logs**
2. **Métricas** de uso de recursos
3. **Health checks** automáticos cada 60 segundos

### Logs Incluyen:

- Estado del servidor
- Errores de aplicación
- Uso de recursos
- Health checks

## 🚨 Solución de Problemas

### Problema: Error 404 en rutas
**Solución**: El servidor maneja rutas SPA automáticamente, redirigiendo todo a `index.html`

### Problema: Archivos estáticos no cargan
**Solución**: Verificar que las rutas en `index.html` sean correctas (rutas absolutas desde raíz)

### Problema: Construcción falla
**Solución**: Verificar que `package.json` y `Dockerfile` estén correctos

### Problema: Aplicación lenta
**Solución**: Los headers de caché están configurados para optimizar carga de archivos estáticos

## 📞 Soporte

- **Render.com**: [Documentación oficial](https://render.com/docs)
- **Contacto desarrollador**: mejia414@hotmail.com
- **Repositorio**: [GitHub](https://github.com/usuario/precio-bolsa-app)

## 🔄 Actualizaciones

Para actualizar la aplicación:

1. Hacer cambios en tu repositorio
2. `git push` los cambios
3. Render desplegará automáticamente
4. La nueva versión estará disponible en 2-3 minutos

---

**¡Feliz despliegue! 🚀**