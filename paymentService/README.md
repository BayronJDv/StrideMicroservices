# Payment Service

## Descripción

Microservicio encargado del procesamiento de pagos. Gestiona transacciones de pago y envío de recibos por correo electrónico.

## Tecnología

- **Framework**: Express (Node.js)
- **Base de datos**: Supabase
- **Email**: Nodemailer
- **Logging**: Morgan

## Requisitos

- Node.js 14+
- npm o yarn
- Dependencias listadas en `package.json`

## Instalación Local

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   
   Crear archivo `.env` con las siguientes variables:
   ```
   VITE_SUPABASE_URL=tu_supabase_url
   VITE_SUPABASE_ANON_KEY=tu_supabase_key
   SMTP_HOST=tu_smtp_host
   SMTP_PORT=tu_smtp_port
   SMTP_USER=tu_smtp_user
   SMTP_PASS=tu_smtp_password
   ```

3. **Ejecutar el servicio**
   ```bash
   node server.js
   ```

   El servicio se ejecutará en `http://localhost:5003`

## Endpoints Principales

- `GET /` - Verificar estado del servicio
- Consulta `server.js` para ver todos los endpoints disponibles

## Docker

Para ejecutar en contenedor:
```bash
docker build -t payment-service .
docker run -p 5003:5003 --env-file .env payment-service
```
