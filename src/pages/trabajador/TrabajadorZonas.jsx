import { useState, useEffect } from 'react'
import { getZonasOcupacion, getZonaDetalle } from '../../api/trabajadorApi'

const ESTADO_BADGES = {
  GERMINANDO: 'bg-yellow-100 dark:bg-yellow-950/60 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  CRECIENDO: 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  LISTO_PARA_VENTA: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  DESCARTADO: 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
}

export default function TrabajadorZonas() {
  const [zonas, setZonas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Filtros
  const [filtroCondicion, setFiltroCondicion] = useState('')
  const [filtroSolar, setFiltroSolar] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Modal detalle de zona
  const [modalDetalle, setModalDetalle] = useState({
    abierto: false,
    zona: null,
    lotes: [],
    cargando: false,
    error: '',
  })

  const cargarZonas = async () => {
    setCargando(true)
    setError('')
    try {
      const res = await getZonasOcupacion()
      setZonas(res.data || [])
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar las zonas de cultivo')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarZonas()
  }, [])

  const abrirDetalleZona = async (zona) => {
    setModalDetalle({
      abierto: true,
      zona,
      lotes: [],
      cargando: true,
      error: '',
    })
    try {
      const res = await getZonaDetalle(zona.idZona)
      setModalDetalle({
        abierto: true,
        zona: res.data,
        lotes: res.data.lotes || [],
        cargando: false,
        error: '',
      })
    } catch (err) {
      setModalDetalle(prev => ({
        ...prev,
        cargando: false,
        error: err.response?.data?.mensaje || 'Error al consultar los lotes de la zona',
      }))
    }
  }

  // Filtrado reactivo
  const zonasFiltradas = zonas.filter(z => {
    const coincideNombre = z.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCondicion = !filtroCondicion || z.tipoCondicion === filtroCondicion
    const coincideSolar = !filtroSolar || z.exposicionSolar === filtroSolar
    return coincideNombre && coincideCondicion && coincideSolar
  })

  // Zonas críticas >90% (HU22)
  const zonasCriticas90 = zonas.filter(z => z.porcentajeOcupacion >= 90 || z.alertaSupera90)

  // Estadísticas globales
  const totalZonas = zonas.length
  const capacidadTotal = zonas.reduce((acc, z) => acc + (z.capacidadMaxima || 0), 0)
  const lotesActivosTotal = zonas.reduce((acc, z) => acc + (z.lotesActivos || 0), 0)
  const plantasTotal = zonas.reduce((acc, z) => acc + (z.totalPlantas || 0), 0)
  const ocupacionPromedio = capacidadTotal > 0 ? Math.round((lotesActivosTotal / capacidadTotal) * 100) : 0

  const getBarColor = (porcentaje) => {
    if (porcentaje >= 90) return 'bg-red-500'
    if (porcentaje >= 60) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  const getBadgeColor = (porcentaje) => {
    if (porcentaje >= 90) return 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse'
    if (porcentaje >= 60) return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
    return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            📍 Ocupación de Zonas e Invernaderos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Supervisa la distribución de lotes, plantas y capacidad instalada en cada área (HU22)
          </p>
        </div>

        <button
          onClick={cargarZonas}
          title="Refrescar zonas"
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <span>🔄</span> Actualizar Datos
        </button>
      </div>

      {/* Alerta de Sobrepoblación >90% (HU22) */}
      {zonasCriticas90.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/50 border-2 border-red-500 rounded-2xl p-4 shadow-sm flex items-start gap-3 text-sm">
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <h4 className="font-bold text-red-900 dark:text-red-200">
              Alerta de Capacidad: {zonasCriticas90.length} zona(s) superan el 90% de ocupación
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Evita asignar nuevos lotes a estas zonas para prevenir sobrepoblación:{' '}
              {zonasCriticas90.map(z => (
                <span key={z.idZona} className="inline-block font-semibold bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded text-[11px] mr-1">
                  {z.nombre} ({z.porcentajeOcupacion}%)
                </span>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Zonas de Cultivo</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalZonas}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Espacios disponibles</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Capacidad Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{capacidadTotal} <span className="text-xs font-normal text-gray-400">lotes</span></p>
          <p className="text-[11px] text-gray-400 mt-0.5">Espacio físico</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Lotes Asignados</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {lotesActivosTotal} <span className="text-xs font-normal text-gray-400">lotes ({plantasTotal} plantas)</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">En producción activa</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ocupación Global</p>
          <p className={`text-2xl font-bold mt-1 ${ocupacionPromedio >= 90 ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {ocupacionPromedio}%
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Uso de infraestructura</p>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="🔍 Buscar zona por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex-1 min-w-[200px]"
        />

        <select
          value={filtroCondicion}
          onChange={(e) => setFiltroCondicion(e.target.value)}
          className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todas las condiciones</option>
          <option value="INTERIOR">Interior</option>
          <option value="EXTERIOR">Exterior</option>
          <option value="INVERNADERO">Invernadero</option>
          <option value="SOMBRA_PARCIAL">Sombra Parcial</option>
          <option value="TUNEL">Túnel</option>
        </select>

        <select
          value={filtroSolar}
          onChange={(e) => setFiltroSolar(e.target.value)}
          className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Toda exposición solar</option>
          <option value="PLENO_SOL">Pleno Sol</option>
          <option value="SOMBRA_TOTAL">Sombra Total</option>
          <option value="MEDIA_SOMBRA">Media Sombra</option>
        </select>

        {(busqueda || filtroCondicion || filtroSolar) && (
          <button
            onClick={() => { setBusqueda(''); setFiltroCondicion(''); setFiltroSolar('') }}
            className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-500 underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Grid de Tarjetas de Zonas (HU21 / HU22) */}
      {cargando ? (
        <div className="py-20 text-center text-gray-400 dark:text-gray-500">
          <p className="text-3xl mb-2 animate-bounce">📍</p>
          <p>Cargando información de zonas...</p>
        </div>
      ) : zonasFiltradas.length === 0 ? (
        <div className="py-16 text-center text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-3xl mb-2">🌿</p>
          <p className="text-sm">No se encontraron zonas que coincidan con los filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {zonasFiltradas.map(zona => {
            const porcentaje = zona.porcentajeOcupacion || 0
            const alerta90 = porcentaje >= 90 || zona.alertaSupera90
            const libre = Math.max(0, zona.capacidadMaxima - (zona.lotesActivos || 0))

            return (
              <div
                key={zona.idZona}
                className={`bg-white dark:bg-gray-800 rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  alerta90
                    ? 'border-2 border-red-500 dark:border-red-600 ring-2 ring-red-500/20'
                    : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
                }`}
              >
                <div>
                  {/* Encabezado Tarjeta */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base leading-snug">
                        {zona.nombre}
                      </h3>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500">
                        ID: #{zona.idZona}
                      </p>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeColor(porcentaje)}`}>
                      {alerta90 ? '🚨 ' : ''}{porcentaje}% ocupado
                    </span>
                  </div>

                  {/* Alerta si supera 90% */}
                  {alerta90 && (
                    <div className="mb-3 p-1.5 bg-red-100 dark:bg-red-950/60 rounded-lg text-[10px] text-red-800 dark:text-red-200 font-bold flex items-center gap-1">
                      <span>⚠️</span> Capacidad crítica (&gt;90%).
                    </div>
                  )}

                  {/* Etiquetas de características */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-md border border-emerald-200 dark:border-emerald-800">
                      🏷️ {zona.tipoCondicion}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-md border border-amber-200 dark:border-amber-800">
                      ☀️ {zona.exposicionSolar}
                    </span>
                  </div>

                  {/* Estadísticas de Lotes y Plantas (HU22) */}
                  <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-50 dark:bg-gray-700/40 p-2.5 rounded-xl text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 block">Lotes</span>
                      <strong className="text-gray-800 dark:text-gray-100">{zona.lotesActivos || 0} / {zona.capacidadMaxima}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 block">Plantas Vivas</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">{zona.totalPlantas || 0} u.</strong>
                    </div>
                  </div>

                  {/* Barra de Progreso */}
                  <div className="space-y-1.5 mb-4">
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getBarColor(porcentaje)}`}
                        style={{ width: `${Math.min(100, porcentaje)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 dark:text-gray-500">
                      <span>{libre} espacio(s) disponible(s)</span>
                      <span>{alerta90 ? '🚨 Saturada' : 'Disponible'}</span>
                    </div>
                  </div>
                </div>

                {/* Botón Ver Detalle */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700/80">
                  <button
                    onClick={() => abrirDetalleZona(zona)}
                    className="w-full py-2 px-3 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>🌱</span> Ver Lotes Asignados ({zona.lotesActivos || 0}) →
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── MODAL DETALLE DE ZONA Y LOTES ASIGNADOS ── */}
      {modalDetalle.abierto && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            
            {/* Cabecera Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                    {modalDetalle.zona?.nombre}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Condición: <strong className="text-gray-700 dark:text-gray-200">{modalDetalle.zona?.tipoCondicion}</strong> • Exposición: <strong className="text-gray-700 dark:text-gray-200">{modalDetalle.zona?.exposicionSolar}</strong> • Capacidad: <strong className="text-emerald-700 dark:text-emerald-400">{modalDetalle.zona?.capacidadMaxima} lotes</strong>
                </p>
              </div>
              <button
                onClick={() => setModalDetalle({ abierto: false, zona: null, lotes: [], cargando: false, error: '' })}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto py-4">
              {modalDetalle.cargando ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                  <p className="text-2xl mb-2 animate-spin">🌿</p>
                  <p className="text-xs">Consultando lotes asignados...</p>
                </div>
              ) : modalDetalle.error ? (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 rounded-xl text-xs">
                  ⚠️ {modalDetalle.error}
                </div>
              ) : modalDetalle.lotes.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-500">
                  <p className="text-3xl mb-2">🌱</p>
                  <p className="text-sm font-medium">No hay lotes activos asignados a esta zona.</p>
                  <p className="text-xs mt-1">Puedes ubicar nuevos lotes germinando en este espacio.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
                    <span>Lotes activos en esta zona ({modalDetalle.lotes.length}):</span>
                    <span>Ocupación: {Math.round((modalDetalle.lotes.length / (modalDetalle.zona?.capacidadMaxima || 1)) * 100)}%</span>
                  </div>

                  <div className="border border-gray-100 dark:border-gray-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50/80 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-100 dark:border-gray-700">
                        <tr>
                          <th className="py-2.5 px-3">Código</th>
                          <th className="py-2.5 px-3">Especie</th>
                          <th className="py-2.5 px-3">Estado</th>
                          <th className="py-2.5 px-3">Plantas Vivas</th>
                          <th className="py-2.5 px-3">Siembra</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {modalDetalle.lotes.map(lote => (
                          <tr key={lote.idLote} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                            <td className="py-2.5 px-3 font-bold text-gray-800 dark:text-gray-100">
                              {lote.codigoLote}
                            </td>
                            <td className="py-2.5 px-3 text-emerald-700 dark:text-emerald-400 font-medium">
                              {lote.especie}
                            </td>
                            <td className="py-2.5 px-3">
                              <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md border ${ESTADO_BADGES[lote.estadoLote] || 'bg-gray-100'}`}>
                                {lote.estadoLote}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-700 dark:text-gray-200">
                              <span className="font-semibold">{lote.cantidadActual}</span>
                              <span className="text-gray-400 text-[10px]"> / {lote.cantidadInicial} u.</span>
                            </td>
                            <td className="py-2.5 px-3 text-gray-500 dark:text-gray-400">
                              {lote.fechaSiembra}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Pie Modal */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                type="button"
                onClick={() => setModalDetalle({ abierto: false, zona: null, lotes: [], cargando: false, error: '' })}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
