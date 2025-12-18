# Stride — E-commerce Microservices Project

## Descripción

Stride es un e-commerce construido como proyecto de curso que demuestra una arquitectura basada en microservicios. El sistema agrupa servicios especializados (productos, carrito, órdenes, pagos) y un API Gateway que centraliza autenticación y orquestación de flujos críticos como el checkout.

Este README cumple con los requisitos del enunciado: describe patrones de diseño, decisiones de orquestación, detalles de implementación, monitoreo, pruebas y pasos para ejecutar el sistema localmente.

**Repositorio raíz**: contiene el orquestador principal `docker-compose.yml` que levanta todos los servicios y herramientas de observabilidad.

## Resumen de componentes

- **API Gateway**: `Apigateway` (FastAPI). Enruta peticiones, valida tokens con Supabase y contiene lógica de orquestación para procesos compuestos (ej. pago).
- **Product Microservice**: `ProductMsvc` (Flask + Supabase). Gestión de catálogo y stock (`/reduce-stock`, `/restore-stock`).
- **Cart Microservice**: `cartService` (Flask + Supabase). Gestión del carrito del usuario.
- **Order Microservice**: `OrderService` (Flask + Supabase). Creación y consulta de órdenes; mantiene `orders` y `order_items`.
- **Payment Microservice**: `paymentService` (Express/Node). Crea recibos en Supabase y envía emails con `nodemailer`.
- **Frontend**: `stride-front` (React + Vite).
- **Monitoreo / Logs**: `uptime-kuma` (uptime) y `dozzle` (visualización de logs).

## Patrones de diseño y justificación

- **Saga Pattern (REQUIRED)**
  - Implementación: la secuencia de checkout/pago usa un patrón saga con pasos y acciones de compensación implementadas manualmente. El flujo principal (controlado desde el API Gateway / route de `payment/process-payment`) hace: consultar orden pendiente -> reducir stock -> procesar pago -> crear recibo -> marcar orden como `paid`. Si un paso falla, el flujo ejecuta compensaciones (ej. restaurar stock, eliminar recibo) para dejar el sistema en un estado consistente.
  - Justificación: garantiza consistencia eventual sin transacciones distribuidas (ACID) entre microservicios independientes. Las compensaciones dan seguridad frente a fallos parciales de la cadena.

- **API Gateway**
  - Actúa como punto de entrada centralizado y controlador de autenticación (Supabase). Facilita separación de responsabilidades y simplifica gestión de rutas protegidas.

- **Choreography vs Orchestration**
  - En este proyecto la gestión de flujos críticas se realiza con un enfoque **orquestado** (orchestration). La lógica secuencial y las compensaciones se ejecutan desde el Gateway/endpoint de pago, es decir, existe un orquestador central que coordina los pasos.
  - Justificación: permite controlar fácilmente el orden y las compensaciones (reduce-stock -> pago -> recibo -> marcar orden). Trade-off: la orquestación centralizada simplifica la lógica pero crea un punto con mayor responsabilidad (y carga). Una alternativa basada en **choreography** (eventos y listeners / message broker) sería más escalable y desacoplada, pero su implementación requiere un broker (RabbitMQ/Kafka) y mayor complejidad en el proyecto.

## Comunicación entre servicios

- Todos los microservicios se comunican mediante llamadas HTTP REST (el API Gateway usa `httpx`/peticiones síncronas a otros servicios).
- No hay message broker en el repositorio; la coordinación se hace por peticiones directas y manejo de compensaciones en el código.

## Tecnologías y herramientas

- Backend: Python (Flask para microservicios), FastAPI (API Gateway), Node.js/Express (Payment Service)
- Frontend: React + Vite
- Base de datos / Auth: Supabase (Postgres + Auth)
- Contenerización: Docker, `docker-compose.yml` en la raíz
- Emails: `nodemailer` en `paymentService` (usa `EMAIL_USER` y `EMAIL_PASSWORD` del `.env`)
- Observabilidad ligera: `uptime-kuma` (uptime), `dozzle` (logs).

## Diagrama de arquitectura

<img width="1576" height="990" alt="timelineeditable" src="https://github.com/user-attachments/assets/20904dbd-2ac5-4b62-8747-47595b350b91" />


## Responsabilidades por microservicio (resumen)

- API Gateway (`Apigateway`)
  - Autenticación con Supabase (validación de JWT en headers).
  - Ruteo y validación básica.
  - Orquestación del proceso de pago/checkout.

- Product (`ProductMsvc`)
  - CRUD de productos.
  - Endpoints: `/allproducts`, `/products/<id>`, `/reduce-stock`, `/restore-stock`.

- Cart (`cartService`)
  - CRUD de items en carrito por `user_id`.
  - Endpoints: `/cart`, `/cart/add`, `/cart/remove`, `/cart/clear`.

- Order (`OrderService`)
  - Crear órdenes, consultar órdenes pendientes, actualizar estado y agregar dirección.
  - Endpoints: `/orders` (POST), `/check-pending`, `/orderslist`.

- Payment (`paymentService`)
  - Crear recibos (`receipts`) en Supabase y enviar email al usuario.

## Pruebas y estrategia de testing

- Estado actual: hay tests de frontend (`stride-front/src/test`) con Jest. No se incluyen pruebas automatizadas para los microservicios en este repositorio.
- Recomendaciones para pruebas del backend:
  - Unit tests: `pytest` con `pytest-flask` para puntos lógicos de cada servicio.
  - Integration tests: pruebas end-to-end con servicios levantados (usar `docker-compose` en un entorno CI) o `pytest` con `requests` apuntando a contenedores.
  - E2E: Cypress o Playwright sobre la app React.

## Observabilidad y monitoreo

- Uptime: `uptime-kuma` expuesto en el `docker-compose` para chequear salud de endpoints.
- Logs: `dozzle` para visualizar logs de contenedores en tiempo real.


## Requisitos de entorno (.env)

Cada servicio carga variables desde su `.env`. Variables mínimas necesarias:

- `Apigateway/.env`, `cartService/.env`, `OrderService/.env`, `ProductMsvc/.env`, `paymentService/.env`, `stride-front/.env`:
  - `VITE_SUPABASE_URL` — URL de Supabase
  - `VITE_SUPABASE_ANON_KEY` — Anon/public key de Supabase

- `paymentService/.env` adicionales:
  - `EMAIL_USER` — cuenta desde la cual se envían emails
  - `EMAIL_PASSWORD` — contraseña o app password


## Ejecutar localmente (Docker, recomendado)

1. Construir y levantar todos los servicios con Docker Compose (desde la raíz del repo):

```bash
docker compose -f docker-compose.yml up -d --build
```

2. Verificar salud:

```bash
curl http://localhost:8000/health        # API Gateway
curl http://localhost:5000/health        # Products
curl http://localhost:5001/health        # Cart
curl http://localhost:5002/health        # Order
curl http://localhost:5003/health        # Payment
```

3. Acceder al frontend en `http://localhost:5173` (según `docker-compose`).



## Endpoints importantes y ejemplo de flujo (checkout)

1. Usuario autenticado solicita crear orden (API Gateway):
  - `POST /order/create` -> el Gateway obtiene carrito (`/cart`), crea orden en `OrderService` y limpia el carrito.

2. Procesar pago (API Gateway):
  - `POST /payment/process-payment` con `Authorization: Bearer <token>` y body con `paymentInfo` y `ship_info`.
  - El flujo: valida usuario → obtiene orden pendiente → reduce stock (`ProductMsvc`) → simula pasarela → crea recibo (`paymentService`) → marca orden como `paid`. Si falla, ejecuta compensaciones (`restore-stock`, borrar recibo).



## Documentación adicional y enlaces

- README por microservicio:
  - [Apigateway](Apigateway/README.md)
  - [ProductMsvc](ProductMsvc/README.md)
  - [cartService](cartService/README.md)
  - [OrderService](OrderService/README.md)




