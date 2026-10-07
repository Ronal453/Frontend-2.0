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
import FlashMessage from '../components/ui/FlashMessage'
import { 
  Map, ThermometerSun, AlertTriangle, LayoutGrid, List, CheckCircle, 
  XCircle, Cloud, Sun, Edit, Play, Square, Loader2, X 
} from 'lucide-react'

const CONDICIONES_OPTIONS = [
  { value: 'INTERIOR', label: 'Interior', icon: <ThermometerSun size={14} /> },
  { value: 'EXTERIOR', label: 'Exterior', icon: <Sun size={14} /> },
  { value: 'INVERNADERO', label: 'Invernadero', icon: <Map size={14} /> },
  { value: 'SOMBRA_PARCIAL', label: 'Sombra Parcial', icon: <Cloud size={14} /> },
  { value: 'TUNEL', label: 'Túnel de Cultivo', icon: <Map size={14} /> },
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

  const [vista, setVista] = useState('tabla')
  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState('')
  const [filtroCondicion, setFiltroCondicion] = useState('')

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

  const zonasCriticas90 = zonas.filter(z => z.activo && (z.porcentajeOcupacion >= 90 || z.alertaSupera90))
  
  const zonasFiltradas = zonas.filter(z => {
    const coincideNombre = z.nombre.toLowerCase().includes(busqueda.toLowerCase())
    const coincideActivo =
      filtroActivo === '' ? true :
      filtroActivo === 'true' ? z.activo === true : z.activo === false
    const coincideCondicion = !filtroCondicion || z.tipoCondicion === filtroCondicion
    return coincideNombre && coincideActivo && coincideCondicion
  })

  const capacidadTotal = zonas.filter(z => z.activo).reduce((acc, z) => acc + (z.capacidadMaxima || 0), 0)
  const lotesActivosTotal = zonas.filter(z => z.activo).reduce((acc, z) => acc + (z.lotesActivos || 0), 0)
  const plantasTotal = zonas.filter(z => z.activo).reduce((acc, z) => acc + (z.totalPlantas || 0), 0)
  const ocupacionPromedio = capacidadTotal > 0 ? Math.round((lotesActivosTotal / capacidadTotal) * 100) : 0

  return (
    <div className="flex h-full animate-fade-in">
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto overflow-auto custom-scrollbar">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 text-white">
              <Map size={28} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                Gestión de Zonas
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                Control de infraestructura, condiciones y ocupación.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* View Toggle */}
            <div className="flex p-1 bg-slate-200/50 dark:bg-slate-800 rounded-xl">
              <button
                onClick={() => setVista('tabla')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 ${
                  vista === 'tabla'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <List size={16} /> Lista
              </button>
              <button
                onClick={() => setVista('ocupacion')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 relative ${
                  vista === 'ocupacion'
                    ? 'bg-white dark:bg-slate-700 text-teal-600 dark:text-teal-400 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <LayoutGrid size={16} /> Ocupación
                {zonasCriticas90.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                )}
              </button>
            </div>

            <button 
              onClick={abrirCrear}
              className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md shadow-teal-500/20 transition-all duration-200"
            >
              <Map size={18} />
              <span>Nueva Zona</span>
            </button>
          </div>
        </div>

        <FlashMessage mensaje={mensaje} />

        {/* CRITICAL ALERT OVER 90% */}
        {zonasCriticas90.length > 0 && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-2 border-red-200 dark:border-red-800/50 rounded-2xl p-5 shadow-sm animate-pulse">
            <div className="flex items-start gap-4">
              <div className="mt-1 text-red-500">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-red-800 dark:text-red-300 text-lg">
                  ¡Alerta de Sobrepoblación! {zonasCriticas90.length} zona(s) superan el 90% de su capacidad
                </h4>
                <p className="text-sm font-medium text-red-700/80 dark:text-red-400 mt-1">
                  Las siguientes zonas están en riesgo de saturación y no admiten nuevas siembras óptimas:
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {zonasCriticas90.map(z => (
                    <span key={z.idZona} className="inline-flex items-center gap-1.5 bg-white/60 dark:bg-slate-900/50 border border-red-200 dark:border-red-800/50 px-3 py-1 rounded-lg text-xs font-bold text-red-700 dark:text-red-400 shadow-sm">
                      <Map size={12} /> {z.nombre} ({z.porcentajeOcupacion}%)
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Zonas Activas</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">
              {zonas.filter(z => z.activo).length} <span className="text-sm text-slate-400 font-medium">/ {zonas.length} totales</span>
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Capacidad Total</p>
            <p className="text-3xl font-bold text-slate-800 dark:text-slate-100 mt-2">
              {capacidadTotal} <span className="text-sm text-slate-400 font-medium">lotes max</span>
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Lotes / Plantas</p>
            <p className="text-3xl font-bold text-teal-600 dark:text-teal-400 mt-2">
              {lotesActivosTotal} <span className="text-sm text-slate-400 font-medium">({plantasTotal} pl)</span>
            </p>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-slate-700/50 shadow-sm">
            <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ocupación Global</p>
            <p className={`text-3xl font-bold mt-2 ${ocupacionPromedio >= 90 ? 'text-red-600 dark:text-red-400' : ocupacionPromedio >= 70 ? 'text-amber-500 dark:text-amber-400' : 'text-emerald-500 dark:text-emerald-400'}`}>
              {ocupacionPromedio}%
            </p>
          </div>
        </div>

        {/* FILTERS */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 md:p-5 mb-8 flex flex-col md:flex-row gap-4 shadow-sm items-center">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              placeholder="Buscar zona..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-shadow text-slate-700 dark:text-slate-200"
            />
          </div>
          <select
            value={filtroActivo}
            onChange={e => setFiltroActivo(e.target.value)}
            className="w-full md:w-48 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
          >
            <option value="">Todas las zonas</option>
            <option value="true">Solo Activas</option>
            <option value="false">Solo Inactivas</option>
          </select>
          <select
            value={filtroCondicion}
            onChange={e => setFiltroCondicion(e.target.value)}
            className="w-full md:w-56 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none transition-shadow"
          >
            <option value="">Todas las condiciones</option>
            {CONDICIONES_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* LIST VIEW */}
        {vista === 'tabla' && (
          <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-3xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-10 h-10 animate-spin text-teal-500" />
              </div>
            ) : zonasFiltradas.length === 0 ? (
              <div className="text-center py-24 text-slate-500">No se encontraron zonas.</div>
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-slate-200 dark:bg-slate-700/80 border-b-2 border-slate-300 dark:border-slate-600">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Zona</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Condición</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Capacidad</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 w-48">Ocupación</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Estado</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {zonasFiltradas.map(zona => {
                      const pct = zona.porcentajeOcupacion || 0
                      const isAlert = pct >= 90 || zona.alertaSupera90
                      return (
                        <tr key={zona.idZona} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isAlert && zona.activo ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400'}`}>
                                {isAlert && zona.activo ? <AlertTriangle size={18} /> : <Map size={18} />}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 dark:text-slate-100">{zona.nombre}</p>
                                <p className="text-xs font-medium text-slate-500 mt-0.5">ID: {zona.idZona}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-700 dark:text-slate-300">{zona.tipoCondicion}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{zona.exposicionSolar}</p>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700 dark:text-slate-300">
                            {zona.capacidadMaxima} lotes
                          </td>
                          <td className="px-6 py-4">
                            <div className="w-full">
                              <div className="flex justify-between text-xs font-bold mb-1">
                                <span className="text-slate-600 dark:text-slate-400">{zona.lotesActivos}/{zona.capacidadMaxima}</span>
                                <span className={isAlert && zona.activo ? 'text-red-500' : 'text-slate-600 dark:text-slate-400'}>{pct}%</span>
                              </div>
                              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${isAlert && zona.activo ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-xl border
                              ${zona.activo 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' 
                                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              }`}
                            >
                              {zona.activo ? <CheckCircle size={14} /> : <XCircle size={14} />}
                              {zona.activo ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              <button onClick={() => abrirEditar(zona)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 transition-colors text-xs font-bold">
                                <Edit size={14} /> Editar
                              </button>
                              <button onClick={() => handleToggleActivo(zona)} disabled={guardando === zona.idZona}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-colors text-xs font-bold disabled:opacity-50
                                ${zona.activo ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400' : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100 dark:bg-teal-900/30 dark:text-teal-400'}`}>
                                {guardando === zona.idZona ? <Loader2 size={14} className="animate-spin" /> : (zona.activo ? <XCircle size={14} /> : <CheckCircle size={14} />)}
                                {zona.activo ? 'Desactivar' : 'Activar'}
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

        {/* GRID VIEW */}
        {vista === 'ocupacion' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {zonasFiltradas.map(zona => {
              const pct = zona.porcentajeOcupacion || 0
              const isAlert = pct >= 90 || zona.alertaSupera90
              const libre = Math.max(0, zona.capacidadMaxima - (zona.lotesActivos || 0))

              return (
                <div key={zona.idZona} className={`bg-white/70 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 transition-all border
                  ${isAlert && zona.activo ? 'border-red-300 shadow-red-500/20 shadow-lg ring-1 ring-red-500/30 dark:border-red-800' : 'border-slate-200/60 dark:border-slate-700/50 shadow-sm hover:shadow-md'}`}>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isAlert && zona.activo ? 'bg-red-100 text-red-600' : 'bg-teal-100 text-teal-600 dark:bg-teal-900/50 dark:text-teal-400'}`}>
                        {isAlert && zona.activo ? <AlertTriangle size={24} /> : <Map size={24} />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{zona.nombre}</h3>
                        <p className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          {zona.tipoCondicion} • {zona.exposicionSolar}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isAlert && zona.activo && (
                    <div className="mb-5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs font-bold p-3 rounded-xl flex gap-2">
                      <AlertTriangle size={16} className="shrink-0" />
                      <span>Capacidad crítica alcanzada. Evite planificar nuevas siembras aquí.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Lotes Activos</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{zona.lotesActivos} <span className="text-sm text-slate-400">/ {zona.capacidadMaxima}</span></p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Plantas Vivas</p>
                      <p className="text-xl font-bold text-teal-600 dark:text-teal-400">{zona.totalPlantas || 0}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                      <span>Ocupación</span>
                      <span className={isAlert && zona.activo ? 'text-red-500' : ''}>{pct}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${isAlert && zona.activo ? 'bg-red-500' : pct >= 70 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, pct)}%` }} />
                    </div>
                    <p className="text-xs font-medium text-slate-500 text-right mt-2">{libre} espacio(s) libres</p>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => abrirEditar(zona)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      Editar Capacidad
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
      
      {/* MODAL CREAR/EDITAR */}
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
  const reduciendoPorDebajoDeOcupacion = zona && form.capacidadMaxima !== '' && Number(form.capacidadMaxima) < lotesActuales

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const validar = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'El nombre de la zona es obligatorio'
    if (!form.capacidadMaxima || Number(form.capacidadMaxima) < 1) errs.capacidadMaxima = 'La capacidad máxima debe ser al menos 1 lote'
    if (!form.tipoCondicion) errs.tipoCondicion = 'Selecciona el tipo de condición'
    if (!form.exposicionSolar) errs.exposicionSolar = 'Selecciona la exposición solar'

    if (reduciendoPorDebajoDeOcupacion && !form.confirmarReduccionCapacidad) {
      errs.confirmacion = 'Debes confirmar la reducción por debajo de la ocupación.'
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              {zona ? <Edit size={20} /> : <Map size={20} />}
            </div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
              {zona ? 'Editar Zona' : 'Nueva Zona'}
            </h2>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <Input
            label="Nombre de la zona *"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            placeholder="Ej: Invernadero 1"
            error={errores.nombre}
          />

          <Input
            label="Capacidad máxima (lotes) *"
            name="capacidadMaxima"
            type="number"
            min="1"
            value={form.capacidadMaxima}
            onChange={handleChange}
            placeholder="Ej: 20"
            error={errores.capacidadMaxima}
          />

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Condición Climática</label>
            <select name="tipoCondicion" value={form.tipoCondicion} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none">
              <option value="">Selecciona...</option>
              {CONDICIONES_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Exposición Solar</label>
            <select name="exposicionSolar" value={form.exposicionSolar} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none">
              <option value="">Selecciona...</option>
              {EXPOSICION_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>

          {reduciendoPorDebajoDeOcupacion && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                <AlertTriangle size={18} />
                <span>Advertencia de Capacidad</span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                Estás reduciendo la capacidad máxima a <strong>{form.capacidadMaxima}</strong> lotes, pero actualmente hay <strong>{lotesActuales}</strong> lotes activos en esta zona.
              </p>
              <label className="flex items-start gap-2 pt-2 cursor-pointer font-bold text-sm text-amber-900 dark:text-amber-200">
                <input type="checkbox" name="confirmarReduccionCapacidad" checked={form.confirmarReduccionCapacidad} onChange={handleChange} className="mt-1" />
                <span>Confirmo reducir la capacidad por debajo del uso actual.</span>
              </label>
              {errores.confirmacion && <p className="text-red-500 text-xs font-bold">{errores.confirmacion}</p>}
            </div>
          )}

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={onCerrar} disabled={guardando} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={guardando} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50">
              {guardando ? <Loader2 size={16} className="animate-spin" /> : <Map size={16} />}
              {guardando ? 'Guardando...' : 'Guardar Zona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
