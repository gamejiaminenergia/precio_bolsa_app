# Usar una imagen base de Node.js para servir archivos estáticos
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración del proyecto
COPY package*.json ./

# Instalar dependencias (servidor HTTP simple)
RUN npm install

# Copiar todos los archivos de la aplicación
COPY . .

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Cambiar propietario de archivos
RUN chown -R nextjs:nodejs /app
USER nextjs

# Exponer puerto
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]