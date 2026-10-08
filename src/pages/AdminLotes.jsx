import { useState, useEffect } from 'react'
import { getLotes, getZonas } from '../api/trabajadorApi'
import { getProductosAdmin, crearLote, vincularLote, getProveedoresAdmin } from '../api/adminApi'
import { 
  Sprout, Search, ArrowUp, ArrowDown, Plus, MapPin, Calendar, 
  Box, Link as LinkIcon, CheckCircle, AlertTriangle, X, Loader2, Truck 
} from 'lucide-react'
import Input from '../components/ui/Input'

const ESTADOS_CONFIG = {
  GERMINANDO:       { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-transparent border-amber-300 dark:border-amber-700/50' },
  CRECIENDO:        { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-transparent border-blue-300 dark:border-blue-700/50' },
  LISTO_PARA_VENTA: { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-transparent border-emerald-300 dark:border-emerald-700/50' },
  EN_TIENDA:        { color: 'text-purple-600 dark:text-purple-400', bg: 'bg-transparent border-purple-300 dark:border-purple-700/50' },
  DESCARTADO:       { color: 'text-red-600 dark:text-red-400', bg: 'bg-transparent border-red-300 dark:border-red-700/50' }
}

export default function AdminLotes() {
  const [lotes, setLotes] = useState([])
  const [zonas, setZonas] = useState([])
  const [productos, setProductos] = useState([])
  const [proveedores, setProveedores] = useState([])
  
  const [filtroZona, setFiltroZona] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBuscar, setFiltroBuscar] = useState('')
  const [ordenCampo, setOrdenCampo] = useState('fechaSiembra')
  const [ordenDir, setOrdenDir] = useState('desc')
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(true)

  const [modalRegistro, setModalRegistro] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [nuevoLote, setNuevoLote] = useState({
    especie: '',
    cantidadInicial: '',
    fechaSiembra: new Date().toISOString().split('T')[0],
    idZona: '',
    codigoLote: '',
    estadoLote: 'GERMINANDO',
    idProveedor: ''
  })

  const [modalVinculacion, setModalVinculacion] = useState({
    abierto: false,
    lote: null,
    idProducto: ''
  })

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [resLotes, resZonas, resProds, resProv] = await Promise.all([
        getLotes({ 
          idZona: filtroZona || undefined, 
          estado: filtroEstado || undefined, 
          buscar: filtroBuscar || undefined,
          sort: ordenCampo,
          dir: ordenDir,
          page: pagina, 
          size: 10 
        }),
        getZonas(),
        getProductosAdmin({ size: 100 }),
        getProveedoresAdmin({ activo: 'true', size: 100 })
      ])
      setLotes(resLotes.data.content || [])
      setTotalPaginas(resLotes.data.totalPages || 1)
      setZonas(resZonas.data)
      setProductos(resProds.data.content || [])
      setProveedores(resProv.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [filtroZona, filtroEstado, filtroBuscar, ordenCampo, ordenDir, pagina])

  const handleCrearLote = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await crearLote({
        ...nuevoLote,
        cantidadInicial: Number(nuevoLote.cantidadInicial),
        idZona: Number(nuevoLote.idZona),
        idProveedor: nuevoLote.idProveedor ? Number(nuevoLote.idProveedor) : null
      })
      setModalRegistro(false)
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al crear lote')
    } finally {
      setGuardando(false)
    }
  }

  const handleVincular = async (e) => {
    e.preventDefault()
    
    const prodSeleccionado = productos.find(p => p.idProducto === Number(modalVinculacion.idProducto))
    if (prodSeleccionado) {
      const especieLote = modalVinculacion.lote.especie.trim().toLowerCase()
      const nombreProd = prodSeleccionado.nombreProducto.trim().toLowerCase()
      
      if (especieLote !== nombreProd) {
        const confirmado = window.confirm(`⚠️ Advertencia\n\nLa especie del lote ("${modalVinculacion.lote.especie}") no coincide exactamente con el nombre del producto seleccionado ("${prodSeleccionado.nombreProducto}").\n\n¿Estás seguro de vincular este lote a dicho producto?`)
        if (!confirmado) return
      }
    }

    setGuardando(true)
    try {
      await vincularLote(modalVinculacion.lote.idLote, { idProducto: Number(modalVinculacion.idProducto) })
      setModalVinculacion({ abierto: false, lote: null, idProducto: '' })
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.mensaje || 'Error al vincular lote')
    } finally {
      setGuardando(false)
    }
  }

  const badgeEstado = (estado) => {
    const config = ESTADOS_CONFIG[estado] || { color: 'text-slate-600', bg: 'bg-slate-100 border-slate-200' }
    const label = estado === 'LISTO_PARA_VENTA' ? 'LISTO PARA VENTA' : estado
    return (
      <span className={`inline-flex items-center text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${config.bg} ${config.color}`}>
        {label}
      </span>
    )
  }

  return (
    <div className="flex h-full animate-fade-in">
      <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto overflow-auto custom-scrollbar">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 text-white">
              <Sprout size={28} strokeWidth={2} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
                Administración de Lotes
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">
                Gestiona la producción y vinculación al catálogo
              </p>
            </div>
          </div>
          <button 
            onClick={() => setModalRegistro(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-2.5 px-5 rounded-xl shadow-md shadow-teal-500/20 transition-all duration-200"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Nuevo Lote</span>
          </button>
        </div>

        {/* FILTERS */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-2xl p-4 md:p-5 mb-8 flex flex-col lg:flex-row gap-4 shadow-sm items-center">
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
            <option value="">Todos los estados</option>
            <option value="GERMINANDO">GERMINANDO</option>
            <option value="CRECIENDO">CRECIENDO</option>
            <option value="LISTO_PARA_VENTA">LISTO PARA VENTA</option>
            <option value="EN_TIENDA">EN TIENDA</option>
            <option value="DESCARTADO">DESCARTADO</option>
          </select>

          <div className="flex items-center gap-2 lg:pl-4 lg:border-l border-slate-200 dark:border-slate-700 w-full lg:w-auto">
            <select
              value={ordenCampo}
              onChange={(e) => { setOrdenCampo(e.target.value); setPagina(0) }}
              className="flex-1 lg:w-44 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              <option value="fechaSiembra">Fecha de Siembra</option>
              <option value="fechaCreacion">Fecha de Registro</option>
              <option value="nombre">Especie</option>
              <option value="codigo">Código Lote</option>
            </select>
            <button
              onClick={() => setOrdenDir(d => d === 'asc' ? 'desc' : 'asc')}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 transition-colors"
              title="Cambiar dirección"
            >
              {ordenDir === 'asc' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/70 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200/60 dark:border-slate-700/50 rounded-3xl shadow-sm overflow-hidden">
          {cargando ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="text-slate-500 dark:text-slate-400 font-medium">Cargando lotes...</p>
            </div>
          ) : lotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400">
              <Sprout size={48} className="mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1} />
              <p className="font-medium">No se encontraron lotes</p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200 dark:bg-slate-700/80 border-b-2 border-slate-300 dark:border-slate-600">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Código / Especie</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Zona</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Proveedor</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Fechas (Siembra / Reg)</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Stock</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Estado</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Vinculación</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {lotes.map(l => (
                    <tr key={l.idLote} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/80 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 dark:text-slate-100 font-mono tracking-tight">{l.codigoLote || 'N/A'}</p>
                        <p className="text-xs font-bold text-teal-600 dark:text-teal-400 mt-1">{l.especie}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                          <MapPin size={14} className="text-slate-400" />
                          {l.nombreZona}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {l.nombreProveedor ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300" title="Proveedor asignado">
                            <Truck size={14} className="text-indigo-400" />
                            {l.nombreProveedor}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 italic">
                            <Truck size={14} className="text-slate-300 dark:text-slate-600" />
                            Propio
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300" title="Fecha de Siembra">
                          <Sprout size={14} className="text-emerald-500" /> 
                          {l.fechaSiembra ? new Date(l.fechaSiembra).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400" title="Fecha de Registro">
                          <Calendar size={14} /> 
                          {l.fechaCreacion ? new Date(l.fechaCreacion).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          {l.cantidadActual} <span className="text-xs text-slate-400 font-medium">/ {l.cantidadInicial}</span>
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {badgeEstado(l.estadoLote)}
                      </td>
                      <td className="px-6 py-4">
                        {l.esVinculado ? (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400">
                            <CheckCircle size={14} /> 
                            Vinculado a: <span className="underline underline-offset-2 decoration-teal-200">{l.nombreProducto}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                            <Box size={14} /> No vinculado
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {['LISTO_PARA_VENTA', 'LISTO PARA VENTA'].includes(l.estadoLote?.trim()?.toUpperCase()) && !l.esVinculado && (
                          <button 
                            onClick={() => setModalVinculacion({ abierto: true, lote: l, idProducto: '' })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 hover:border-teal-300 dark:bg-teal-900/30 dark:border-teal-800/50 dark:text-teal-400 transition-colors text-xs font-bold"
                          >
                            <LinkIcon size={14} /> Vincular
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* PAGINACIÓN */}
              {!cargando && totalPaginas > 1 && (
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

      {/* MODAL CREAR LOTE */}
      {modalRegistro && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Sprout size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Registrar Nuevo Lote</h2>
              </div>
              <button onClick={() => setModalRegistro(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCrearLote} className="p-6 space-y-5">
              <Input
                label="Código del Lote *"
                name="codigoLote"
                required
                placeholder="Ej: LOTE-FIC-001"
                value={nuevoLote.codigoLote}
                onChange={e => setNuevoLote({...nuevoLote, codigoLote: e.target.value})}
              />
              
              <Input
                label="Especie / Variedad *"
                name="especie"
                required
                placeholder="Ej: Ficus Lyrata"
                value={nuevoLote.especie}
                onChange={e => setNuevoLote({...nuevoLote, especie: e.target.value})}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Cantidad Inicial *"
                  name="cantidadInicial"
                  type="number"
                  min="1"
                  required
                  placeholder="Ej: 50"
                  value={nuevoLote.cantidadInicial}
                  onChange={e => setNuevoLote({...nuevoLote, cantidadInicial: e.target.value})}
                />
                <Input
                  label="Fecha de Siembra *"
                  name="fechaSiembra"
                  type="date"
                  required
                  value={nuevoLote.fechaSiembra}
                  onChange={e => setNuevoLote({...nuevoLote, fechaSiembra: e.target.value})}
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Zona Asignada *</label>
                <select required value={nuevoLote.idZona} onChange={e => setNuevoLote({...nuevoLote, idZona: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-shadow">
                  <option value="" disabled>Seleccione Zona...</option>
                  {zonas.map(z => <option key={z.idZona} value={z.idZona}>{z.nombre}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Proveedor</label>
                <select value={nuevoLote.idProveedor} onChange={e => setNuevoLote({...nuevoLote, idProveedor: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-shadow">
                  <option value="">Ninguno (Propio / Desconocido)</option>
                  {proveedores.map(p => <option key={p.idProveedor} value={p.idProveedor}>{p.nombre} ({p.tipoInsumo})</option>)}
                </select>
              </div>
              
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Estado Inicial *</label>
                <select required value={nuevoLote.estadoLote} onChange={e => setNuevoLote({...nuevoLote, estadoLote: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-shadow">
                  <option value="GERMINANDO">GERMINANDO</option>
                  <option value="CRECIENDO">CRECIENDO</option>
                  <option value="LISTO_PARA_VENTA">LISTO PARA VENTA</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setModalRegistro(false)} disabled={guardando} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">Cancelar</button>
                <button type="submit" disabled={guardando} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50">
                  {guardando ? <Loader2 size={16} className="animate-spin" /> : <Sprout size={16} />}
                  {guardando ? 'Registrando...' : 'Registrar Lote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VINCULACIÓN */}
      {modalVinculacion.abierto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <LinkIcon size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">Vincular al Catálogo</h2>
              </div>
              <button onClick={() => setModalVinculacion({ abierto: false, lote: null, idProducto: '' })} className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full p-2 transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-5 bg-teal-50 dark:bg-teal-900/20 p-4 rounded-xl border border-teal-100 dark:border-teal-800/50">
                <span className="font-black text-[10px] uppercase tracking-widest text-teal-600 dark:text-teal-400 block mb-1">Lote a vincular</span>
                <p className="font-bold text-slate-800 dark:text-slate-100">
                  {modalVinculacion.lote.codigoLote} - {modalVinculacion.lote.especie}
                </p>
                <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 bg-white/60 dark:bg-slate-800/50 py-1 px-2.5 rounded-lg border border-teal-200/50 w-fit">
                  <Sprout size={14} /> Stock listo: {modalVinculacion.lote.cantidadActual} u.
                </div>
              </div>
              
              <form onSubmit={handleVincular} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Producto del Catálogo *</label>
                  <select required value={modalVinculacion.idProducto} onChange={e => setModalVinculacion({...modalVinculacion, idProducto: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-shadow">
                    <option value="" disabled>Seleccione Producto...</option>
                    {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombreProducto}</option>)}
                  </select>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-2">
                    El stock actual de este lote ({modalVinculacion.lote.cantidadActual} unidades) se sumará al producto seleccionado. El lote pasará automáticamente a estado <strong className="text-purple-600 dark:text-purple-400">EN TIENDA</strong>.
                  </p>
                </div>
                
                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button type="button" onClick={() => setModalVinculacion({ abierto: false, lote: null, idProducto: '' })} disabled={guardando} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">Cancelar</button>
                  <button type="submit" disabled={guardando} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md shadow-teal-500/20 disabled:opacity-50">
                    {guardando ? <Loader2 size={16} className="animate-spin" /> : <LinkIcon size={16} />}
                    {guardando ? 'Vinculando...' : 'Confirmar Vinculación'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
