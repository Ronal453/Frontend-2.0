import { useEffect, useState } from 'react'
import {
  getProductosAdmin, crearProducto,
  actualizarProducto, activarProducto, desactivarProducto,
  getProductosStockCritico
} from '../api/adminApi'
import { getCategorias, getTipos } from '../api/productosApi'
import Button from '../components/ui/Button'
import Input  from '../components/ui/Input'

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
    <div className="p-6">

      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🌿 Inventario</h1>
          <p className="text-gray-500 text-sm">
            Gestión completa de productos (activos + inactivos)
          </p>
        </div>
        <Button onClick={abrirCrear}>+ Nuevo producto</Button>
      </div>

      {totalStockCritico > 0 && (
        <div className="mb-5 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-3 text-sm">
          <span className="text-xl">⚠️</span>
          <p className="text-orange-800">
            <strong>{totalStockCritico}</strong> producto(s) en{' '}
            <strong>stock crítico</strong> (por debajo del umbral configurado).
            Están resaltados en naranja en la tabla.
          </p>
        </div>
      )}

      {mensaje && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-medium
                         ${mensaje.tipo === 'ok'
                           ? 'bg-green-50 text-green-700 border border-green-200'
                           : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {mensaje.tipo === 'ok' ? '✅' : '⚠'} {mensaje.texto}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl p-4 mb-5 flex gap-3 flex-wrap shadow-sm">
        <input
          type="text"
          placeholder="🔍 Buscar por nombre..."
          value={filtros.nombre}
          onChange={e => handleFiltro('nombre', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 flex-1 min-w-48"
        />
        <select
          value={filtros.idCategoria}
          onChange={e => handleFiltro('idCategoria', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-44"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.idCategoria} value={c.idCategoria}>{c.nombreCategoria}</option>
          ))}
        </select>
        <select
          value={filtros.idTipo}
          onChange={e => handleFiltro('idTipo', e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white min-w-36"
        >
          <option value="">Todos los tipos</option>
          {tipos.map(t => (
            <option key={t.idTipo} value={t.idTipo}>{t.nombreTipo}</option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <p className="text-3xl mb-2">🌱</p>
            <p>No se encontraron productos</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Producto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Categoría</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Precio</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Stock</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.idProducto}
                    className={`border-b border-gray-50 transition-colors
                                ${p.stockCritico ? 'bg-orange-50/60' : 'hover:bg-gray-50'}`}>

                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-800 max-w-xs truncate">
                      {p.nombreProducto}
                    </p>
                    <p className="text-xs text-gray-400">{p.tipo}</p>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {p.categoria || '—'}
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-green-700">
                    ${Number(p.precio).toLocaleString('es-CO')}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`font-semibold inline-flex items-center gap-1
                                     ${p.stock === 0
                                       ? 'text-red-500'
                                       : p.stockCritico
                                         ? 'text-orange-600'
                                         : 'text-gray-700'}`}>
                      {p.stockCritico && p.stock > 0 && <span title="Stock crítico">⚠️</span>}
                      {p.stock}
                    </span>
                    {p.stockMinimoAlerta != null && (
                      <p className="text-[10px] text-gray-400">
                        mín. {p.stockMinimoAlerta}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full
                                      ${p.activo
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => abrirEditar(p)}
                        className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors font-medium"
                      >
                        ✏ Editar
                      </button>

                      <button
                        onClick={() => handleToggleActivo(p)}
                        disabled={guardando === p.idProducto}
                        className={`text-xs px-2 py-1 rounded transition-colors font-medium disabled:opacity-50
                                    ${p.activo
                                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                      : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                      >
                        {guardando === p.idProducto
                          ? '...'
                          : p.activo ? '⊘ Desactivar' : '✓ Activar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => handleFiltro('page', filtros.page - 1)}
            disabled={filtros.page === 0}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="px-3 py-1.5 text-sm text-gray-600">
            Página {filtros.page + 1} de {totalPages}
          </span>
          <button
            onClick={() => handleFiltro('page', filtros.page + 1)}
            disabled={filtros.page >= totalPages - 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40"
          >
            Siguiente →
          </button>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
          <h2 className="text-lg font-bold text-gray-800">
            {producto ? '✏ Editar producto' : '+ Nuevo producto'}
          </h2>
          <button onClick={onCerrar} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>

        <div className="p-6 space-y-4">

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
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
          <p className="text-xs text-gray-400 -mt-2">
            Cuando el stock caiga a este número o menos, el producto se
            marcará como "stock crítico" en el inventario.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Categoría <span className="text-red-500">*</span>
              </label>
              <select
                name="idCategoria"
                value={form.idCategoria}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Seleccionar...</option>
                {categorias.map(c => (
                  <option key={c.idCategoria} value={c.idCategoria}>
                    {c.nombreCategoria}
                  </option>
                ))}
              </select>
              {errores.idCategoria && (
                <p className="text-xs text-red-600">⚠ {errores.idCategoria}</p>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                name="idTipo"
                value={form.idTipo}
                onChange={handleChange}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
              >
                <option value="">Seleccionar...</option>
                {tipos.map(t => (
                  <option key={t.idTipo} value={t.idTipo}>{t.nombreTipo}</option>
                ))}
              </select>
              {errores.idTipo && (
                <p className="text-xs text-red-600">⚠ {errores.idTipo}</p>
              )}
            </div>
          </div>

          <Input
            label="URL de imagen (opcional)"
            name="imagenUrl"
            type="url"
            value={form.imagenUrl}
            onChange={handleChange}
            placeholder="https://..."
          />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Descripción</label>
            <textarea
              name="descripcion"
              rows={3}
              value={form.descripcion}
              onChange={handleChange}
              placeholder="Descripción del producto..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 whitespace-nowrap">
              Datos de cuidado (opcionales)
            </span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Luz" name="luz" value={form.luz}
                   onChange={handleChange} placeholder="Ej: Indirecta" />
            <Input label="Riego" name="riego" value={form.riego}
                   onChange={handleChange} placeholder="Ej: Cada 3 días" />
            <Input label="Tamaño estimado" name="tamanioEstimado"
                   value={form.tamanioEstimado} onChange={handleChange}
                   placeholder="Ej: 30-50 cm" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Cuidados</label>
            <textarea
              name="cuidados"
              rows={2}
              value={form.cuidados}
              onChange={handleChange}
              placeholder="Instrucciones de cuidado..."
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
          <Button variant="secondary" onClick={onCerrar}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={guardando}>
            {producto ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </div>
      </div>
    </div>
  )
}