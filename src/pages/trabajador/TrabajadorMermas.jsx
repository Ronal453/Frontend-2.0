import { useState, useEffect } from 'react'
import {
  getCausasMerma,
  getLotes,
  registrarMerma,
  getMermasRecientes
} from '../../api/trabajadorApi'
import { 
  AlertTriangle, RefreshCw, ClipboardList, Bug, Sprout, 
  MapPin, Loader2, ArrowDownRight, User, Calendar
} from 'lucide-react'

export default function TrabajadorMermas() {
  const [lotes, setLotes] = useState([])
  const [causas, setCausas] = useState([])
  const [mermas, setMermas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [mensajeExito, setMensajeExito] = useState('')
  const [error, setError] = useState('')

  // Formulario
  const [form, setForm] = useState({
    idLote: '',
    idCausa: '',
    cantidadPerdida: 1,
    fechaMerma: new Date().toISOString().split('T')[0],
    observaciones: '',
  })

  // Cargar datos iniciales
  const cargarDatos = async () => {
    setCargando(true)
    setError('')
    try {
      const [resCausas, resLotes, resMermas] = await Promise.all([
        getCausasMerma(),
        getLotes({ size: 100 }), // Obtener lotes activos
        getMermasRecientes(30),
      ])

      setCausas(resCausas.data)
      setLotes(resLotes.data.content || [])
      setMermas(resMermas.data || [])

      if (resCausas.data.length > 0 && !form.idCausa) {
        setForm(prev => ({ ...prev, idCausa: resCausas.data[0].idCausa }))
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar los datos operativos')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const loteSeleccionado = lotes.find(l => String(l.idLote) === String(form.idLote))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.idLote || !form.idCausa || !form.cantidadPerdida || !form.observaciones.trim()) {
      alert('Por favor completa todos los campos requeridos, incluyendo los detalles de la merma.')
      return
    }

    if (loteSeleccionado && form.cantidadPerdida > loteSeleccionado.cantidadActual) {
      alert(`La cantidad de merma no puede superar el stock actual del lote (${loteSeleccionado.cantidadActual} u.)`)
      return
    }

    setEnviando(true)
    setMensajeExito('')
    setError('')

    try {
      await registrarMerma({
        idLote: Number(form.idLote),
        idCausa: Number(form.idCausa),
        cantidadPerdida: Number(form.cantidadPerdida),
        fechaMerma: form.fechaMerma,
        observaciones: form.observaciones,
      })

      setMensajeExito('Merma registrada con éxito y descontada del lote de producción')
      setForm(prev => ({
        ...prev,
        cantidadPerdida: 1,
        observaciones: '',
      }))

      // Recargar datos actualizados
      await cargarDatos()
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al registrar la merma')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="flex h-full animate-fade-in flex-col">
      <div className="flex-1 max-w-7xl mx-auto overflow-auto custom-scrollbar flex flex-col w-full pb-8">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Control de Mermas
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                Reporta pérdidas por plagas, clima o factores biológicos y actualiza el stock real
              </p>
            </div>
          </div>
          <button
            onClick={cargarDatos}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-200"
          >
            <RefreshCw size={18} /> Actualizar Datos
          </button>
        </div>

        {mensajeExito && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 rounded-2xl text-sm font-bold flex items-center gap-2 animate-fade-in">
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
              <ArrowDownRight size={14} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            {mensajeExito}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-2xl text-sm font-bold flex items-center gap-2 animate-fade-in">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* FORMULARIO DE REGISTRO */}
          <div className="lg:col-span-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-6 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 h-fit">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-5 flex items-center gap-2">
              <Bug size={20} className="text-amber-500" />
              Reportar Pérdida
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selección de Lote */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Lote Afectado *
                </label>
                <select
                  value={form.idLote}
                  onChange={(e) => setForm(prev => ({ ...prev, idLote: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-shadow text-slate-700 dark:text-slate-200"
                  required
                >
                  <option value="">Selecciona un lote activo...</option>
                  {lotes
                    .filter(l => l.estadoLote !== 'DESCARTADO' && l.cantidadActual > 0)
                    .map(l => (
                      <option key={l.idLote} value={l.idLote}>
                        {l.codigoLote} — {l.especie} ({l.cantidadActual} u.)
                      </option>
                    ))}
                </select>

                {loteSeleccionado && (
                  <div className="mt-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 border border-amber-100/50 dark:border-amber-800/30 space-y-2 animate-fade-in">
                    <p className="flex items-center gap-1.5"><MapPin size={14} className="text-amber-500" /> <span className="font-bold text-slate-700 dark:text-slate-300">Zona:</span> {loteSeleccionado.nombreZona || 'Sin asignar'}</p>
                    <p className="flex items-center gap-1.5"><Sprout size={14} className="text-teal-500" /> <span className="font-bold text-slate-700 dark:text-slate-300">Estado:</span> {loteSeleccionado.estadoLote}</p>
                    <p className="flex items-center gap-1.5"><ClipboardList size={14} className="text-blue-500" /> <span className="font-bold text-slate-700 dark:text-slate-300">Disponible:</span> {loteSeleccionado.cantidadActual} plantas</p>
                  </div>
                )}
              </div>

              {/* Causa de Merma */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                  Causa Principal *
                </label>
                <select
                  value={form.idCausa}
                  onChange={(e) => setForm(prev => ({ ...prev, idCausa: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-shadow text-slate-700 dark:text-slate-200"
                  required
                >
                  {causas.map(c => (
                    <option key={c.idCausa} value={c.idCausa}>
                      {c.nombreCausa}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidad y Fecha */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Cant. Perdida *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={loteSeleccionado?.cantidadActual || 9999}
                    value={form.cantidadPerdida}
                    onChange={(e) => setForm(prev => ({ ...prev, cantidadPerdida: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-shadow text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                    Fecha Evento *
                  </label>
                  <input
                    type="date"
                    value={form.fechaMerma}
                    onChange={(e) => setForm(prev => ({ ...prev, fechaMerma: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 outline-none transition-shadow text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>
              </div>

              {/* Observaciones */}
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-red-600 dark:text-red-400">
                  Descripción (Obligatoria) *
                </label>
                <textarea
                  rows="3"
                  value={form.observaciones}
                  onChange={(e) => setForm(prev => ({ ...prev, observaciones: e.target.value }))}
                  placeholder="Ej: Infección en hojas basales, tallo roto por el viento, etc."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-red-200 dark:border-red-900/50 rounded-xl text-sm font-medium focus:ring-2 focus:ring-red-500 outline-none transition-shadow resize-none text-slate-700 dark:text-slate-200"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={enviando || !form.idLote}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {enviando ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} />} 
                  {enviando ? 'Registrando Pérdida...' : 'Registrar y Descontar'}
                </button>
              </div>
            </form>
          </div>

          {/* HISTORIAL DE MERMAS RECIENTES */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ClipboardList size={20} className="text-slate-400" />
                Pérdidas Recientes Registradas
              </h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                Últimos 30 ({mermas.length})
              </span>
            </div>

            {cargando ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
                <p className="font-bold text-sm">Cargando registro de mermas...</p>
              </div>
            ) : mermas.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
                <Bug size={48} className="mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1} />
                <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No hay mermas registradas recientemente.</p>
                <p className="text-xs">Todos los cultivos gozan de buena salud.</p>
              </div>
            ) : (
              <div className="overflow-x-auto flex-1 custom-scrollbar">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-200 dark:bg-slate-700/80 border-b-2 border-slate-300 dark:border-slate-600">
                    <tr>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 whitespace-nowrap">Fecha</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Lote / Especie</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Causa</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Pérdida</th>
                      <th className="px-5 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Operador</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {mermas.map(m => (
                      <tr key={m.idMerma} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors duration-200">
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            <Calendar size={14} className="text-slate-400" />
                            {new Date(m.fechaMerma).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-slate-800 dark:text-slate-100 font-mono text-xs tracking-tight">
                            {m.codigoLote || `Lote #${m.idLote}`}
                          </div>
                          {m.especieLote && (
                            <div className="text-[11px] font-bold text-teal-600 dark:text-teal-400 mt-0.5">
                              {m.especieLote}
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="inline-flex text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-transparent border-amber-300 dark:border-amber-700/50 text-amber-700 dark:text-amber-400">
                            {m.nombreCausa}
                          </span>
                          {m.observaciones && (
                            <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 italic max-w-[200px] truncate" title={m.observaciones}>
                              "{m.observaciones}"
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex items-center gap-1 font-black text-red-600 dark:text-red-400 text-sm">
                            <ArrowDownRight size={14} />
                            {m.cantidadPerdida}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <User size={14} className="text-slate-400" />
                            {m.nombreUsuario || 'Usuario'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
