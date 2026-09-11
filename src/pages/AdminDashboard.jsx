import { useEffect, useState } from 'react'
import { getReporte, getProductosStockCritico, exportarReporteCSV } from '../api/adminApi'

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

  const [stockCritico, setStockCritico] = useState([])
  const [cargandoStock, setCargandoStock] = useState(true)

  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin,    setFechaFin]    = useState('')
  const [exportando,  setExportando]  = useState(false)
  const [errorExport, setErrorExport] = useState('')

  useEffect(() => {
    getReporte()
      .then(r => setReporte(r.data))
      .catch(() => setError('No se pudo cargar el reporte'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getProductosStockCritico()
      .then(r => setStockCritico(r.data))
      .catch(() => setStockCritico([]))
      .finally(() => setCargandoStock(false))
  }, [])

  const handleExportarCSV = async () => {
    setExportando(true)
    setErrorExport('')
    try {
      const res = await exportarReporteCSV(fechaInicio || null, fechaFin || null)
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
      const url  = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `pedidos_plantopolis_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setErrorExport('No se pudo generar el archivo CSV. Intenta de nuevo.')
    } finally {
      setExportando(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700" />
    </div>
  )

  if (error) return (
    <div className="p-6 text-red-600">⚠ {error}</div>
  )

  const maxEstado = reporte?.pedidosPorEstado
    ? Math.max(...Object.values(reporte.pedidosPorEstado), 1)
    : 1

  const fmt = (val) =>
    '$' + Number(val ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          📊 Dashboard de ventas
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Métricas en tiempo real del sistema Plantopolis
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        <KpiCard icono="💰" titulo="Ingresos totales" valor={fmt(reporte?.totalIngresos)}
                 sub="Pagos aprobados" color="green" />
        <KpiCard icono="📦" titulo="Total pedidos" valor={reporte?.totalPedidos ?? 0}
                 sub="En el sistema" color="blue" />
        <KpiCard icono="🌿" titulo="Productos activos" valor={reporte?.totalProductosActivos ?? 0}
                 sub="En el catálogo" color="emerald" />
        <KpiCard icono="📈" titulo="Promedio/orden" valor={fmt(reporte?.promedioOrden)}
                 sub="Valor medio" color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-5">
            Pedidos por estado
          </h2>

          <div className="flex items-end justify-around h-40 gap-2">
            {reporte?.pedidosPorEstado &&
              Object.entries(reporte.pedidosPorEstado).map(([estado, count]) => {
                const config  = ESTADO_CONFIG[estado] ?? { color: 'bg-gray-400' }
                const pct     = Math.max((count / maxEstado) * 100, count > 0 ? 4 : 0)
                return (
                  <div key={estado} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-bold text-gray-600">
                      {count}
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${config.color}`}
                      style={{ height: `${pct}%`, minHeight: count > 0 ? '6px' : '2px' }}
                    />
                    <span className="text-[10px] font-medium text-gray-500 text-center leading-tight">
                      {estado.charAt(0) + estado.slice(1).toLowerCase()}
                    </span>
                  </div>
                )
              })}
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
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
                <div key={p.idProducto} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                                    ${i === 0 ? 'bg-yellow-100 text-yellow-700' :
                                      i === 1 ? 'bg-gray-100 text-gray-600' :
                                      i === 2 ? 'bg-orange-100 text-orange-700' :
                                                'bg-green-50 text-green-600'}`}>
                    {i + 1}
                  </span>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {p.nombreProducto}
                    </p>
                    <p className="text-xs text-gray-500">
                      {fmt(p.totalIngresos)}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-green-700 flex-shrink-0">
                    {p.totalVendido} ud.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-700">
            ⚠️ Alerta de stock crítico
          </h2>
          {stockCritico.length > 0 && (
            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2.5 py-1 rounded-full">
              {stockCritico.length} producto(s)
            </span>
          )}
        </div>

        {cargandoStock ? (
          <p className="text-gray-400 text-sm text-center py-6">Cargando...</p>
        ) : stockCritico.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            ✅ Ningún producto está por debajo de su umbral de stock
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {stockCritico.map(p => (
              <div key={p.idProducto}
                   className="flex items-center justify-between bg-orange-50 border border-orange-100 rounded-lg px-4 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {p.nombreProducto}
                  </p>
                  <p className="text-xs text-gray-500">
                    Umbral configurado: {p.stockMinimoAlerta} unidades
                  </p>
                </div>
                <span className={`text-sm font-bold flex-shrink-0 ml-3
                                  ${p.stock === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                  {p.stock} {p.stock === 1 ? 'unidad' : 'unidades'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-700 mb-1">
          📥 Exportar pedidos a CSV
        </h2>
        <p className="text-gray-500 text-xs mb-4">
          Descarga un archivo CSV (compatible con Excel/Sheets) con el detalle
          de pedidos del rango de fechas seleccionado. Déjalo vacío para
          exportar todos los pedidos.
        </p>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={e => setFechaInicio(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={e => setFechaFin(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            onClick={handleExportarCSV}
            disabled={exportando}
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {exportando ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generando...
              </>
            ) : (
              <>⬇ Descargar CSV</>
            )}
          </button>

          {(fechaInicio || fechaFin) && (
            <button
              onClick={() => { setFechaInicio(''); setFechaFin('') }}
              className="text-xs text-gray-500 hover:text-red-600 underline"
            >
              Limpiar fechas
            </button>
          )}
        </div>

        {errorExport && (
          <p className="text-xs text-red-600 mt-3">⚠ {errorExport}</p>
        )}
      </div>

    </div>
  )
}

function KpiCard({ icono, titulo, valor, sub, color }) {
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