import { useState, useEffect, useMemo } from 'react'
import { getMermasRecientes } from '../api/trabajadorApi'
import { Bug, ClipboardList, Loader2, ArrowDownRight, User, Calendar, Filter, BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

export default function AdminMermas() {
  const [mermas, setMermas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')

  const cargarDatos = async () => {
    setCargando(true)
    setError('')
    try {
      const resMermas = await getMermasRecientes(200, fechaInicio, fechaFin)
      setMermas(resMermas.data || [])
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar el reporte de mermas')
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarDatos()
  }, [])

  const handleFilter = (e) => {
    e.preventDefault()
    cargarDatos()
  }

  // Agrupar mermas por causa para la gráfica
  const datosGrafica = useMemo(() => {
    const agrupado = mermas.reduce((acc, merma) => {
      const causa = merma.nombreCausa || 'Otra'
      if (!acc[causa]) {
        acc[causa] = 0
      }
      acc[causa] += merma.cantidadPerdida || 0
      return acc
    }, {})

    // Convertir a array de objetos para Recharts
    return Object.entries(agrupado)
      .map(([name, cantidad]) => ({ name, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad) // Ordenar de mayor a menor
  }, [mermas])

  const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#14b8a6', '#3b82f6', '#8b5cf6', '#d946ef']

  return (
    <div className="flex h-full animate-fade-in flex-col">
      <div className="flex-1 max-w-7xl mx-auto overflow-auto custom-scrollbar flex flex-col w-full pb-8">
        
        {/* CABECERA */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 text-white">
              <Bug size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Reporte de Mermas y Causas
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">
                Análisis de pérdidas para identificar patrones y prevenir incidencias
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 rounded-2xl text-sm font-bold flex items-center gap-2">
            <Bug size={18} /> {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* FILTRO DE FECHAS */}
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 flex flex-col h-full">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Filter size={18} className="text-slate-400" />
              Filtrar por Periodo
            </h2>
            <form onSubmit={handleFilter} className="space-y-4 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha Inicio</label>
                <input 
                  type="date" 
                  value={fechaInicio}
                  onChange={e => setFechaInicio(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 dark:text-slate-200"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Fecha Fin</label>
                <input 
                  type="date" 
                  value={fechaFin}
                  onChange={e => setFechaFin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-red-500 dark:text-slate-200"
                />
              </div>
              <div className="mt-auto pt-2">
                <button type="submit" className="w-full py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm">
                  Aplicar Filtro
                </button>
              </div>
            </form>
          </div>

          {/* GRÁFICA DE BARRAS */}
          <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl p-5 rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 flex flex-col min-h-[300px]">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
              <BarChart3 size={18} className="text-slate-400" />
              Mermas por Causa Principal (Plantas Perdidas)
            </h2>
            
            {cargando ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 text-teal-500 animate-spin mb-2" />
                <p className="font-bold text-xs">Cargando gráfica...</p>
              </div>
            ) : datosGrafica.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-slate-500 text-sm font-bold">
                No hay datos en el periodo seleccionado.
              </div>
            ) : (
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datosGrafica} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" opacity={0.2} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                      angle={-25}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f1f5f9', opacity: 0.1 }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}
                    />
                    <Bar dataKey="cantidad" name="Plantas Perdidas" radius={[6, 6, 0, 0]}>
                      {datosGrafica.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        {/* TABLA DE HISTORIAL */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-200/60 dark:border-slate-700/50 overflow-hidden mb-6 flex-shrink-0">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ClipboardList size={20} className="text-slate-400" />
              Detalle de Registros
            </h2>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
              Mostrando {mermas.length} registros
            </span>
          </div>

          {cargando ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-10 h-10 text-teal-500 animate-spin mb-4" />
              <p className="font-bold text-sm">Cargando reporte...</p>
            </div>
          ) : mermas.length === 0 ? (
            <div className="py-24 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <Bug size={48} className="mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1} />
              <p className="font-bold text-sm text-slate-600 dark:text-slate-300">No hay mermas registradas en este periodo.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full custom-scrollbar">
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
                        <span className="inline-flex text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border bg-transparent border-red-300 dark:border-red-700/50 text-red-700 dark:text-red-400">
                          {m.nombreCausa}
                        </span>
                        {m.observaciones && (
                          <p className="mt-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 italic max-w-[300px] truncate" title={m.observaciones}>
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
  )
}
