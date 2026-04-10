# 🌱 Plantopolis — Frontend

Interfaz de usuario para la tienda de plantas Plantopolis, desarrollada con React + Vite.

## Descripción

Aplicación web que permite a los clientes explorar el catálogo de plantas, gestionar su carrito de compras, realizar pedidos y consultar su historial.

## Objetivo

Proveer una experiencia de compra intuitiva y responsive para clientes de Plantopolis.

## Tecnologías utilizadas

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19.x | Framework UI |
| Vite | 8.x | Bundler y servidor de desarrollo |
| React Router DOM | 7.x | Navegación entre páginas |
| Axios | 1.x | Llamadas HTTP al backend |
| TanStack Query | 5.x | Gestión de estado del servidor |
| Tailwind CSS | 3.x | Estilos |
| Nginx | Alpine | Servidor web en producción |
| Docker | - | Contenedorización |

## Estructura del proyecto

```
src/
├── api/
│   ├── axios.js           ← Cliente HTTP configurado con JWT
│   ├── authApi.js         ← Llamadas de autenticación
│   └── productosApi.js    ← Llamadas de productos
├── components/
│   ├── layout/
│   │   ├── Navbar.jsx     ← Barra de navegación
│   │   └── Footer.jsx     ← Pie de página
│   └── PrivateRoute.jsx   ← Protección de rutas privadas
├── context/
│   └── AuthContext.jsx    ← Estado global de autenticación
├── hooks/
│   └── useAuth.js         ← Hook para acceder al contexto de auth
├── pages/
│   ├── Login.jsx          ← Inicio de sesión
│   ├── Register.jsx       ← Registro de usuario
│   ├── Catalog.jsx        ← Catálogo con filtros
│   ├── ProductDetail.jsx  ← Detalle de producto
│   ├── Checkout.jsx       ← Proceso de compra
│   ├── MisPedidos.jsx     ← Historial de pedidos
│   └── DetallePedido.jsx  ← Detalle y seguimiento de pedido
└── App.jsx                ← Configuración de rutas
```

## Instalación y ejecución

### Opción 1 — Docker (recomendado)

El frontend se levanta junto con el backend desde el repositorio `Back/`:

```bash
# Desde la carpeta Back/
docker-compose up --build

# Acceder en:
http://localhost:5173
```

### Opción 2 — Local con Node

**Prerrequisito:** Backend corriendo en `localhost:8080`

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Acceder en:
http://localhost:5173
```

## Rutas de la aplicación

| Ruta | Componente | Acceso |
|---|---|---|
| `/catalogo` | Catalog | Público |
| `/producto/:id` | ProductDetail | Público |
| `/login` | Login | Público |
| `/registro` | Register | Público |
| `/checkout` | Checkout | 🔒 Requiere login |
| `/pedidos` | MisPedidos | 🔒 Requiere login |
| `/pedidos/:id` | DetallePedido | 🔒 Requiere login |

## Variables de entorno

El frontend no tiene variables de entorno propias. La URL del backend se configura en `vite.config.js`:

```js
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  }
}
```

En Docker, Nginx redirige `/api/` al contenedor `backend`.

## Pruebas

```bash
# Build de producción
npm run build

# Vista previa del build
npm run preview

# Lint
npm run lint
```

## Sprints completados

| Sprint | Funcionalidad |
|---|---|
| Sprint 1 | Login y registro con JWT |
| Sprint 2 | Catálogo con filtros y detalle de producto |
| Sprint 3 | Carrito de compras |
| Sprint 4 | Checkout, historial y detalle de pedidos |



---
*Proyecto académico — Ingeniería de Sistemas*