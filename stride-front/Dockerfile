# Dockerfile para stride-front (Vite + React)
FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto de Vite
EXPOSE 5173

# Comando para desarrollo con hot-reload
# El --host 0.0.0.0 permite acceder desde fuera del contenedor
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]