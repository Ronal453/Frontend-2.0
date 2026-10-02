import { useState, useEffect } from 'react'
import { getLotes, getZonas } from '../api/trabajadorApi'
import { getProductosAdmin, crearLote, vincularLote } from '../api/adminApi'

export default function AdminLotes() {
  const [lotes, setLotes] = useState([])
  const [zonas, setZonas] = useState([])
  const [productos, setProductos] = useState([])
  const [filtroZona, setFiltroZona] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
  const [filtroBuscar, setFiltroBuscar] = useState('')
  const [ordenCampo, setOrdenCampo] = useState('fechaSiembra')
  const [ordenDir, setOrdenDir] = useState('desc')
  const [pagina, setPagina] = useState(0)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [cargando, setCargando] = useState(true)

  const [modalRegistro, setModalRegistro] = useState(false)
  const [nuevoLote, setNuevoLote] = useState({
    especie: '',
    cantidadInicial: '',
    fechaSiembra: new Date().toISOString().split('T')[0],
    idZona: '',
    codigoLote: '',
    estadoLote: 'GERMINANDO'
  })

  const [modalVinculacion, setModalVinculacion] = useState({
    abierto: false,
    lote: null,
    idProducto: ''
  })

  const cargarDatos = async () => {
    setCargando(true)
    try {
      const [resLotes, resZonas, resProds] = await Promise.all([
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
        getProductosAdmin({ size: 100 })
      ])
      setLotes(resLotes.data.content || [])
      setTotalPaginas(resLotes.data.totalPages || 1)
      setZonas(resZonas.data)
      setProductos(resProds.data.content || [])
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
    try {
      await crearLote({
        ...nuevoLote,
        cantidadInicial: Number(nuevoLote.cantidadInicial),
        idZona: Number(nuevoLote.idZona)
      })
      setModalRegistro(false)
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.mensaje || 'Error al crear lote')
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

    try {
      await vincularLote(modalVinculacion.lote.idLote, { idProducto: Number(modalVinculacion.idProducto) })
      setModalVinculacion({ abierto: false, lote: null, idProducto: '' })
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.message || err.response?.data?.mensaje || 'Error al vincular lote')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Administración de Lotes</h1>
          <p className="text-gray-500 text-sm">Gestiona la producción y vinculación al catálogo</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalRegistro(true)} className="px-4 py-2 bg-emerald-600 text-white rounded-xl">
            + Nuevo Lote
          </button>
        </div>
      </div>

      {/* Barra de Filtros y Ordenamiento */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <input
          type="text"
          placeholder="Buscar lote o especie..."
          value={filtroBuscar}
          onChange={(e) => { setFiltroBuscar(e.target.value); setPagina(0) }}
          className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={filtroZona}
          onChange={(e) => { setFiltroZona(e.target.value); setPagina(0) }}
          className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todas las zonas</option>
          {zonas.map(z => <option key={z.idZona} value={z.idZona}>{z.nombre}</option>)}
        </select>
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); setPagina(0) }}
          className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Todos los estados</option>
          <option value="GERMINANDO">GERMINANDO</option>
          <option value="CRECIENDO">CRECIENDO</option>
          <option value="LISTO_PARA_VENTA">LISTO PARA VENTA</option>
          <option value="EN_TIENDA">EN TIENDA</option>
          <option value="DESCARTADO">DESCARTADO</option>
        </select>
        <div className="flex items-center gap-2 border-l pl-3 ml-2 border-gray-200">
          <span className="text-xs text-gray-500">Ordenar por:</span>
          <select
            value={ordenCampo}
            onChange={(e) => { setOrdenCampo(e.target.value); setPagina(0) }}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="fechaSiembra">Fecha de Siembra</option>
            <option value="fechaCreacion">Fecha de Registro</option>
            <option value="nombre">Especie</option>
            <option value="codigo">Código Lote</option>
          </select>
          <button
            onClick={() => setOrdenDir(d => d === 'asc' ? 'desc' : 'asc')}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors"
            title="Cambiar dirección"
          >
            {ordenDir === 'asc' ? '⬆️ Asc' : '⬇️ Desc'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="p-10 text-center text-gray-500">Cargando...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Código / Especie</th>
                <th className="p-4">Zona</th>
                <th className="p-4">Fechas</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Vinculación</th>
                <th className="p-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {lotes.map(l => (
                <tr key={l.idLote} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-bold">{l.codigoLote || 'N/A'}</div>
                    <div className="text-emerald-700">{l.especie}</div>
                  </td>
                  <td className="p-4">{l.nombreZona}</td>
                  <td className="p-4">
                    <div className="text-sm" title="Fecha de Siembra">🌱 {l.fechaSiembra ? new Date(l.fechaSiembra).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-xs text-gray-400" title="Fecha de Registro">📝 {l.fechaCreacion ? new Date(l.fechaCreacion).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td className="p-4">{l.cantidadActual} / {l.cantidadInicial}</td>
                  <td className="p-4">{l.estadoLote}</td>
                  <td className="p-4">
                    {l.esVinculado ? (
                      <span className="text-green-600 text-xs">Vinculado a: {l.nombreProducto}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">No vinculado</span>
                    )}
                  </td>
                  <td className="p-4">
                    {['LISTO_PARA_VENTA', 'LISTO PARA VENTA'].includes(l.estadoLote?.trim()?.toUpperCase()) && !l.esVinculado && (
                      <button 
                        onClick={() => setModalVinculacion({ abierto: true, lote: l, idProducto: '' })}
                        className="text-emerald-600 border border-emerald-600 px-2 py-1 rounded"
                      >
                        Vincular a Catálogo
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalRegistro && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-5 text-gray-800">Registrar Nuevo Lote</h3>
            <form onSubmit={handleCrearLote} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Código del Lote</label>
                <input required placeholder="Ej: LOTE-FIC-001" value={nuevoLote.codigoLote} onChange={e => setNuevoLote({...nuevoLote, codigoLote: e.target.value})} className="w-full border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 p-2.5 rounded-xl outline-none transition-all" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especie / Variedad</label>
                <input required placeholder="Ej: Ficus Lyrata" value={nuevoLote.especie} onChange={e => setNuevoLote({...nuevoLote, especie: e.target.value})} className="w-full border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 p-2.5 rounded-xl outline-none transition-all" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad Inicial</label>
                  <input required type="number" min="1" placeholder="Ej: 50" value={nuevoLote.cantidadInicial} onChange={e => setNuevoLote({...nuevoLote, cantidadInicial: e.target.value})} className="w-full border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 p-2.5 rounded-xl outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Siembra</label>
                  <input required type="date" value={nuevoLote.fechaSiembra} onChange={e => setNuevoLote({...nuevoLote, fechaSiembra: e.target.value})} className="w-full border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 p-2.5 rounded-xl outline-none transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zona Asignada</label>
                <select required value={nuevoLote.idZona} onChange={e => setNuevoLote({...nuevoLote, idZona: e.target.value})} className="w-full border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 p-2.5 rounded-xl outline-none transition-all bg-white">
                  <option value="" disabled>Seleccione Zona...</option>
                  {zonas.map(z => <option key={z.idZona} value={z.idZona}>{z.nombre}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado Inicial</label>
                <select required value={nuevoLote.estadoLote} onChange={e => setNuevoLote({...nuevoLote, estadoLote: e.target.value})} className="w-full border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 p-2.5 rounded-xl outline-none transition-all bg-white">
                  <option value="GERMINANDO">GERMINANDO</option>
                  <option value="CRECIENDO">CRECIENDO</option>
                  <option value="LISTO_PARA_VENTA">LISTO PARA VENTA</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModalRegistro(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium shadow-sm">Registrar Lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalVinculacion.abierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-3 text-gray-800">Vincular Lote al Catálogo</h3>
            <p className="text-sm text-gray-600 mb-5 bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="font-semibold block text-gray-700 mb-1">Lote actual:</span>
              {modalVinculacion.lote.codigoLote} - {modalVinculacion.lote.especie} 
              <span className="ml-1 text-emerald-600 font-medium">({modalVinculacion.lote.cantidadActual} u.)</span>
            </p>
            <form onSubmit={handleVincular} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Producto del Catálogo</label>
                <select required value={modalVinculacion.idProducto} onChange={e => setModalVinculacion({...modalVinculacion, idProducto: e.target.value})} className="w-full border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 p-2.5 rounded-xl outline-none transition-all bg-white">
                  <option value="" disabled>Seleccione Producto...</option>
                  {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombreProducto}</option>)}
                </select>
                <p className="text-xs text-gray-500 mt-2">El stock activo de este lote se sumará al producto seleccionado y el lote pasará a estado EN TIENDA.</p>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setModalVinculacion({ abierto: false, lote: null, idProducto: '' })} className="px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl transition-colors font-medium">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors font-medium shadow-sm">Confirmar Vinculación</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
