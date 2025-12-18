# API Gateway

API Gateway que actúa como punto de entrada centralizado para rutas protegidas. Utiliza Supabase para autenticación y valida tokens JWT en los headers de las solicitudes.

## Requisitos

- Python 3.8+
- pip

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd Apigateway
```

2. Instala las dependencias:
```bash
pip install -r requirements.txt
```

3. Crea un archivo `.env` con tus credenciales de Supabase:
```env
# Supabase Configuration
VITE_SUPABASE_URL= tu url
VITE_SUPABASE_ANON_KEY= tu anon key

# comentar si se va a usar localhost o cambiar si se va a desplegar 
#PRODUCTS_SERVICE_URL=http://product:5000
#CART_SERVICE_URL=http://cart:5001
#ORDER_SERVICE_URL=http://order:5002
#PAYMENT_SERVICE_URL=http://payment:5003
```

## Inicio rápido

Ejecuta el servidor:
```bash
fastapi dev main.py
```

El servidor estará disponible en `http://localhost:8000`

## Rutas disponibles

- `GET /example` - Acceso protegido. Requiere header `Authorization: Bearer <token>`
- consulta main.py prar ver todas las rutas disponibles 
