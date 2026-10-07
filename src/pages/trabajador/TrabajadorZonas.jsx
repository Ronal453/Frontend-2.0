import { useState, useEffect } from 'react'
import { getZonasOcupacion, getZonaDetalle } from '../../api/trabajadorApi'
import { 
  MapPin, AlertTriangle, RefreshCw, Sprout, Box, 
  Search, X, ExternalLink, Sun, Cloud, Thermometer, Layers, Loader2 
} from 'lucide-react'

const ESTADO_BADGES = {
  GERMINANDO: 'bg-transparent border-amber-300 dark:border-amber-700/50 text-amber-600 dark:text-amber-400',
  CRECIENDO: 'bg-transparent border-blue-300 dark:border-blue-700/50 text-blue-600 dark:text-blue-400',
  LISTO_PARA_VENTA: 'bg-transparent border-emerald-300 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400',
  DESCARTADO: 'bg-transparent border-red-300 dark:border-red-700/50 text-red-600 dark:text-red-400',
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

  // Zonas críticas >90%
  const zonasCriticas90 = zonas.filter(z => z.porcentajeOcupacion >= 90 || z.alertaSupera90)

  // Estadísticas globales
  const totalZonas = zonas.length
  const capacidadTotal = zonas.reduce((acc, z) => acc + (z.capacidadMaxima || 0), 0)
  const lotesActivosTotal = zonas.reduce((acc, z) => acc + (z.lotesActivos || 0), 0)
  const plantasTotal = zonas.reduce((acc, z) => acc + (z.totalPlantas || 0), 0)
  const ocupacionPromedio = capacidadTotal > 0 ? Math.round((lotesActivosTotal / capacidadTotal) * 100) : 0

  const getBarColor = (porcentaje) => {
    if (porcentaje >= 90) return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
    if (porcentaje >= 60) return 'bg-amber-500'
    return 'bg-emerald-500'
  }

  return (
    <div className="flex h-full animate-fade-in flex-col">
      <div className="flex-1 max-w-7xl mx-auto overflow-auto custom-scrollbar flex flex-col w-full pb-8">

        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <MapPin size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Ocupación de Zonas
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                Supervisa la distribución de lotes, plantas y capacidad instalada
              </p>
            </div>
          </div>
          <button
            onClick={cargarZonas}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 transition-all duration-200"
          >
            <RefreshCw size={18} /> Actualizar Datos
          </button>
        </div>

        {/* ALERTA DE SOBREPOBLACIÓN */}
        {zonasCriticas90.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border-2 border-red-200 dark:border-red-800/50 rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-400">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-black text-red-900 dark:text-red-300 text-lg">
                  Alerta de Capacidad: {zonasCriticas90.length} zona(s) superan el 90% de ocupación
                </h4>
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mt-1 mb-2">
                  Evita asignar nuevos lotes a estas zonas para prevenir sobrepoblación y estrés en las plantas:
                </p>
                <div className="flex flex-wrap gap-2">
                  {zonasCriticas90.map(z => (
                    <span key={z.idZona} className="inline-flex items-center gap-1.5 font-bold bg-white/60 dark:bg-slate-900/40 border border-red-200 dark:border-red-800 px-3 py-1 rounded-lg text-xs text-red-800 dark:text-red-300">
                      {z.nombre} <span className="text-red-500 dark:text-red-400">({z.porcentajeOcupacion}%)</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TARJETAS KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <MapPin size={80} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Zonas de Cultivo</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{totalZonas}</p>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Espacios disponibles</p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Box size={80} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Capacidad Total</p>
            <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{capacidadTotal} <span className="text-sm font-bold text-slate-400">lotes</span></p>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Espacio físico total</p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 text-emerald-500 group-hover:opacity-10 transition-opacity">
              <Sprout size={80} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Lotes Asignados</p>
            <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{lotesActivosTotal} <span className="text-sm font-bold opacity-60">lotes</span></p>
            <p className="text-[11px] font-medium text-slate-400 mt-1">En producción activa ({plantasTotal} plantas)</p>
          </div>

          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Layers size={80} />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Ocupación Global</p>
            <p className={`text-3xl font-black ${ocupacionPromedio >= 90 ? 'text-red-500' : 'text-teal-600 dark:text-teal-400'}`}>
              {ocupacionPromedio}%
            </p>
            <p className="text-[11px] font-medium text-slate-400 mt-1">Uso de infraestructura</p>
          </div>
        </div>

        {/* FILTROS DE BÚSQUEDA */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm flex flex-col md:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar zona por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-shadow text-slate-700 dark:text-slate-200"
            />
          </div>

          <select
            value={filtroCondicion}
            onChange={(e) => setFiltroCondicion(e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
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
            className="w-full md:w-56 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">Toda exposición solar</option>
            <option value="PLENO_SOL">Pleno Sol</option>
            <option value="SOMBRA_TOTAL">Sombra Total</option>
            <option value="MEDIA_SOMBRA">Media Sombra</option>
          </select>

          {(busqueda || filtroCondicion || filtroSolar) && (
            <button
              onClick={() => { setBusqueda(''); setFiltroCondicion(''); setFiltroSolar('') }}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-2xl text-sm font-bold flex items-center gap-2">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {/* GRID DE ZONAS */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-24 flex-1">
            <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando información de zonas...</p>
          </div>
        ) : zonasFiltradas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400 bg-white/40 dark:bg-slate-800/30 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 flex-1">
            <MapPin size={48} className="mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1} />
            <p className="font-medium text-sm">No se encontraron zonas que coincidan con los filtros.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {zonasFiltradas.map(zona => {
              const porcentaje = zona.porcentajeOcupacion || 0
              const alerta90 = porcentaje >= 90 || zona.alertaSupera90
              const libre = Math.max(0, zona.capacidadMaxima - (zona.lotesActivos || 0))

              return (
                <div
                  key={zona.idZona}
                  className={`bg-white/90 dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-5 shadow-sm transition-all flex flex-col justify-between group ${
                    alerta90
                      ? 'border-2 border-red-400 dark:border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : 'border border-slate-200 dark:border-slate-700 hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700'
                  }`}
                >
                  <div>
                    {/* Header Tarjeta */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {zona.nombre}
                        </h3>
                        <p className="text-xs font-bold text-slate-400 mt-0.5 font-mono">ID: #{zona.idZona}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                        alerta90 
                          ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50' 
                          : 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/30 dark:text-teal-400 dark:border-teal-800/50'
                      }`}>
                        {porcentaje}% Ocup.
                      </div>
                    </div>

                    {/* Etiquetas */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
                        <Thermometer size={12} /> {zona.tipoCondicion}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
                        {zona.exposicionSolar.includes('SOL') ? <Sun size={12} /> : <Cloud size={12} />} {zona.exposicionSolar}
                      </span>
                    </div>

                    {/* Alerta si es 90% */}
                    {alerta90 && (
                      <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-[11px] font-bold text-red-600 dark:text-red-400 px-3 py-2 rounded-xl flex items-center gap-1.5 border border-red-100 dark:border-red-800/30">
                        <AlertTriangle size={14} /> Capacidad crítica ({porcentaje}%)
                      </div>
                    )}

                    {/* Stats de Lotes y Plantas */}
                    <div className="grid grid-cols-2 gap-3 mb-4 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Lotes</span>
                        <div className="flex items-end gap-1">
                          <strong className="text-lg leading-none text-slate-800 dark:text-slate-100">{zona.lotesActivos || 0}</strong>
                          <span className="text-xs font-medium text-slate-400 mb-0.5">/ {zona.capacidadMaxima}</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">Plantas Vivas</span>
                        <strong className="text-lg leading-none text-emerald-600 dark:text-emerald-400">{zona.totalPlantas || 0}</strong>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 mb-5">
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden border border-slate-200 dark:border-slate-600/50">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${getBarColor(porcentaje)}`}
                          style={{ width: `${Math.min(100, porcentaje)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <span>{libre} espacio(s) libres</span>
                        <span className={alerta90 ? 'text-red-500' : ''}>{alerta90 ? 'Saturada' : 'Disponible'}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => abrirDetalleZona(zona)}
                    className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-teal-50 dark:hover:bg-teal-900/30 text-slate-600 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-400 border border-slate-200 dark:border-slate-700 hover:border-teal-200 dark:hover:border-teal-800/50 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 group-hover:bg-teal-50 dark:group-hover:bg-teal-900/20 group-hover:border-teal-200 dark:group-hover:border-teal-800/50"
                  >
                    <ExternalLink size={16} className="text-slate-400 group-hover:text-teal-500 transition-colors" /> 
                    Ver {zona.lotesActivos || 0} Lotes
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* MODAL DETALLE DE ZONA Y LOTES ASIGNADOS */}
      {modalDetalle.abierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden">
            
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                    {modalDetalle.zona?.nombre}
                  </h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                    <span>Condición: <strong className="text-slate-700 dark:text-slate-300">{modalDetalle.zona?.tipoCondicion}</strong></span>
                    <span>Luz: <strong className="text-slate-700 dark:text-slate-300">{modalDetalle.zona?.exposicionSolar}</strong></span>
                    <span>Capacidad: <strong className="text-teal-600 dark:text-teal-400">{modalDetalle.zona?.capacidadMaxima} lotes</strong></span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setModalDetalle({ abierto: false, zona: null, lotes: [], cargando: false, error: '' })}
                className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-white dark:bg-slate-900">
              {modalDetalle.cargando ? (
                <div className="py-16 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-10 h-10 animate-spin mb-4 text-teal-500" />
                  <p className="font-bold text-sm">Consultando lotes asignados...</p>
                </div>
              ) : modalDetalle.error ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-2xl text-sm font-bold flex items-center gap-2">
                  <AlertTriangle size={18} /> {modalDetalle.error}
                </div>
              ) : modalDetalle.lotes.length === 0 ? (
                <div className="py-16 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <Box size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1} />
                  <p className="font-bold text-slate-600 dark:text-slate-300 mb-1">No hay lotes activos en esta zona.</p>
                  <p className="text-xs">Espacio libre para asignar nuevos cultivos.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                      Lotes activos ({modalDetalle.lotes.length})
                    </span>
                    <span className="text-[10px] font-black bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 px-3 py-1 rounded-lg border border-teal-200/50 dark:border-teal-800/50">
                      Ocupación: {Math.round((modalDetalle.lotes.length / (modalDetalle.zona?.capacidadMaxima || 1)) * 100)}%
                    </span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-100/80 dark:bg-slate-800/80 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="py-3 px-4">Código / Especie</th>
                          <th className="py-3 px-4">Estado</th>
                          <th className="py-3 px-4 text-center">Plantas Vivas</th>
                          <th className="py-3 px-4">Fecha Siembra</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 bg-white dark:bg-slate-900">
                        {modalDetalle.lotes.map(lote => (
                          <tr key={lote.idLote} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-slate-800 dark:text-slate-100 text-xs font-mono">{lote.codigoLote}</div>
                              <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400">{lote.especie}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${ESTADO_BADGES[lote.estadoLote] || 'bg-slate-100 border-slate-200'}`}>
                                {lote.estadoLote === 'LISTO_PARA_VENTA' ? 'LISTO PARA VENTA' : lote.estadoLote}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span className="font-black text-slate-800 dark:text-slate-200 text-sm">{lote.cantidadActual}</span>
                              <span className="text-slate-400 text-xs font-medium"> / {lote.cantidadInicial}</span>
                            </td>
                            <td className="py-3 px-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                              {new Date(lote.fechaSiembra).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            
            <div className="pt-4 pb-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-end">
              <button
                type="button"
                onClick={() => setModalDetalle({ abierto: false, zona: null, lotes: [], cargando: false, error: '' })}
                className="px-6 py-2.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Cerrar Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
