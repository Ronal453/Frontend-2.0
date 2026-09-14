import { useState, useEffect } from 'react'
import {
  getCausasMerma,
  getLotes,
  registrarMerma,
  getMermasRecientes
} from '../../api/trabajadorApi'

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
    if (!form.idLote || !form.idCausa || !form.cantidadPerdida) {
      alert('Por favor completa los campos requeridos')
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

      setMensajeExito('✅ Merma registrada con éxito y descontada del lote de producción')
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
    <div className="space-y-6">
      {/* Cabecera */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            ⚠️ Registro y Control de Mermas
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Reporta pérdidas por plagas, clima o factores biológicos con descuento automático del cultivo
          </p>
        </div>
        <button
          onClick={cargarDatos}
          title="Refrescar datos"
          className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors text-sm"
        >
          🔄
        </button>
      </div>

      {mensajeExito && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium animate-in fade-in">
          {mensajeExito}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulario de Registro */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            📝 Reportar Pérdida
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Selección de Lote */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Lote Afectado *
              </label>
              <select
                value={form.idLote}
                onChange={(e) => setForm(prev => ({ ...prev, idLote: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Selecciona un lote activo...</option>
                {lotes
                  .filter(l => l.estadoLote !== 'DESCARTADO' && l.cantidadActual > 0)
                  .map(l => (
                    <option key={l.idLote} value={l.idLote}>
                      {l.codigoLote} — {l.especie} (Stock: {l.cantidadActual} u.)
                    </option>
                  ))}
              </select>

              {loteSeleccionado && (
                <div className="mt-2 p-2.5 bg-gray-50 rounded-lg text-[11px] text-gray-600 border border-gray-100">
                  <p>📍 <strong>Zona:</strong> {loteSeleccionado.nombreZona || 'Sin asignar'}</p>
                  <p>🌿 <strong>Estado:</strong> {loteSeleccionado.estadoLote}</p>
                  <p>📦 <strong>Disponible:</strong> {loteSeleccionado.cantidadActual} plantas</p>
                </div>
              )}
            </div>

            {/* Causa de Merma */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Causa de la Pérdida *
              </label>
              <select
                value={form.idCausa}
                onChange={(e) => setForm(prev => ({ ...prev, idCausa: e.target.value }))}
                className="w-full border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Cantidad Perdida *
                </label>
                <input
                  type="number"
                  min="1"
                  max={loteSeleccionado?.cantidadActual || 9999}
                  value={form.cantidadPerdida}
                  onChange={(e) => setForm(prev => ({ ...prev, cantidadPerdida: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Fecha de Evento *
                </label>
                <input
                  type="date"
                  value={form.fechaMerma}
                  onChange={(e) => setForm(prev => ({ ...prev, fechaMerma: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            {/* Observaciones */}
            <div>
              <label className="block font-semibold text-gray-700 mb-1">
                Observaciones y Diagnóstico
              </label>
              <textarea
                rows="3"
                value={form.observaciones}
                onChange={(e) => setForm(prev => ({ ...prev, observaciones: e.target.value }))}
                placeholder="Describe el síntoma observado, zona foliar afectada o medidas aplicadas..."
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={enviando || !form.idLote}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-sm transition-colors disabled:opacity-50 text-sm mt-2"
            >
              {enviando ? 'Registrando Pérdida...' : 'Registrar y Descontar Merma'}
            </button>
          </form>
        </div>

        {/* Historial de Mermas Recientes */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
            <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
              📋 Pérdidas Recientes Registradas ({mermas.length})
            </h2>
            <span className="text-xs text-gray-400">Últimos reportes del vivero</span>
          </div>

          {cargando ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-3xl mb-2 animate-bounce">🍂</p>
              <p className="text-xs">Cargando registro de mermas...</p>
            </div>
          ) : mermas.length === 0 ? (
            <div className="py-20 text-center text-gray-400">
              <p className="text-3xl mb-2">🌿</p>
              <p className="text-xs">No hay mermas registradas en el sistema.</p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                    <th className="py-3 px-3">Fecha</th>
                    <th className="py-3 px-3">Lote / Especie</th>
                    <th className="py-3 px-3">Causa</th>
                    <th className="py-3 px-3 text-center">Pérdida</th>
                    <th className="py-3 px-3">Operador</th>
                    <th className="py-3 px-3">Observaciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mermas.map(m => (
                    <tr key={m.idMerma} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 px-3 text-gray-500 whitespace-nowrap">
                        {m.fechaMerma}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-gray-800">{m.codigoLote || `Lote #${m.idLote}`}</strong>
                        {m.especieLote && (
                          <div className="text-[11px] text-emerald-700">{m.especieLote}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-semibold text-[11px]">
                          {m.nombreCausa}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                          -{m.cantidadPerdida} u.
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-600">
                        {m.nombreUsuario || 'Usuario'}
                      </td>
                      <td className="py-3 px-3 text-gray-500 max-w-xs truncate" title={m.observaciones}>
                        {m.observaciones || '—'}
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
  )
}
