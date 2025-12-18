# Usar imagen base de Node.js
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar código de la aplicación
COPY . .

# Exponer puerto
EXPOSE 5003

# Comando para ejecutar la aplicación
CMD ["node", "server.js"]
