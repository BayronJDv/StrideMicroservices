# Stride - Plataforma de E-commerce

## Descripción del Proyecto

Stride es una plataforma de e-commerce desarrollada con **React** y **Vite** que permite a los usuarios navegar, comprar productos y gestionar sus pedidos. Incluye un panel administrativo para la gestión de productos, análisis de ventas y seguimiento de órdenes. La aplicación se integra con **Supabase** para autenticación y varios microservicios para cumplir sus funciones .

### Características principales:
- 🛒 Catálogo de productos con búsqueda y filtros
- 👤 Sistema de autenticación y gestión de usuarios
- 📦 Carrito de compras y checkout
- 📊 Panel administrativo con gestión de productos
- 📱 Interfaz responsive con Bootstrap
- 📧 sistema de notificacion con correos 

---

## Requisitos Previos

- **Node.js** (v18+)
- **npm** (gestor de paquetes recomendado)
- Navegador web moderno

---

## Instalación

1. Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd stride-front
```

2. Instala las dependencias:
```bash
npm install
```

---

## Ejecución

### Modo Desarrollo
Inicia el servidor de desarrollo con recarga en caliente:
```bash
pnpm run dev
```
Accede a la aplicación en `http://localhost:5173`

### Build de Producción
Compila la aplicación para producción:
```bash
pnpm run build
```

### Vista Previa de Producción
Visualiza la versión compilada:
```bash
pnpm run preview
```

---


## Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
├── pages/           # Páginas principales y admin
├── state/           # Gestión de estado (Jotai)
├── api/             # Configuración de API y Supabase
├── css/             # Estilos CSS y módulos
├── assets/          # Recursos estáticos
└── test/            # Tests unitarios
```

---

## Stack Tecnológico

- **Framework UI**: React 18.3
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Estado**: Jotai
- **Formularios**: React Hook Form
- **Base de Datos**: Supabase
- **Estilos**: Bootstrap 5 + Sass
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint

---


## Licencia

Este proyecto es parte del curso DSIII.
