import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Truck, Activity, X, Loader2, Info, FileText } from 'lucide-react'
import { 
  getProveedoresAdmin, crearProveedor, actualizarProveedor, 
  activarProveedor, desactivarProveedor, getReporteProveedor 
} from '../api/adminApi'

// Reusing Input from standard design
function Input({ label, name, type = 'text', value, onChange, placeholder, error, min }) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        min={min}
        className={`w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-medium focus:ring-2 outline-none transition-colors
          ${error 
            ? 'border-red-300 focus:border-red-400 focus:ring-red-200 dark:border-red-500/50' 
            : 'border-slate-200 dark:border-slate-700 focus:border-teal-400 focus:ring-teal-100 dark:focus:ring-teal-900/30'}`}
      />
      {error && <p className="text-red-500 text-xs font-bold mt-1">{error}</p>}
    </div>
  )
}

const TIPO_INSUMO_OPCIONES = [
  { value: 'SEMILLAS', label: 'Semillas' },
  { value: 'SUSTRATOS', label: 'Sustratos' },
  { value: 'MACETAS', label: 'Macetas' },
  { value: 'PLANTAS', label: 'Plantas' },
  { value: 'OTROS', label: 'Otros' }
]

export default function AdminProveedores() {
  const [proveedores, setProveedores] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtros, setFiltros] = useState({ nombre: '', tipoInsumo: '', activo: '' })
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [proveedorEdit, setProveedorEdit] = useState(null)
  const [guardando, setGuardando] = useState(false)
  
  const [modalReporte, setModalReporte] = useState({ abierto: false, proveedor: null, datos: null, cargando: false })

  const fetchProveedores = async () => {
    try {
      setCargando(true)
      const res = await getProveedoresAdmin({ ...filtros, size: 100 })
      setProveedores(res.data || [])
    } catch (error) {
      console.error(error)
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    fetchProveedores()
  }, [filtros])

  const handleGuardar = async (datos) => {
    try {
      setGuardando(true)
      if (proveedorEdit) {
        await actualizarProveedor(proveedorEdit.idProveedor, datos)
      } else {
        await crearProveedor(datos)
      }
      setModalAbierto(false)
      setProveedorEdit(null)
      fetchProveedores()
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar el proveedor')
    } finally {
      setGuardando(false)
    }
  }

  const handleToggleActivo = async (id, activo) => {
    try {
      if (activo) {
        await desactivarProveedor(id)
      } else {
        await activarProveedor(id)
      }
      fetchProveedores()
    } catch (error) {
      alert('Error al cambiar el estado')
    }
  }

  const handleVerReporte = async (prov) => {
    setModalReporte({ abierto: true, proveedor: prov, datos: null, cargando: true })
    try {
      const res = await getReporteProveedor()
      const reporteProv = res.data.find(r => r.idProveedor === prov.idProveedor) || {
        totalLotes: 0, lotesEnCultivo: 0, lotesDescartados: 0, porcentajePerdida: 0, plantasIniciales: 0, plantasActuales: 0
      }
      setModalReporte(prev => ({ ...prev, datos: reporteProv, cargando: false }))
    } catch (error) {
      console.error(error)
      setModalReporte(prev => ({ ...prev, cargando: false }))
      alert('Error al cargar reporte')
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-slate-800/20">
        <div>
          <h1 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Truck className="text-teal-500" />
            Proveedores
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Gestión de proveedores y productos del vivero
          </p>
        </div>
        <button
          onClick={() => { setProveedorEdit(null); setModalAbierto(true) }}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-teal-600 hover:bg-slate-800 dark:hover:bg-teal-500 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-slate-900/10 dark:shadow-teal-900/20"
        >
          <Plus size={18} />
          Nuevo Proveedor
        </button>
      </div>

      <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filtros.nombre}
              onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>
          <select
            value={filtros.tipoInsumo}
            onChange={(e) => setFiltros({ ...filtros, tipoInsumo: e.target.value })}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">Todos los tipos de producto</option>
            {TIPO_INSUMO_OPCIONES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <select
            value={filtros.activo}
            onChange={(e) => setFiltros({ ...filtros, activo: e.target.value })}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 custom-scrollbar">
        {cargando ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="animate-spin text-teal-500" size={32} />
          </div>
        ) : proveedores.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Truck size={48} className="mb-4 opacity-20" />
            <p className="font-medium">No se encontraron proveedores</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
            {proveedores.map(prov => (
              <div key={prov.idProveedor} className="flex flex-col bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 hover:border-teal-300 dark:hover:border-teal-700 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
                      {prov.nombre}
                      {!prov.activo && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                          INACTIVO
                        </span>
                      )}
                    </h3>
                    <p className="text-sm font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mt-1 text-[11px]">
                      {prov.tipoInsumo}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { setProveedorEdit(prov); setModalAbierto(true) }} className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors" title="Editar">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleToggleActivo(prov.idProveedor, prov.activo)} className={`p-2 rounded-lg transition-colors ${prov.activo ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`} title={prov.activo ? 'Desactivar' : 'Activar'}>
                      <Activity size={18} />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 mb-1">Teléfono</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{prov.contacto || 'N/A'}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 mb-1">Teléfono</p>
                    <p className="font-medium text-slate-700 dark:text-slate-300">{prov.telefono || 'N/A'}</p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-700">
                  <button 
                    onClick={() => handleVerReporte(prov)}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-xl transition-colors"
                  >
                    <FileText size={16} />
                    Ver Trazabilidad
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalAbierto && (
        <ProveedorModal
          proveedor={proveedorEdit}
          guardando={guardando}
          onGuardar={handleGuardar}
          onCerrar={() => { setModalAbierto(false); setProveedorEdit(null) }}
        />
      )}

      {modalReporte.abierto && (
        <ReporteModal
          modal={modalReporte}
          onCerrar={() => setModalReporte({ abierto: false, proveedor: null, datos: null, cargando: false })}
        />
      )}
    </div>
  )
}

function ProveedorModal({ proveedor, guardando, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombre: proveedor?.nombre ?? '',
    contacto: proveedor?.contacto ?? '',
      telefono: proveedor?.telefono ?? '',
    correo: proveedor?.correo ?? '',
    tipoInsumo: proveedor?.tipoInsumo ?? 'SEMILLAS'
  })
  const [errores, setErrores] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const validar = () => {
    const errs = {}
    if (!form.nombre.trim()) errs.nombre = 'Obligatorio'
    if (!form.tipoInsumo) errs.tipoInsumo = 'Obligatorio'
    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validar()) return
    onGuardar({
      nombre: form.nombre.trim(),
      contacto: form.contacto.trim(),
      telefono: form.telefono.trim(),
      correo: form.correo.trim(),
      tipoInsumo: form.tipoInsumo
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Truck className="text-teal-500" size={20}/>
            {proveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input label="Nombre *" name="nombre" value={form.nombre} onChange={handleChange} error={errores.nombre} />
          <div className="space-y-1">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Producto *</label>
            <select name="tipoInsumo" value={form.tipoInsumo} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none">
              {TIPO_INSUMO_OPCIONES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <Input label="Contacto" name="contacto" value={form.contacto} onChange={handleChange} />
          <Input label="Teléfono" name="telefono" value={form.telefono} onChange={handleChange} />
          <Input label="Correo" name="correo" type="email" value={form.correo} onChange={handleChange} />

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onCerrar} disabled={guardando} className="px-5 py-2.5 rounded-xl text-sm font-bold bg-slate-100 text-slate-600">Cancelar</button>
            <button type="submit" disabled={guardando} className="px-6 py-2.5 rounded-xl text-sm font-bold bg-teal-600 text-white flex items-center gap-2">
              {guardando ? <Loader2 size={16} className="animate-spin" /> : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ReporteModal({ modal, onCerrar }) {
  const { proveedor, datos, cargando } = modal
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="text-teal-500" size={20}/>
            Trazabilidad: {proveedor?.nombre}
          </h2>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">
          {cargando ? (
             <div className="flex justify-center p-8"><Loader2 className="animate-spin text-teal-500" size={32}/></div>
          ) : datos ? (
             <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                   <p className="text-sm font-bold text-blue-800 dark:text-blue-300">Total Lotes</p>
                   <p className="text-2xl font-black text-blue-900 dark:text-blue-100">{datos.totalLotes}</p>
                 </div>
                 <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
                   <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">Lotes Activos</p>
                   <p className="text-2xl font-black text-emerald-900 dark:text-emerald-100">{datos.lotesEnCultivo}</p>
                 </div>
                 <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-800">
                   <p className="text-sm font-bold text-red-800 dark:text-red-300">Lotes Descartados</p>
                   <p className="text-2xl font-black text-red-900 dark:text-red-100">{datos.lotesDescartados}</p>
                 </div>
                 <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800">
                   <p className="text-sm font-bold text-amber-800 dark:text-amber-300">Porcentaje de Pérdida</p>
                   <p className="text-2xl font-black text-amber-900 dark:text-amber-100">{datos.porcentajePerdida?.toFixed(2)}%</p>
                 </div>
               </div>
               <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                 <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Resumen de Productos (Semillas vs Plantas)</p>
                 <div className="flex justify-between items-center text-sm mb-1">
                   <span className="text-slate-500">Total Plantadas:</span>
                   <span className="font-bold">{datos.plantasIniciales}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm mb-1">
                   <span className="text-slate-500">Total Plantas Vivas:</span>
                   <span className="font-bold">{datos.plantasActuales}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-500">Total Mermas:</span>
                   <span className="font-bold">{(datos.plantasIniciales || 0) - (datos.plantasActuales || 0)}</span>
                 </div>
               </div>
             </div>
          ) : (
             <p className="text-slate-500 text-center">No hay datos</p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
          <button onClick={onCerrar} className="px-5 py-2 rounded-xl text-sm font-bold bg-slate-200 text-slate-700 hover:bg-slate-300">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}









