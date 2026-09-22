import { useState, useEffect } from 'react'
import {
  getZonasAdmin,
  crearZona,
  actualizarZona,
  activarZona,
  desactivarZona
} from '../api/adminApi'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'

const CONDICIONES_OPTIONS = [
  { value: 'INTERIOR', label: 'Interior' },
  { value: 'EXTERIOR', label: 'Exterior' },
  { value: 'INVERNADERO', label: 'Invernadero' },
  { value: 'SOMBRA_PARCIAL', label: 'Sombra Parcial' },
  { value: 'TUNEL', label: 'Túnel de Cultivo' },
]

const EXPOSICION_OPTIONS = [
  { value: 'PLENO_SOL', label: 'Pleno Sol' },
  { value: 'SOMBRA_TOTAL', label: 'Sombra Total' },
  { value: 'MEDIA_SOMBRA', label: 'Media Sombra' },
]

export default function AdminZonas() {
  const [zonas, setZonas] = useState([])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(null)
  const [mensaje, setMensaje] = useState(null)

  // Vista: 'tabla' o 'ocupacion' (HU22)
  const [vista, setVista] = useState('tabla')

  // Filtros
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState('')
  const [filtroCondicion, setFiltroCondicion] = useState('')

  // Modal Crear / Editar
  const [modalAbierto, setModalAbierto] = useState(false)
  const [zonaEdit, setZonaEdit] = useState(null)

  const cargarZonas = async () => {
    setLoading(true)
    try {
      const res = await getZonasAdmin()
      setZonas(res.data || [])
    } catch (err) {
      mostrarMensaje('error', err.response?.data?.mensaje || 'Error al cargar las zonas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarZonas()
  }, [])

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 5000)
  }

  // HU21b: Desactivar zona (no se puede si tiene lotes activos)
  const handleToggleActivo = async (zona) => {
    if (zona.activo && zona.lotesActivos > 0) {
      mostrarMensaje('error', `No se puede desactivar "${zona.nombre}" porque tiene ${zona.lotesActivos} lotes activos asignados. Reubica o finaliza los lotes primero.`)
      return
    }

    setGuardando(zona.idZona)
    try {
      if (zona.activo) {
        await desactivarZona(zona.idZona)
        mostrarMensaje('ok', `Zona "${zona.nombre}" desactivada. Su historial de lotes permanece intacto.`)
      } else {
        await activarZona(zona.idZona)
        mostrarMensaje('ok', `Zona "${zona.nombre}" activada exitosamente`)
      }
      await cargarZonas()
    } catch (err) {
      mostrarMensaje('error', err.response?.data?.mensaje || 'Error al cambiar estado de la zona')
    } finally {
      setGuardando(null)
    }
  }

  const handleGuardar = async (datos) => {
    setGuardando('modal')
    try {
      if (zonaEdit) {
        await actualizarZona(zonaEdit.idZona, datos)
        mostrarMensaje('ok', 'Zona actualizada correctamente')
      } else {
        await crearZona(datos)
        mostrarMensaje('ok', 'Zona registrada exitosamente')
      }
      setModalAbierto(false)
      setZonaEdit(null)
      await cargarZonas()
    } catch (err) {
      const msg = err.response?.data?.mensaje || 'Error al guardar la zona'
      mostrarMensaje('error', msg)
    } finally {
      setGuardando(null)
    }
  }

  const abrirCrear = () => {
    setZonaEdit(null)
    setModalAbierto(true)
  }

  const abrirEditar = (zona) => {
    setZonaEdit(zona)
    setModalAbierto(true)
  }

  // Zonas con alerta de >90% de capacidad (HU22)
  const zonasCriticas90 = zonas.filter(z => z.activo && (z.porcentajeOcupacion >= 90 || z.alertaSupera90))

  // Filtrado reactivo
  const zonasFiltradas = zonas.filter(z => {
    const coincideNombre = z.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideActivo =
      filtroActivo === '' ? true :
      filtroActivo === 'true' ? z.activo === true : z.activo === false
    const coincideCondicion = !filtroCondicion || z.tipoCondicion === filtroCondicion
    return coincideNombre && coincideActivo && coincideCondicion
  })

  // Estadísticas globales (HU22)
  const capacidadTotal = zonas.filter(z => z.activo).reduce((acc, z) => acc + (z.capacidadMaxima || 0), 0)
  const lotesActivosTotal = zonas.filter(z => z.activo).reduce((acc, z) => acc + (z.lotesActivos || 0), 0)
  const plantasTotal = zonas.filter(z => z.activo).reduce((acc, z) => acc + (z.totalPlantas || 0), 0)
  const ocupacionPromedio = capacidadTotal > 0 ? Math.round((lotesActivosTotal / capacidadTotal) * 100) : 0

  return (
    <div className="p-6 space-y-5">
      {/* Cabecera HU21/HU21b/HU22 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            📍 Zonas e Invernaderos
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Control de infraestructura, condiciones de cultivo y planificación de siembras (HU21, HU21b, HU22)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Vista (HU22) */}
          <div className="flex bg-gray-200 dark:bg-gray-700 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setVista('tabla')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                vista === 'tabla'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              📋 Gestión
            </button>
            <button
              onClick={() => setVista('ocupacion')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                vista === 'ocupacion'
                  ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              📊 Ocupación
              {zonasCriticas90.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
              )}
            </button>
          </div>

          <Button onClick={abrirCrear}>+ Nueva Zona</Button>
        </div>
      </div>

      {/* HU22: Alerta visual prominente si alguna zona supera el 90% de capacidad */}
      {zonasCriticas90.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950/50 border-2 border-red-500 dark:border-red-600 rounded-2xl p-4 shadow-sm flex items-start gap-3 text-sm animate-pulse">
          <span className="text-2xl">🚨</span>
          <div className="flex-1">
            <h4 className="font-bold text-red-900 dark:text-red-200">
              ¡Alerta de Sobrepoblación! {zonasCriticas90.length} zona(s) superan el 90% de su capacidad máxima
            </h4>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Las siguientes zonas están en riesgo de saturación para nuevas siembras:{' '}
              {zonasCriticas90.map(z => (
                <strong key={z.idZona} className="inline-block bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded text-[11px] mr-1 mb-1">
                  {z.nombre} ({z.porcentajeOcupacion}% - {z.lotesActivos}/{z.capacidadMaxima} lotes)
                </strong>
              ))}
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas KPI de Resumen (HU22) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Zonas Activas</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {zonas.filter(z => z.activo).length} <span className="text-xs text-gray-400 font-normal">/ {zonas.length} totales</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Espacios disponibles</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Capacidad Total</p>
          <p className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
            {capacidadTotal} <span className="text-xs text-gray-400 font-normal">lotes max</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Infraestructura viva</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Lotes y Plantas Activas</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {lotesActivosTotal} <span className="text-xs text-gray-400 font-normal">lotes ({plantasTotal} plantas)</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">En producción activa</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ocupación Global</p>
          <p className={`text-2xl font-bold mt-1 ${ocupacionPromedio >= 90 ? 'text-red-600 dark:text-red-400' : ocupacionPromedio >= 70 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {ocupacionPromedio}%
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            {zonasCriticas90.length > 0 ? `🚨 ${zonasCriticas90.length} en alerta crítica` : 'Nivel de uso seguro'}
          </p>
        </div>
      </div>

      {/* Alerta / Notificación */}
      {mensaje && (
        <div
          className={`p-3.5 rounded-xl text-sm font-medium border flex items-center gap-2 ${
            mensaje.tipo === 'ok'
              ? 'bg-green-50 dark:bg-green-950/40 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800'
          }`}
        >
          <span>{mensaje.tipo === 'ok' ? '✅' : '⚠️'}</span>
          <span>{mensaje.texto}</span>
        </div>
      )}

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex gap-3 flex-wrap shadow-sm">
        <input
          type="text"
          placeholder="🔍 Buscar zona por nombre..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-[200px]"
        />

        <select
          value={filtroActivo}
          onChange={(e) => setFiltroActivo(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 min-w-[150px]"
        >
          <option value="">Todos los estados</option>
          <option value="true">Solo Activas</option>
          <option value="false">Solo Inactivas</option>
        </select>

        <select
          value={filtroCondicion}
          onChange={(e) => setFiltroCondicion(e.target.value)}
          className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 min-w-[160px]"
        >
          <option value="">Todas las condiciones</option>
          {CONDICIONES_OPTIONS.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* VISTA 1: TABLA DE GESTIÓN (HU21 / HU21b) */}
      {vista === 'tabla' && (
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
            </div>
          ) : zonasFiltradas.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <p className="text-3xl mb-2">📍</p>
              <p>No se encontraron zonas que coincidan con los filtros.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700 text-xs">
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Zona</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Condición</th>
                    <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Exposición Solar</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Capacidad Máx.</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Ocupación (Lotes/Plantas)</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Estado</th>
                    <th className="text-center px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {zonasFiltradas.map(zona => {
                    const porcentaje = zona.porcentajeOcupacion || 0
                    const alerta90 = porcentaje >= 90 || zona.alertaSupera90

                    return (
                      <tr
                        key={zona.idZona}
                        className={`transition-colors ${
                          alerta90 && zona.activo
                            ? 'bg-red-50/60 dark:bg-red-950/20 hover:bg-red-100/60 dark:hover:bg-red-950/40'
                            : 'hover:bg-gray-50/70 dark:hover:bg-gray-700/40'
                        }`}
                      >
                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-100">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{alerta90 && zona.activo ? '🚨' : '🌱'}</span>
                            <div>
                              <p className="font-semibold flex items-center gap-1.5">
                                {zona.nombre}
                                {alerta90 && zona.activo && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-600 text-white uppercase tracking-wider">
                                    &gt;90% Llena
                                  </span>
                                )}
                              </p>
                              <p className="text-[11px] text-gray-400">ID #{zona.idZona}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                            {zona.tipoCondicion}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-medium">
                            {zona.exposicionSolar}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-200">
                          {zona.capacidadMaxima} lotes
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex flex-col items-center w-36">
                            <div className="flex justify-between w-full text-[11px] text-gray-500 dark:text-gray-400 mb-0.5">
                              <span>{zona.lotesActivos || 0}/{zona.capacidadMaxima} lotes</span>
                              <span className={`font-bold ${alerta90 && zona.activo ? 'text-red-600 dark:text-red-400' : ''}`}>
                                {porcentaje}%
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  alerta90 ? 'bg-red-500' : porcentaje >= 60 ? 'bg-amber-500' : 'bg-green-600'
                                }`}
                                style={{ width: `${Math.min(100, porcentaje)}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                              {zona.totalPlantas || 0} plantas vivas
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                              zona.activo
                                ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            {zona.activo ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex gap-2 justify-center">
                            <button
                              onClick={() => abrirEditar(zona)}
                              className="text-xs px-2.5 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40 rounded hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors font-medium"
                            >
                              ✏ Editar
                            </button>

                            <button
                              onClick={() => handleToggleActivo(zona)}
                              disabled={guardando === zona.idZona}
                              title={
                                zona.activo && zona.lotesActivos > 0
                                  ? `No se puede desactivar con ${zona.lotesActivos} lotes activos`
                                  : ''
                              }
                              className={`text-xs px-2.5 py-1 rounded border transition-colors font-medium disabled:opacity-50 ${
                                zona.activo
                                  ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border-red-200 dark:border-red-800/40 hover:bg-red-100 dark:hover:bg-red-900/60'
                                  : 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800/40 hover:bg-green-100 dark:hover:bg-green-900/60'
                              }`}
                            >
                              {guardando === zona.idZona
                                ? '...'
                                : zona.activo
                                ? '⊘ Desactivar'
                                : '✓ Activar'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* VISTA 2: GRID DE OCUPACIÓN ANALÍTICA (HU22) */}
      {vista === 'ocupacion' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {zonasFiltradas.map(zona => {
            const porcentaje = zona.porcentajeOcupacion || 0
            const alerta90 = porcentaje >= 90 || zona.alertaSupera90
            const libre = Math.max(0, zona.capacidadMaxima - (zona.lotesActivos || 0))

            return (
              <div
                key={zona.idZona}
                className={`bg-white dark:bg-gray-800 rounded-2xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  alerta90 && zona.activo
                    ? 'border-2 border-red-500 dark:border-red-600 ring-2 ring-red-500/20'
                    : 'border-gray-100 dark:border-gray-700 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base flex items-center gap-1.5">
                        {zona.nombre}
                      </h3>
                      <p className="text-[11px] text-gray-400">
                        {zona.tipoCondicion} • {zona.exposicionSolar}
                      </p>
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        alerta90 && zona.activo
                          ? 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700 animate-pulse'
                          : porcentaje >= 60
                          ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                          : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                      }`}
                    >
                      {alerta90 && zona.activo ? '🚨 ' : ''}{porcentaje}% ocupado
                    </span>
                  </div>

                  {/* HU22: Alerta destacada visual */}
                  {alerta90 && zona.activo && (
                    <div className="mb-3 p-2 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-800 text-[11px] text-red-700 dark:text-red-300 font-semibold flex items-center gap-1.5">
                      <span>⚠️</span> Supera el 90% de capacidad. No planificar nuevas siembras aquí.
                    </div>
                  )}

                  {/* Detalle Lotes y Plantas (HU22) */}
                  <div className="grid grid-cols-2 gap-2 mb-4 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl text-xs">
                    <div>
                      <span className="text-gray-400 dark:text-gray-400 block text-[10px]">Lotes en cultivo</span>
                      <strong className="text-gray-800 dark:text-gray-100 text-sm">
                        {zona.lotesActivos || 0} / {zona.capacidadMaxima}
                      </strong>
                    </div>
                    <div>
                      <span className="text-gray-400 dark:text-gray-400 block text-[10px]">Plantas vivas</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 text-sm">
                        {zona.totalPlantas || 0} plantas
                      </strong>
                    </div>
                  </div>

                  {/* Barra de progreso */}
                  <div className="space-y-1 mb-2">
                    <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          alerta90 ? 'bg-red-500' : porcentaje >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, porcentaje)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400">
                      <span>{libre} espacio(s) de lote libre(s)</span>
                      <span>{alerta90 ? '🚨 Saturada' : 'Disponible'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-2">
                  <button
                    onClick={() => abrirEditar(zona)}
                    className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium text-gray-700 dark:text-gray-200 transition-colors"
                  >
                    ✏ Editar Capacidad
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Crear / Editar Zona (HU21 y HU21b) */}
      {modalAbierto && (
        <ZonaModal
          zona={zonaEdit}
          guardando={guardando === 'modal'}
          onGuardar={handleGuardar}
          onCerrar={() => { setModalAbierto(false); setZonaEdit(null) }}
        />
      )}
    </div>
  )
}

function ZonaModal({ zona, guardando, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre: zona?.nombre ?? '',
    capacidadMaxima: zona?.capacidadMaxima ?? '',
    tipoCondicion: zona?.tipoCondicion ?? 'INTERIOR',
    exposicionSolar: zona?.exposicionSolar ?? 'PLENO_SOL',
    confirmarReduccionCapacidad: false,
  })
  const [errores, setErrores] = useState({})

  const lotesActuales = zona?.lotesActivos || 0
  const reduciendoPorDebajoDeOcupacion =
    zona &&
    form.capacidadMaxima !== '' &&
    Number(form.capacidadMaxima) < lotesActuales

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validar = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre de la zona es obligatorio'
    if (!form.capacidadMaxima || Number(form.capacidadMaxima) < 1) {
      errs.capacidadMaxima = 'La capacidad máxima debe ser al menos 1 lote'
    }
    if (!form.tipoCondicion) errs.tipoCondicion = 'Selecciona el tipo de condición (interior/exterior)'
    if (!form.exposicionSolar) errs.exposicionSolar = 'Selecciona la exposición solar (sol/sombra)'

    // HU21b: Reducir capacidad por debajo de ocupación requiere confirmación
    if (reduciendoPorDebajoDeOcupacion && !form.confirmarReduccionCapacidad) {
      errs.confirmacion = 'Debes marcar la casilla de confirmación para reducir la capacidad por debajo de la ocupación actual.'
    }

    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validar()) return
    onGuardar({
      nombre: form.nombre.trim(),
      capacidadMaxima: Number(form.capacidadMaxima),
      tipoCondicion: form.tipoCondicion,
      exposicionSolar: form.exposicionSolar,
      confirmarReduccionCapacidad: form.confirmarReduccionCapacidad,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {zona ? '✏ Editar Zona (HU21b)' : '+ Registrar Zona / Invernadero (HU21)'}
          </h2>
          <button
            onClick={onCerrar}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nombre de la zona *"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Invernadero 1, Zona Exterior Norte"
            error={errores.nombre}
            required
          />

          <Input
            label="Capacidad máxima (en número de lotes) *"
            name="capacidadMaxima"
            type="number"
            min="1"
            value={form.capacidadMaxima}
            onChange={handleChange}
            placeholder="Ej: 20"
            error={errores.capacidadMaxima}
            required
          />

          {/* HU21b: Advertencia visual si reduce la capacidad por debajo de la ocupación actual */}
          {reduciendoPorDebajoDeOcupacion && (
            <div className="bg-amber-50 dark:bg-amber-950/50 border-2 border-amber-400 dark:border-amber-600 rounded-xl p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-start gap-2 font-bold text-amber-800 dark:text-amber-100">
                <span className="text-base">⚠️</span>
                <span>Advertencia de Capacidad (HU21b):</span>
              </div>
              <p>
                Estás reduciendo la capacidad máxima a <strong>{form.capacidadMaxima} lotes</strong>, pero actualmente hay <strong>{lotesActuales} lotes activos</strong> asignados a esta zona.
              </p>
              <label className="flex items-start gap-2 pt-1 cursor-pointer select-none font-semibold text-amber-950 dark:text-amber-100">
                <input
                  type="checkbox"
                  name="confirmarReduccionCapacidad"
                  checked={form.confirmarReduccionCapacidad}
                  onChange={handleChange}
                  className="mt-0.5 h-4 w-4 rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                />
                <span>Confirmo explícitamente que deseo reducir la capacidad por debajo de la ocupación actual.</span>
              </label>
              {errores.confirmacion && (
                <p className="text-red-600 dark:text-red-400 font-medium">⚠️ {errores.confirmacion}</p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo de Condición (Interior/Exterior) <span className="text-red-500">*</span>
            </label>
            <select
              name="tipoCondicion"
              value={form.tipoCondicion}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              {CONDICIONES_OPTIONS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {errores.tipoCondicion && (
              <p className="text-xs text-red-600 dark:text-red-400">⚠️ {errores.tipoCondicion}</p>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Exposición Solar (Sol/Sombra) <span className="text-red-500">*</span>
            </label>
            <select
              name="exposicionSolar"
              value={form.exposicionSolar}
              onChange={handleChange}
              className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            >
              {EXPOSICION_OPTIONS.map(e => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </select>
            {errores.exposicionSolar && (
              <p className="text-xs text-red-600 dark:text-red-400">⚠️ {errores.exposicionSolar}</p>
            )}
          </div>

          <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={onCerrar}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardando}>
              {zona ? 'Guardar Cambios' : 'Registrar Zona'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
