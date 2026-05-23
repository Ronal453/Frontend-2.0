import { useEffect, useState } from 'react'
import { getReporte } from '../api/adminApi'

/**
 * Dashboard de reportes del panel admin.
 *
 * HU10 — Sprint 5
 *
 * Secciones:
 *   1. KPI Cards  — ingresos, pedidos, productos activos, promedio/orden
 *   2. Gráfica    — distribución de pedidos por estado (barras CSS)
 *   3. Tabla      — top 5 productos más vendidos
 *
 * Gráfica implementada con CSS puro (barras proporcionales en Tailwind).
 * No requiere Chart.js ni librerías externas adicionales.
 *
 * Ruta destino: From/src/pages/AdminDashboard.jsx
 */

// Configuración visual de cada estado para la gráfica de barras
const ESTADO_CONFIG = {
  PENDIENTE:  { color: 'bg-yellow-400', texto: 'text-yellow-700' },
  PREPARANDO: { color: 'bg-blue-400',   texto: 'text-blue-700'   },
  ENVIADO:    { color: 'bg-purple-400', texto: 'text-purple-700' },
  ENTREGADO:  { color: 'bg-green-500',  texto: 'text-green-700'  },
  CANCELADO:  { color: 'bg-red-400',    texto: 'text-red-700'    },
}

export default function AdminDashboard() {
  const [reporte,  setReporte]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  // Cargar el reporte al montar el componente
  useEffect(() => {
    getReporte()
      .then(r => setReporte(r.data))
      .catch(() => setError('No se pudo cargar el reporte'))
      .finally(() => setLoading(false))
  }, [])

  // ── Estado: cargando ────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10
                      border-b-2 border-green-700" />
    </div>
  )

  // ── Estado: error ───────────────────────────────────────────────────────
  if (error) return (
    <div className="p-6 text-red-600">⚠ {error}</div>
  )

  // ── Calcular el máximo para escalar las barras de la gráfica ────────────
  // La barra más alta ocupará el 100% de alto; las demás escalan proporcionalmente
  const maxEstado = reporte?.pedidosPorEstado
    ? Math.max(...Object.values(reporte.pedidosPorEstado), 1)
    : 1

  // ── Formatear precio en pesos colombianos ───────────────────────────────
  const fmt = (val) =>
    '$' + Number(val ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          📊 Dashboard de ventas
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Métricas en tiempo real del sistema Plantopolis
        </p>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <KpiCard
          icono="💰"
          titulo="Ingresos totales"
          valor={fmt(reporte?.totalIngresos)}
          sub="Pagos aprobados"
          color="green"
        />
        <KpiCard
          icono="📦"
          titulo="Total pedidos"
          valor={reporte?.totalPedidos ?? 0}
          sub="En el sistema"
          color="blue"
        />
        <KpiCard
          icono="🌿"
          titulo="Productos activos"
          valor={reporte?.totalProductosActivos ?? 0}
          sub="En el catálogo"
          color="emerald"
        />
        <KpiCard
          icono="📈"
          titulo="Promedio/orden"
          valor={fmt(reporte?.promedioOrden)}
          sub="Valor medio"
          color="purple"
        />
      </div>

      {/* ── Gráfica + Top Productos (fila) ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Gráfica de barras: pedidos por estado */}
        <div className="bg-white border border-gray-100 rounded-xl
                        p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-5">
            Pedidos por estado
          </h2>

          {/* Barras verticales proporcionales */}
          <div className="flex items-end justify-around h-40 gap-2">
            {reporte?.pedidosPorEstado &&
              Object.entries(reporte.pedidosPorEstado).map(([estado, count]) => {
                const config  = ESTADO_CONFIG[estado] ?? { color: 'bg-gray-400' }
                // Altura proporcional: (count / max) * 100% (mínimo 4% para ser visible)
                const pct     = Math.max((count / maxEstado) * 100, count > 0 ? 4 : 0)
                return (
                  <div key={estado}
                       className="flex flex-col items-center gap-1 flex-1">
                    {/* Valor numérico encima de la barra */}
                    <span className="text-xs font-bold text-gray-600">
                      {count}
                    </span>
                    {/* Barra coloreada */}
                    <div
                      className={`w-full rounded-t-lg transition-all
                                  duration-500 ${config.color}`}
                      style={{ height: `${pct}%`, minHeight: count > 0 ? '6px' : '2px' }}
                    />
                    {/* Etiqueta del estado */}
                    <span className="text-[10px] font-medium text-gray-500
                                     text-center leading-tight">
                      {estado.charAt(0) + estado.slice(1).toLowerCase()}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Tabla: top 5 productos más vendidos */}
        <div className="bg-white border border-gray-100 rounded-xl
                        p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">
            🏆 Top productos vendidos
          </h2>

          {(!reporte?.topProductos || reporte.topProductos.length === 0) ? (
            <p className="text-gray-400 text-sm text-center py-8">
              Aún no hay ventas registradas
            </p>
          ) : (
            <div className="space-y-3">
              {reporte.topProductos.map((p, i) => (
                <div key={p.idProducto}
                     className="flex items-center gap-3">
                  {/* Posición en el ranking */}
                  <span className={`w-6 h-6 rounded-full flex items-center
                                    justify-center text-xs font-bold flex-shrink-0
                                    ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                      i === 1 ? 'bg-gray-100 text-gray-600' :
                                      i === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-50 text-green-600'}`}>
                    {i + 1}
                  </span>

                  {/* Nombre e ingresos */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {p.nombreProducto}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fmt(p.totalIngresos)}
                    </p>
                  </div>

                  {/* Unidades vendidas */}
                  <span className="text-sm font-bold text-green-700
                                   flex-shrink-0">
                    {p.totalVendido} ud.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Componente: KPI Card ────────────────────────────────────────────────────
/**
 * Tarjeta de métrica con ícono, valor principal y subtexto.
 * @param {string} color - "green" | "blue" | "emerald" | "purple"
 */
function KpiCard({ icono, titulo, valor, sub, color }) {
  // Mapeo de colores a clases Tailwind (no usar interpolación dinámica)
  const colorMap = {
    green:   'bg-green-50 text-green-700 border-green-100',
    blue:    'bg-blue-50 text-blue-700 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple:  'bg-purple-50 text-purple-700 border-purple-100',
  }
  const cardColor = colorMap[color] ?? colorMap.green

  return (
    <div className={`rounded-xl border p-4 ${cardColor}`}>
      <div className="text-2xl mb-1">{icono}</div>
      <p className="text-xs font-medium opacity-70 mb-1">{titulo}</p>
      <p className="text-xl font-bold leading-tight">{valor}</p>
      <p className="text-xs opacity-60 mt-0.5">{sub}</p>
    </div>
  )
}