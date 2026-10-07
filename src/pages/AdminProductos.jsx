import { useEffect, useState } from 'react'
import {
  getProductosAdmin,
  crearProducto,
  actualizarProducto,
  activarProducto,
  desactivarProducto,
  getProductosStockCritico
} from '../api/adminApi'
import { getCategorias, getTipos } from '../api/productosApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'
import FlashMessage from '../components/ui/FlashMessage'
import Pagination from '../components/ui/Pagination'
import { Package, Search, Plus, Edit2, AlertTriangle, Power, PowerOff, X, Leaf, Sprout, Filter } from 'lucide-react'

export default function AdminProductos() {
  const [productos,  setProductos]  = useState([])
  const [categorias, setCategorias] = useState([])
  const [tipos,      setTipos]      = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [loading,    setLoading]    = useState(true)

  const [totalStockCritico, setTotalStockCritico] = useState(0)

  const [filtros, setFiltros] = useState({
    nombre: '', idCategoria: '', idTipo: '', page: 0, size: 15
  })

  const [modalAbierto, setModalAbierto] = useState(false)
  const [productoEdit, setProductoEdit] = useState(null)
  const [guardando,    setGuardando]    = useState(null)
  const [mensaje,      setMensaje]      = useState(null)

  useEffect(() => {
    Promise.all([getCategorias(), getTipos()])
      .then(([cats, tips]) => {
        setCategorias(cats.data)
        setTipos(tips.data)
      })
      .catch(console.error)
  }, [])

  useEffect(() => { cargarProductos() }, [filtros])

  useEffect(() => { cargarStockCritico() }, [])

  const cargarProductos = () => {
    setLoading(true)
    getProductosAdmin(filtros)
      .then(r => {
        setProductos(r.data.content ?? [])
        setTotalPages(r.data.totalPages ?? 0)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  const cargarStockCritico = () => {
    getProductosStockCritico()
      .then(r => setTotalStockCritico(r.data.length))
      .catch(() => setTotalStockCritico(0))
  }

  const handleFiltro = (campo, valor) =>
    setFiltros(prev => ({ ...prev, [campo]: valor, ...(campo !== 'page' && { page: 0 }) }))

  const handleToggleActivo = async (producto) => {
    setGuardando(producto.idProducto)
    try {
      if (producto.activo ?? true) {
        await desactivarProducto(producto.idProducto)
      } else {
        await activarProducto(producto.idProducto)
      }
      await cargarProductos()
      mostrarMensaje('ok', `Producto ${producto.activo ? 'desactivado' : 'activado'}`)
    } catch (e) {
      mostrarMensaje('error', e.response?.data?.mensaje || 'Error al cambiar estado')
    } finally {
      setGuardando(null)
    }
  }

  const handleGuardar = async (datos) => {
    setGuardando('modal')
    try {
      if (productoEdit) {
        await actualizarProducto(productoEdit.idProducto, datos)
        mostrarMensaje('ok', 'Producto actualizado correctamente')
      } else {
        await crearProducto(datos)
        mostrarMensaje('ok', 'Producto creado correctamente')
      }
      setModalAbierto(false)
      setProductoEdit(null)
      await cargarProductos()
      await cargarStockCritico()
    } catch (e) {
      mostrarMensaje('error', e.response?.data?.mensaje || 'Error al guardar')
    } finally {
      setGuardando(null)
    }
  }

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3500)
  }

  const abrirCrear = () => {
    setProductoEdit(null)
    setModalAbierto(true)
  }

  const abrirEditar = (producto) => {
    setProductoEdit(producto)
    setModalAbierto(true)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-fade-in">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 text-white">
            <Package size={28} strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              Inventario
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Gestión completa de productos del catálogo
            </p>
          </div>
        </div>
        <button 
          onClick={abrirCrear}
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all"
        >
          <Plus size={20} strokeWidth={2.5} />
          Nuevo Producto
        </button>
      </div>

      {totalStockCritico > 0 && (
        <div className="mb-6 bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 shadow-sm">
          <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 p-2 rounded-xl">
            <AlertTriangle size={24} />
          </div>
          <div>
            <h3 className="text-orange-800 dark:text-orange-300 font-bold text-lg leading-tight">Alerta de Stock Crítico</h3>
            <p className="text-orange-700 dark:text-orange-400 text-sm font-medium">
              Hay <strong>{totalStockCritico}</strong> producto(s) por debajo de su umbral de seguridad.
            </p>
          </div>
        </div>
      )}

      <FlashMessage mensaje={mensaje} />

      {/* FILTROS */}
      <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 rounded-2xl p-4 mb-6 shadow-lg shadow-slate-200/40 dark:shadow-black/20 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={filtros.nombre}
            onChange={e => handleFiltro('nombre', e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700 dark:text-slate-200"
          />
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-44">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filtros.idCategoria}
              onChange={e => handleFiltro('idCategoria', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700 dark:text-slate-200 appearance-none"
            >
              <option value="">Categorías (Todas)</option>
              {categorias.map(c => (
                <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 md:w-44">
            <Sprout className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filtros.idTipo}
              onChange={e => handleFiltro('idTipo', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700 dark:text-slate-200 appearance-none"
            >
              <option value="">Tipos (Todos)</option>
              {tipos.map(t => (
                <option key={t.idTipo} value={t.idTipo}>{t.nombreTipo}</option>
              ))}
            </select>
          </div>
          <div className="relative flex-1 md:w-44">
            <Power className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={filtros.activo}
              onChange={e => handleFiltro('activo', e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all font-medium text-slate-700 dark:text-slate-200 appearance-none"
            >
              <option value="">Estado (Todos)</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLA */}
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl border border-white/80 dark:border-slate-700/50 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-black/40 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-teal-600">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-teal-500 mb-4" />
            <p className="font-semibold text-slate-500">Cargando inventario...</p>
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-24 text-slate-500 dark:text-slate-400 flex flex-col items-center">
            <Package size={48} className="mb-4 opacity-20" />
            <p className="text-xl font-semibold">No se encontraron productos</p>
            <p className="text-sm mt-1">Intenta ajustando los filtros de búsqueda</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="bg-slate-200 dark:bg-slate-700/80 border-b-2 border-slate-300 dark:border-slate-600">
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Producto</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">Categoría</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-right">Precio</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Stock</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Estado</th>
                  <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {productos.map(p => (
                  <tr key={p.idProducto}
                      className={`transition-colors duration-200
                                  ${p.stockCritico ? 'bg-orange-50/50 dark:bg-orange-900/20 hover:bg-orange-100/50' : 'hover:bg-slate-50/80 dark:hover:bg-slate-700/30'}`}>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {p.imagenUrl ? (
                          <img src={p.imagenUrl} alt={p.nombreProducto} className="w-10 h-10 rounded-lg object-cover shadow-sm border border-slate-200" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                            <Leaf size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 max-w-[200px] truncate">
                            {p.nombreProducto}
                          </p>
                          <p className="text-xs font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 inline-block px-2 py-0.5 rounded-md mt-1">
                            {p.tipo}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">
                      {p.categoria || '—'}
                    </td>

                    <td className="px-6 py-4 text-right font-bold text-slate-700 dark:text-slate-200">
                      ${Number(p.precio).toLocaleString('es-CO')}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <span className={`font-bold text-lg inline-flex items-center gap-1.5
                                        ${p.stock === 0
                                          ? 'text-red-500 dark:text-red-400'
                                          : p.stockCritico
                                            ? 'text-orange-500 dark:text-orange-400'
                                            : 'text-slate-700 dark:text-slate-200'}`}>
                          {p.stockCritico && p.stock > 0 && <AlertTriangle size={16} className="text-orange-500" />}
                          {p.stock}
                        </span>
                        {p.stockMinimoAlerta != null && (
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            Mín. {p.stockMinimoAlerta}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border shadow-sm
                                        ${p.activo
                                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50'
                                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                        {p.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => abrirEditar(p)}
                          title="Editar"
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 rounded-xl transition-colors border border-blue-100"
                        >
                          <Edit2 size={16} strokeWidth={2.5} />
                        </button>

                        <button
                          onClick={() => handleToggleActivo(p)}
                          disabled={guardando === p.idProducto}
                          title={p.activo ? "Desactivar" : "Activar"}
                          className={`p-2 rounded-xl transition-colors border disabled:opacity-50
                                      ${p.activo
                                        ? 'text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 border-red-100'
                                        : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700 border-emerald-100'}`}
                        >
                          {guardando === p.idProducto ? (
                            <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                          ) : p.activo ? <PowerOff size={16} strokeWidth={2.5} /> : <Power size={16} strokeWidth={2.5} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={filtros.page}
            totalPages={totalPages}
            onPageChange={page => handleFiltro('page', page)}
          />
        </div>
      )}

      {modalAbierto && (
        <ProductoModal
          producto={productoEdit}
          categorias={categorias}
          tipos={tipos}
          guardando={guardando === 'modal'}
          onGuardar={handleGuardar}
          onCerrar={() => { setModalAbierto(false); setProductoEdit(null) }}
        />
      )}
    </div>
  )
}

function ProductoModal({ producto, categorias, tipos, guardando, onGuardar, onCerrar }) {
  const [form, setForm] = useState({
    nombreProducto:  producto?.nombreProducto  ?? '',
    descripcion:     producto?.descripcion     ?? '',
    precio:          producto?.precio          ?? '',
    stock:           producto?.stock           ?? '',
    stockMinimoAlerta: producto?.stockMinimoAlerta ?? 5,
    imagenUrl:       producto?.imagenUrl       ?? '',
    idCategoria: producto?.idCategoria != null
               ? String(producto.idCategoria)
               : '',
    idTipo:          producto?.idTipo          ?? '',
    cuidados:        producto?.cuidados        ?? '',
    luz:             producto?.luz             ?? '',
    riego:           producto?.riego           ?? '',
    tamanioEstimado: producto?.tamanioEstimado ?? '',
  })
  const [errores, setErrores] = useState({})

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const validar = () => {
    const errs = {}
    if (!form.nombreProducto.trim()) errs.nombreProducto = 'El nombre es obligatorio'
    if (!form.precio || Number(form.precio) <= 0) errs.precio = 'El precio debe ser mayor a 0'
    if (form.stock === '' || Number(form.stock) < 0) errs.stock = 'El stock no puede ser negativo'
    if (form.stockMinimoAlerta === '' || Number(form.stockMinimoAlerta) < 0)
      errs.stockMinimoAlerta = 'El umbral no puede ser negativo'
    if (!form.idCategoria) errs.idCategoria = 'Selecciona una categoría'
    if (!form.idTipo) errs.idTipo = 'Selecciona un tipo'
    setErrores(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = () => {
    if (!validar()) return
    onGuardar({
      ...form,
      precio: Number(form.precio),
      stock:  Number(form.stock),
      stockMinimoAlerta: Number(form.stockMinimoAlerta),
      idCategoria: Number(form.idCategoria),
      idTipo: Number(form.idTipo),
    })
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/50 dark:border-slate-700 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">

        <div className="bg-white/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 px-8 py-5 flex justify-between items-center z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-400 p-2 rounded-xl">
              {producto ? <Edit2 size={20} /> : <Plus size={20} />}
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {producto ? 'Editar Producto' : 'Nuevo Producto'}
            </h2>
          </div>
          <button onClick={onCerrar} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <Input
                label="Nombre del producto"
                name="nombreProducto"
                value={form.nombreProducto}
                onChange={handleChange}
                placeholder="Ej: Pothos Dorado"
                error={errores.nombreProducto}
                required
              />
            </div>
            <Input
              label="Precio (COP)"
              name="precio"
              type="number"
              min="0.01"
              step="100"
              value={form.precio}
              onChange={handleChange}
              placeholder="25000"
              error={errores.precio}
              required
            />
            <Input
              label="Stock (unidades)"
              name="stock"
              type="number"
              min="0"
              value={form.stock}
              onChange={handleChange}
              placeholder="50"
              error={errores.stock}
              required
            />
          </div>

          <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-4">
            <Input
              label="Umbral de stock crítico (unidades)"
              name="stockMinimoAlerta"
              type="number"
              min="0"
              value={form.stockMinimoAlerta}
              onChange={handleChange}
              placeholder="5"
              error={errores.stockMinimoAlerta}
            />
            <p className="text-xs font-medium text-orange-600/70 dark:text-orange-400/70 mt-2 flex items-center gap-1.5">
              <AlertTriangle size={14} />
              Cuando el stock caiga a este número o menos, alertaremos en el inventario.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                name="idCategoria"
                value={form.idCategoria}
                onChange={handleChange}
                className={`border ${errores.idCategoria ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/80 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 font-medium transition-all appearance-none`}
              >
                <option value="">Seleccionar...</option>
                {categorias.map(c => (
                  <option key={c.idCategoria} value={c.idCategoria}>
                    {c.nombreCategoria}
                  </option>
                ))}
              </select>
              {errores.idCategoria && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1"><X size={12}/> {errores.idCategoria}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                name="idTipo"
                value={form.idTipo}
                onChange={handleChange}
                className={`border ${errores.idTipo ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white/80 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 font-medium transition-all appearance-none`}
              >
                <option value="">Seleccionar...</option>
                {tipos.map(t => (
                  <option key={t.idTipo} value={t.idTipo}>{t.nombreTipo}</option>
                ))}
              </select>
              {errores.idTipo && (
                <p className="text-xs font-bold text-red-500 flex items-center gap-1"><X size={12}/> {errores.idTipo}</p>
              )}
            </div>
          </div>

          <Input
            label="URL de imagen (opcional)"
            name="imagenUrl"
            type="url"
            value={form.imagenUrl}
            onChange={handleChange}
            placeholder="https://ejemplo.com/imagen.jpg"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descripción</label>
            <textarea
              name="descripcion"
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción del producto..."
              className="border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white/80 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium transition-all"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 pb-2">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Leaf size={14} /> Datos de Cuidado
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input label="Luz" name="luz" value={form.luz}
                   onChange={handleChange} placeholder="Ej: Indirecta" />
            <Input label="Riego" name="riego" value={form.riego}
                   onChange={handleChange} placeholder="Ej: Cada 3 días" />
            <Input label="Tamaño" name="tamanioEstimado"
                   value={form.tamanioEstimado} onChange={handleChange}
                   placeholder="Ej: 30-50 cm" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Instrucciones de Cuidado</label>
            <textarea
              name="cuidados"
              rows={2}
              value={form.cuidados}
              onChange={handleChange}
              placeholder="Tips y cuidados específicos..."
              className="border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-white/80 dark:bg-slate-700/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium transition-all"
            />
          </div>
        </div>

        <div className="bg-slate-50/80 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700 px-8 py-5 flex gap-3 justify-end z-10 backdrop-blur-md">
          <button 
            onClick={onCerrar}
            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={guardando}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none"
          >
            {guardando ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : producto ? 'Guardar Cambios' : 'Crear Producto'}
          </button>
        </div>
      </div>
    </div>
  )
}