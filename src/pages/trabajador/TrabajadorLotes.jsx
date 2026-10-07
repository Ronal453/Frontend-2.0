import { useState, useEffect } from 'react'
import {
  getLotes,
  cambiarEstadoLote,
  getHistorialLote,
  getZonas,
  getCausasMerma,
  registrarMerma
} from '../../api/trabajadorApi'
import { 
  Sprout, Search, RefreshCw, AlertTriangle, ArrowRight, X, 
  MapPin, Loader2, History, Leaf, CheckCircle2, Store, Trash2
} from 'lucide-react'
import Input from '../../components/ui/Input'

const ESTADOS_LOTE = [
  { id: '', label: 'Todos los estados' },
  { id: 'GERMINANDO', label: 'Germinando' },
  { id: 'CRECIENDO', label: 'Creciendo' },
  { id: 'LISTO_PARA_VENTA', label: 'Listo para Venta' },
  { id: 'EN_TIENDA', label: 'En Tienda' },
  { id: 'DESCARTADO', label: 'Descartado' },
]

const ESTADO_BADGES = {
  GERMINANDO: 'bg-transparent border-amber-300 dark:border-amber-700/50 text-amber-600 dark:text-amber-400',
  CRECIENDO: 'bg-transparent border-blue-300 dark:border-blue-700/50 text-blue-600 dark:text-blue-400',
  LISTO_PARA_VENTA: 'bg-transparent border-emerald-300 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400',
  EN_TIENDA: 'bg-transparent border-purple-300 dark:border-purple-700/50 text-purple-600 dark:text-purple-400',
  DESCARTADO: 'bg-transparent border-red-300 dark:border-red-700/50 text-red-600 dark:text-red-400',
}

export default function TrabajadorLotes() {
  const [lotes, setLotes] = useState([])
  const [zonas, setZonas] = useState([])
  const [filtroZona, setFiltroZona] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBuscar, setFiltroBuscar] = useState('')
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalEstado, setModalEstado] = useState({
    abierto: false,
    lote: null,
    nuevoEstado: '',
    observaciones: '',
    enviando: false,
  })

  const [modalHistorial, setModalHistorial] = useState({
    abierto: false,
    lote: null,
    historial: [],
    cargando: false,
  })

  const [modalMerma, setModalMerma] = useState({
    abierto: false,
    lote: null,
    causas: [],
    idCausa: '',
    cantidadPerdida: 1,
    fechaMerma: new Date().toISOString().split('T')[0],
    observaciones: '',
    enviando: false,
  })

  useEffect(() => {
    getZonas()
      .then(res => setZonas(res.data))
      .catch(err => console.error('Error cargando zonas:', err))
  }, [])

  const cargarLotes = async () => {
    setCargando(true)
    setError('')
    try {
      const res = await getLotes({
        idZona: filtroZona || undefined,
        estado: filtroEstado || undefined,
        buscar: filtroBuscar || undefined,
        page: pagina,
        size: 10,
      })
      setLotes(res.data.content || [])
      setTotalPaginas(res.data.totalPages || 1)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar los lotes')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarLotes()
  }, [filtroZona, filtroEstado, filtroBuscar, pagina])

  const abrirCambioEstado = (lote) => {
    let sugerido = ''
    if (lote.estadoLote === 'GERMINANDO') sugerido = 'CRECIENDO'
    else if (lote.estadoLote === 'CRECIENDO') sugerido = 'LISTO_PARA_VENTA'

    setModalEstado({
      abierto: true,
      lote,
      nuevoEstado: sugerido,
      observaciones: '',
      enviando: false,
    })
  }

  const ejecutarCambioEstado = async (e) => {
    e.preventDefault()
    const { lote, nuevoEstado, observaciones } = modalEstado
    if (!lote || !nuevoEstado) return

    setModalEstado(prev => ({ ...prev, enviando: true }))
    try {
      await cambiarEstadoLote(lote.idLote, nuevoEstado, observaciones)
      setModalEstado({ abierto: false, lote: null, nuevoEstado: '', observaciones: '', enviando: false })
      await cargarLotes()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al actualizar el estado del lote')
      setModalEstado(prev => ({ ...prev, enviando: false }))
    }
  }

  const abrirHistorial = async (lote) => {
    setModalHistorial({ abierto: true, lote, historial: [], cargando: true })
    try {
      const res = await getHistorialLote(lote.idLote)
      setModalHistorial({ abierto: true, lote, historial: res.data, cargando: false })
    } catch (err) {
      console.error(err)
      setModalHistorial(prev => ({ ...prev, cargando: false }))
    }
  }

  const abrirModalMerma = async (lote) => {
    setModalMerma({
      abierto: true,
      lote,
      causas: [],
      idCausa: '',
      cantidadPerdida: 1,
      fechaMerma: new Date().toISOString().split('T')[0],
      observaciones: '',
      enviando: false,
    })
    try {
      const res = await getCausasMerma()
      setModalMerma(prev => ({
        ...prev,
        causas: res.data,
        idCausa: res.data[0]?.idCausa || '',
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const ejecutarRegistroMerma = async (e) => {
    e.preventDefault()
    const { lote, idCausa, cantidadPerdida, fechaMerma, observaciones } = modalMerma
    if (!lote || !idCausa) return

    setModalMerma(prev => ({ ...prev, enviando: true }))
    try {
      await registrarMerma({
        idLote: lote.idLote,
        idCausa: Number(idCausa),
        cantidadPerdida: Number(cantidadPerdida),
        fechaMerma,
        observaciones,
      })
      setModalMerma({ abierto: false, lote: null, causas: [], idCausa: '', cantidadPerdida: 1, fechaMerma: '', observaciones: '', enviando: false })
      await cargarLotes()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al registrar la merma')
      setModalMerma(prev => ({ ...prev, enviando: false }))
    }
  }

  return (
    <div className="flex h-full animate-fade-in">
      <div className="flex-1 max-w-7xl mx-auto overflow-auto custom-scrollbar flex flex-col">

        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Sprout size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Control de Lotes
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                Supervisa el crecimiento, trazabilidad y estado de la producción
              </p>
            </div>
          </div>
        </div>

        {/* FILTROS */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 md:p-5 mb-6 flex flex-col lg:flex-row gap-4 shadow-sm items-center">
          <div className="relative flex-1 w-full min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar lote o especie..."
              value={filtroBuscar}
              onChange={(e) => { setFiltroBuscar(e.target.value); setPagina(0) }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-shadow text-slate-700 dark:text-slate-200"
            />
          </div>

          <select
            value={filtroZona}
            onChange={(e) => { setFiltroZona(e.target.value); setPagina(0) }}
            className="w-full lg:w-48 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">Todas las zonas</option>
            {zonas.map(z => <option key={z.idZona} value={z.idZona}>{z.nombre}</option>)}
          </select>

          <select
            value={filtroEstado}
            onChange={(e) => { setFiltroEstado(e.target.value); setPagina(0) }}
            className="w-full lg:w-48 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
          >
            {ESTADOS_LOTE.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>

          <button
            onClick={cargarLotes}
            title="Refrescar lotes"
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-2xl text-sm font-bold flex items-center gap-2">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {/* TABLA DE LOTES */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-3xl shadow-sm flex flex-col flex-1 overflow-hidden">
          {cargando ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="font-medium">Cargando lotes...</p>
            </div>
          ) : lotes.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center py-20 text-slate-400">
              <Sprout className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" strokeWidth={1.5} />
              <p className="font-medium">No se encontraron lotes con los filtros actuales.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1 custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-700/80 border-b-2 border-slate-300 dark:border-slate-600">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Código / Especie</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Ubicación</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Stock (Act/Ini)</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Fecha Siembra</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Estado</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {lotes.map(lote => (
                    <tr key={lote.idLote} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100 font-mono text-sm tracking-tight">{lote.codigoLote}</div>
                        <div className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1">{lote.especie}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <MapPin size={14} className="text-slate-400" />
                          {lote.nombreZona || 'Sin asignar'}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-black ${lote.cantidadActual === 0 ? 'text-red-500' : 'text-slate-800 dark:text-slate-100'}`}>
                              {lote.cantidadActual}
                            </span>
                            <span className="text-xs font-medium text-slate-400">/ {lote.cantidadInicial}</span>
                          </div>
                          {lote.cantidadActual < lote.cantidadInicial && (
                            <span className="text-[10px] font-bold text-amber-500 mt-0.5">
                              -{lote.cantidadInicial - lote.cantidadActual} mermas
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {new Date(lote.fechaSiembra).toLocaleDateString()}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${ESTADO_BADGES[lote.estadoLote] || 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                          {lote.estadoLote === 'LISTO_PARA_VENTA' ? 'LISTO PARA VENTA' : lote.estadoLote}
                        </span>
                      </td>

                      <td className="px-6 py-4 flex items-center justify-end gap-2">
                        {!['DESCARTADO', 'EN_TIENDA'].includes(lote.estadoLote) && (
                          <button
                            onClick={() => abrirCambioEstado(lote)}
                            className="px-2.5 py-1.5 bg-teal-50 border border-teal-200 hover:bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:border-teal-800/50 dark:text-teal-400 dark:hover:bg-teal-900/60 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            Avanzar <ArrowRight size={14} />
                          </button>
                        )}
                        {lote.cantidadActual > 0 && !['DESCARTADO', 'EN_TIENDA'].includes(lote.estadoLote) && (
                          <button
                            onClick={() => abrirModalMerma(lote)}
                            title="Reportar merma"
                            className="px-2.5 py-1.5 bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:border-amber-800/50 dark:text-amber-400 dark:hover:bg-amber-900/60 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                          >
                            <AlertTriangle size={14} /> Merma
                          </button>
                        )}
                        <button
                          onClick={() => abrirHistorial(lote)}
                          className="px-2.5 py-1.5 bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <History size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* PAGINACIÓN */}
              {totalPaginas > 1 && (
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Página {pagina + 1} de {totalPaginas}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagina(p => Math.max(0, p - 1))}
                      disabled={pagina === 0}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setPagina(p => Math.min(totalPaginas - 1, p + 1))}
                      disabled={pagina >= totalPaginas - 1}
                      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* MODAL AVANZAR ESTADO */}
      {modalEstado.abierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <ArrowRight size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Avanzar Estado</h2>
              </div>
              <button onClick={() => setModalEstado(prev => ({ ...prev, abierto: false }))} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5 bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/50">
                <span className="font-black text-[10px] uppercase tracking-widest text-teal-600 dark:text-teal-400 block mb-1">Lote Seleccionado</span>
                <p className="font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight text-sm">
                  {modalEstado.lote?.codigoLote} <span className="font-medium font-sans ml-1">({modalEstado.lote?.especie})</span>
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400">
                  Estado actual: <span className="bg-white/60 dark:bg-slate-800/50 py-1 px-2 rounded-lg border border-teal-200/50">{modalEstado.lote?.estadoLote}</span>
                </div>
              </div>

              <form onSubmit={ejecutarCambioEstado} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Nuevo Estado *</label>
                  <select
                    value={modalEstado.nuevoEstado}
                    onChange={(e) => setModalEstado(prev => ({ ...prev, nuevoEstado: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
                    required
                  >
                    <option value="">Selecciona un estado...</option>
                    {modalEstado.lote?.estadoLote === 'GERMINANDO' && <option value="CRECIENDO">CRECIENDO (Fase vegetativa)</option>}
                    {modalEstado.lote?.estadoLote === 'CRECIENDO' && <option value="LISTO_PARA_VENTA">LISTO PARA VENTA (Madurez)</option>}
                    <option value="DESCARTADO">DESCARTADO (Pérdida total)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Observaciones Técnicas (Opcional)</label>
                  <textarea
                    rows="3"
                    value={modalEstado.observaciones}
                    onChange={(e) => setModalEstado(prev => ({ ...prev, observaciones: e.target.value }))}
                    placeholder="Ej: Plantas alcanzaron 25cm de altura..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-shadow resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setModalEstado(prev => ({ ...prev, abierto: false }))} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">Cancelar</button>
                  <button type="submit" disabled={modalEstado.enviando || !modalEstado.nuevoEstado} className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold rounded-xl shadow-md shadow-teal-500/20 disabled:opacity-50 flex items-center gap-2">
                    {modalEstado.enviando ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />} Actualizar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRO DE MERMA */}
      {modalMerma.abierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Reportar Merma</h2>
              </div>
              <button onClick={() => setModalMerma(prev => ({ ...prev, abierto: false }))} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-5 bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/50">
                <span className="font-black text-[10px] uppercase tracking-widest text-amber-600 dark:text-amber-400 block mb-1">Lote Afectado</span>
                <p className="font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight text-sm">
                  {modalMerma.lote?.codigoLote} <span className="font-medium font-sans ml-1">({modalMerma.lote?.especie})</span>
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-white/60 dark:bg-slate-800/50 py-1 px-2.5 rounded-lg border border-amber-200/50 w-fit">
                  <Sprout size={14} /> Stock actual: {modalMerma.lote?.cantidadActual} u.
                </div>
              </div>

              <form onSubmit={ejecutarRegistroMerma} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Causa Principal *</label>
                  <select
                    value={modalMerma.idCausa}
                    onChange={(e) => setModalMerma(prev => ({ ...prev, idCausa: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-shadow"
                    required
                  >
                    {modalMerma.causas.map(c => <option key={c.idCausa} value={c.idCausa}>{c.nombreCausa}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Cant. Perdida *"
                    type="number"
                    min="1"
                    max={modalMerma.lote?.cantidadActual || 1}
                    value={modalMerma.cantidadPerdida}
                    onChange={(e) => setModalMerma(prev => ({ ...prev, cantidadPerdida: e.target.value }))}
                    required
                  />
                  <Input
                    label="Fecha de Pérdida *"
                    type="date"
                    value={modalMerma.fechaMerma}
                    onChange={(e) => setModalMerma(prev => ({ ...prev, fechaMerma: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Detalles (Opcional)</label>
                  <textarea
                    rows="2"
                    value={modalMerma.observaciones}
                    onChange={(e) => setModalMerma(prev => ({ ...prev, observaciones: e.target.value }))}
                    placeholder="Ej: Infección en hojas basales..."
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-shadow resize-none"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setModalMerma(prev => ({ ...prev, abierto: false }))} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">Cancelar</button>
                  <button type="submit" disabled={modalMerma.enviando} className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2">
                    {modalMerma.enviando ? <Loader2 size={16} className="animate-spin" /> : <AlertTriangle size={16} />} Reportar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HISTORIAL */}
      {modalHistorial.abierto && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <History size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Trazabilidad de Lote</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{modalHistorial.lote?.codigoLote} - {modalHistorial.lote?.especie}</p>
                </div>
              </div>
              <button onClick={() => setModalHistorial(prev => ({ ...prev, abierto: false }))} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-6">
              {modalHistorial.cargando ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                  <Loader2 className="w-8 h-8 text-slate-300 animate-spin mb-3" />
                  <span className="font-bold text-sm">Cargando trazabilidad...</span>
                </div>
              ) : modalHistorial.historial.length === 0 ? (
                <div className="py-10 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-slate-400 font-medium text-sm">
                  Sin cambios registrados aún.
                </div>
              ) : (
                <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  {modalHistorial.historial.map((h, i) => (
                    <div key={h.idHistorialLote} className="relative pl-6 before:absolute before:left-2.5 before:top-8 before:bottom-[-20px] before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700 last:before:hidden">
                      <div className="absolute left-0 top-1.5 w-[22px] h-[22px] rounded-full bg-emerald-100 dark:bg-emerald-900/50 border-[3px] border-white dark:border-slate-900 flex items-center justify-center z-10">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">
                            <span className="text-slate-400 font-medium">{h.estadoAnterior}</span> &rarr; <span className="text-emerald-600 dark:text-emerald-400">{h.estadoNuevo}</span>
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {new Date(h.fechaCambio).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Operador: <span className="text-slate-700 dark:text-slate-300">{h.nombreUsuario || 'Sistema'}</span></p>
                        {h.observaciones && (
                          <div className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 italic">
                            "{h.observaciones}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
