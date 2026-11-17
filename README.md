# 🌱 Plantopolis — Frontend

Aplicación web moderna para **Plantopolis**, construida con **React 19**, **Vite** y **Tailwind CSS**.

---

## 📋 Descripción

El frontend de Plantopolis integra tres experiencias de usuario totalmente diferenciadas mediante control de acceso por roles (**RBAC**):

1. **Portal Comercial (Clientes y Visitantes):**
   - Catálogo interactivo de plantas y especies botánicas con filtros avanzados (categoría, nivel de luz, frecuencia de riego y rango de precio).
   - Fichas de producto enriquecidas con consejos botánicos y especificaciones de cuidado.
   - Carrito de compras persistente en base de datos sincronizado con el backend.
   - Checkout transaccional con validaciones de dirección y confirmación de pedidos.
   - Seguimiento histórico de pedidos con visualización de estado en tiempo real.
   - Recuperación y restablecimiento de contraseña mediante flujo por correo.

2. **Panel de Operaciones de Cultivo (Trabajador de Vivero):**
   - **Tablero Kanban interactivo:** Gestión ágil de tareas diarias (riego, poda, fertilización, control de plagas) con estados formales (`POR_HACER`, `EN_PROGRESO`, `EN_REVISION`, `COMPLETADA`, `BLOQUEADA`).
   - Auditoría y comentarios en cada transición de tareas.
   - **Trazabilidad de Lotes:** Monitoreo del ciclo biológico (`GERMINANDO`, `CRECIENDO`, `LISTO_PARA_VENTA`, `DESCARTADO`).
   - **Mermas de Cultivo:** Registro clasificado de pérdidas vegetales con causas tipificadas.
   - **Zonas de Cultivo:** Visualización de invernaderos, parcelas y su ocupación porcentual.

3. **Panel de Gestión y Control (Administrador):**
   - Tablero analítico y métricas ejecutivas de ventas y rendimiento.
   - Tablero de control operativo de vivero (lotes, mermas críticas, tareas pendientes).
   - Gestión integral de usuarios (activación/desactivación, reseteo de claves y creación de trabajadores).
   - CRUD de catálogo botánico con control de inventario y alertas de stock bajo.
   - Gestión logística de pedidos de clientes.
   - Auditoría de logs del sistema y generación de respaldos de base de datos.

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|---|---|---|
| **React** | 19.x | Biblioteca base para la interfaz de usuario |
| **Vite** | 8.x | Herramienta de compilación, bundling y HMR ultrarrápido |
| **React Router DOM** | 7.x | Enrutamiento declarativo y protección por roles |
| **Tailwind CSS** | 3.4 | Sistema de diseño de utilidades CSS |
| **Axios** | 1.x | Cliente HTTP centralizado con interceptor de tokens JWT |
| **Lucide React** | - | Set de iconos vectoriales modernos |
| **Nginx** | Alpine | Servidor web HTTP y reverse proxy para producción |
| **Docker** | Multi-stage | Empaquetado y despliegue en contenedor ligero |

---

## 📁 Estructura del Proyecto

```
Frontend/src/
├── api/                               # Servicios HTTP organizados por dominio
│   ├── axios.js                       # Cliente Axios centralizado con interceptor Bearer JWT
│   ├── authApi.js                     # Login, registro y restablecimiento de claves
│   ├── productosApi.js                # Catálogo botánico e inventario
│   ├── pedidosApi.js                  # Checkout y seguimiento de pedidos
│   ├── trabajadorApi.js               # Tareas (Kanban), Lotes, Mermas y Zonas
│   └── adminApi.js                    # Usuarios, Métricas, Logs y Respaldos
├── components/                        # Componentes reutilizables
│   ├── layout/                        # Layouts estructurales
│   │   ├── Navbar.jsx                 # Barra de navegación superior con menú responsive
│   │   ├── Footer.jsx                 # Pie de página institucional
│   │   ├── PublicLayout.jsx           # Layout para vistas de cliente y catálogo
│   │   ├── AdminLayout.jsx            # Layout administrativo con barra lateral (Sidebar)
│   │   └── TrabajadorLayout.jsx       # Layout para operarios de vivero
│   ├── PrivateRoute.jsx               # Guardia para usuarios autenticados
│   ├── AdminRoute.jsx                 # Guardia exclusiva para Rol 1 (Administrador)
│   ├── TrabajadorRoute.jsx            # Guardia para Roles 1 y 2 (Operativo)
│   ├── InactivityGuard.jsx            # Cierre automático de sesión tras tiempo de inactividad
│   └── CookieBanner.jsx               # Aviso de consentimiento de privacidad
├── context/                           # Estado global con React Context API
│   ├── AuthContext.jsx                # Sesión del usuario, token JWT y rol activo
│   ├── CartContext.jsx                # Estado del carrito sincronizado con backend
│   ├── LanguageContext.jsx            # Motor de internacionalización (i18n)
│   ├── ThemeContext.jsx               # Conmutador de modo claro / modo oscuro
│   └── LayoutContext.jsx              # Control de colapso de barras de navegación
├── hooks/                             # Custom hooks
│   ├── useAuth.js                     # Hook de acceso rápido a AuthContext
│   ├── useLanguage.js                 # Hook para traducciones y cambio de idioma
│   └── useTheme.js                    # Hook para gestión del tema visual
├── locales/                           # Diccionarios de internacionalización
│   ├── es.js                          # Traducciones en Español
│   └── en.js                          # Traducciones en Inglés (100% simétrico)
├── pages/                             # Vistas y páginas principales
│   ├── trabajador/                    # Páginas exclusivas del panel de campo
│   │   ├── TrabajadorKanban.jsx       # Tablero Kanban de tareas diarias
│   │   ├── TrabajadorLotes.jsx        # Ciclo biológico y fases de lotes
│   │   ├── TrabajadorMermas.jsx       # Registro de mermas y causas
│   │   └── TrabajadorZonas.jsx        # Estado de zonas e invernaderos
│   ├── AdminDashboard.jsx             # Métricas y resumen administrativo
│   ├── AdminDashboardOperativo.jsx    # Monitoreo operativo de campo para administradores
│   ├── AdminUsuarios.jsx              # Gestión de usuarios y creación de trabajadores
│   ├── AdminProductos.jsx             # Inventario y catálogo botánico
│   ├── AdminPedidos.jsx               # Control logístico de pedidos
│   ├── AdminLotes.jsx                 # Administración global de lotes
│   ├── AdminMermas.jsx                # Auditoría y reportes de mermas
│   ├── AdminZonas.jsx                 # Configuración de zonas del vivero
│   ├── AdminProveedores.jsx           # Gestión de proveedores de suministros
│   ├── AdminLogs.jsx                  # Historial de eventos y auditoría del sistema
│   ├── AdminBackup.jsx                # Generación y descarga de respaldos SQL
│   ├── Catalog.jsx                    # Catálogo comercial público con filtros
│   ├── ProductDetail.jsx              # Ficha botánica de planta
│   ├── Checkout.jsx                   # Pasarela de confirmación de pedido
│   ├── MisPedidos.jsx                 # Historial de compras del cliente
│   ├── DetallePedido.jsx              # Seguimiento en vivo de un pedido
│   ├── Login.jsx                      # Formulario de inicio de sesión
│   ├── Register.jsx                   # Registro público de clientes
│   ├── RecuperarPassword.jsx          # Solicitud de restablecimiento
│   ├── ResetearPassword.jsx           # Ingreso de nueva contraseña
│   └── PoliticaDatos.jsx              # Política de tratamiento de datos personales
└── App.jsx                            # Definición central del árbol de rutas
```

---

## 🗺️ Mapa de Rutas de la Aplicación

| Ruta | Descripción | Nivel de Acceso |
|---|---|---|
| `/catalogo` | Catálogo de plantas con filtros por riego, luz y categoría | 🌐 Público |
| `/producto/:id` | Ficha técnica detallada de la planta | 🌐 Público |
| `/login` | Inicio de sesión con correo y contraseña | 🌐 Público |
| `/registro` | Registro de nuevos clientes | 🌐 Público |
| `/recuperar-password` | Formulario para solicitar reseteo de clave | 🌐 Público |
| `/resetear-password` | Restablecimiento de contraseña con token | 🌐 Público |
| `/politica-datos` | Información de privacidad y protección de datos | 🌐 Público |
| `/checkout` | Confirmación y pago del pedido | 🔒 Cliente autenticado |
| `/pedidos` | Historial de pedidos del cliente | 🔒 Cliente autenticado |
| `/pedidos/:id` | Detalle y estado en vivo del pedido | 🔒 Cliente autenticado |
| `/trabajador/tareas` | Tablero Kanban de tareas operativas de campo | 👷 Trabajador / Admin |
| `/trabajador/lotes` | Monitoreo del ciclo biológico de lotes de cultivo | 👷 Trabajador / Admin |
| `/trabajador/mermas` | Registro clasificado de pérdidas vegetales | 👷 Trabajador / Admin |
| `/trabajador/zonas` | Mapa y ocupación de zonas e invernaderos | 👷 Trabajador / Admin |
| `/admin/dashboard` | Métricas comerciales y analítica de ventas | 👑 Solo Administrador |
| `/admin/operaciones` | Dashboard de operaciones agrícolas | 👑 Solo Administrador |
| `/admin/usuarios` | Control de cuentas, reseteo y creación de trabajadores | 👑 Solo Administrador |
| `/admin/productos` | Edición de catálogo, stock y precios | 👑 Solo Administrador |
| `/admin/pedidos` | Gestión de estados de despacho de pedidos | 👑 Solo Administrador |
| `/admin/lotes` | Control administrativo de lotes | 👑 Solo Administrador |
| `/admin/mermas` | Reporte y consolidado de mermas | 👑 Solo Administrador |
| `/admin/zonas` | Configuración de capacidad de zonas | 👑 Solo Administrador |
| `/admin/proveedores` | Directorio de proveedores | 👑 Solo Administrador |
| `/admin/logs` | Registro de auditoría del sistema | 👑 Solo Administrador |
| `/admin/backup` | Copias de seguridad de base de datos | 👑 Solo Administrador |

---

## 🌐 Internacionalización (i18n)

La plataforma cuenta con un sistema nativo de traducción bilingüe sin dependencias pesadas:
- Hook `useLanguage()` que provee la función `t('clave', 'Texto fallback')`.
- Diccionarios en `src/locales/es.js` y `src/locales/en.js` con **100% de simetría de claves**.
- Selector de idioma dinámico en el `Navbar` con persistencia en `localStorage`.
- Formateo de fechas y números ajustado al locale seleccionado (`es-CO` vs `en-US`).

---

## 🚀 Instalación y Ejecución

### Opción 1 — Con Docker (Recomendado)
El frontend se orquesta junto con el backend y la base de datos desde la carpeta `Backend/`:
```bash
# Desde la carpeta Backend/
docker compose up -d --build
```
La aplicación queda accesible en: **[http://localhost:5173](http://localhost:5173)**.

### Opción 2 — Modo Desarrollo Local (Node.js)
**Prerrequisito:** API backend ejecutándose en `http://localhost:8080`.

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo con Vite
npm run dev
```

### Scripts Disponibles
```bash
# Iniciar servidor de desarrollo con Hot Module Replacement (HMR)
npm run dev

# Compilar paquete para producción en /dist
npm run build

# Previsualizar el bundle de producción localmente
npm run preview

# Ejecutar análisis de linter
npm run lint
```

---
*Plantopolis Frontend — React 19 + Vite + Tailwind CSS*
