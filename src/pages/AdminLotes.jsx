import { useState, useEffect } from 'react'
import { getLotes, getZonas } from '../api/trabajadorApi'
import { getProductosAdmin, crearLote, vincularLote } from '../api/adminApi'

export default function AdminLotes() {
  const [lotes, setLotes] = useState([])
  const [zonas, setZonas] = useState([])
  const [productos, setProductos] = useState([])
  const [filtroZona, setFiltroZona] = useState('')
  const [filtroEstado, setFiltroEstado] = useState('')
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
        getLotes({ idZona: filtroZona || undefined, estado: filtroEstado || undefined, page: pagina, size: 10 }),
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
  }, [filtroZona, filtroEstado, pagina])

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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {cargando ? (
          <div className="p-10 text-center text-gray-500">Cargando...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Código / Especie</th>
                <th className="p-4">Zona</th>
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
                    {l.estadoLote === 'LISTO_PARA_VENTA' && !l.esVinculado && (
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Registrar Nuevo Lote</h3>
            <form onSubmit={handleCrearLote} className="space-y-3">
              <input required placeholder="Código Lote" value={nuevoLote.codigoLote} onChange={e => setNuevoLote({...nuevoLote, codigoLote: e.target.value})} className="w-full border p-2 rounded" />
              <input required placeholder="Especie" value={nuevoLote.especie} onChange={e => setNuevoLote({...nuevoLote, especie: e.target.value})} className="w-full border p-2 rounded" />
              <input required type="number" placeholder="Cantidad Inicial" value={nuevoLote.cantidadInicial} onChange={e => setNuevoLote({...nuevoLote, cantidadInicial: e.target.value})} className="w-full border p-2 rounded" />
              <input required type="date" value={nuevoLote.fechaSiembra} onChange={e => setNuevoLote({...nuevoLote, fechaSiembra: e.target.value})} className="w-full border p-2 rounded" />
              <select required value={nuevoLote.idZona} onChange={e => setNuevoLote({...nuevoLote, idZona: e.target.value})} className="w-full border p-2 rounded">
                <option value="">Seleccione Zona...</option>
                {zonas.map(z => <option key={z.idZona} value={z.idZona}>{z.nombre}</option>)}
              </select>
              <select required value={nuevoLote.estadoLote} onChange={e => setNuevoLote({...nuevoLote, estadoLote: e.target.value})} className="w-full border p-2 rounded">
                <option value="GERMINANDO">GERMINANDO</option>
                <option value="CRECIENDO">CRECIENDO</option>
                <option value="LISTO_PARA_VENTA">LISTO PARA VENTA</option>
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalRegistro(false)} className="px-4 py-2 border rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalVinculacion.abierto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Vincular Lote al Catálogo</h3>
            <p className="text-sm mb-4">Lote: {modalVinculacion.lote.codigoLote} - {modalVinculacion.lote.especie} ({modalVinculacion.lote.cantidadActual} u.)</p>
            <form onSubmit={handleVincular} className="space-y-3">
              <select required value={modalVinculacion.idProducto} onChange={e => setModalVinculacion({...modalVinculacion, idProducto: e.target.value})} className="w-full border p-2 rounded">
                <option value="">Seleccione Producto...</option>
                {productos.map(p => <option key={p.idProducto} value={p.idProducto}>{p.nombreProducto}</option>)}
              </select>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" onClick={() => setModalVinculacion({ abierto: false, lote: null, idProducto: '' })} className="px-4 py-2 border rounded">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded">Vincular</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
