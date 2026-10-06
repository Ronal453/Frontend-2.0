import { useEffect, useState, useRef } from 'react'
import { getReporte, getProductosStockCritico, exportarReporteCSV } from '../api/adminApi'
import { DollarSign, Package, Sprout, AlertTriangle, Download, FileText, TrendingUp, Target } from 'lucide-react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const COLORS_ESTADO = {
  PENDIENTE: '#facc15',
  PREPARANDO: '#60a5fa',
  ENVIADO: '#c084fc',
  ENTREGADO: '#22c55e',
  CANCELADO: '#f87171'
}

const ESTADO_CONFIG = {
  PENDIENTE:  { color: 'bg-yellow-400', texto: 'text-yellow-700' },
  PREPARANDO: { color: 'bg-blue-400',   texto: 'text-blue-700'   },
  ENVIADO:    { color: 'bg-purple-400', texto: 'text-purple-700' },
  ENTREGADO:  { color: 'bg-green-500',  texto: 'text-green-700'  },
  CANCELADO:  { color: 'bg-red-400',    texto: 'text-red-700'    },
}

const FASE_CONFIG = {
  GERMINANDO:       { color: 'bg-yellow-400', label: 'Germinando' },
  CRECIENDO:        { color: 'bg-blue-400',   label: 'Creciendo' },
  LISTO_PARA_VENTA: { color: 'bg-green-500',  label: 'Listo' },
  DESCARTADO:       { color: 'bg-red-400',    label: 'Descartado' },
}

const TAREA_CONFIG = {
  POR_HACER:   { color: 'bg-slate-400', label: 'Por Hacer' },
  EN_PROGRESO: { color: 'bg-blue-400',  label: 'Progreso' },
  EN_REVISION: { color: 'bg-purple-400',label: 'Revisión' },
  COMPLETADA:  { color: 'bg-green-500', label: 'Completada' },
  BLOQUEADA:   { color: 'bg-red-500',   label: 'Bloqueada' },
}

export default function AdminDashboard() {
  const [reporte,  setReporte]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const [stockCritico, setStockCritico] = useState([])
  const [cargandoStock, setCargandoStock] = useState(true)

  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin,    setFechaFin]    = useState('')
  const [exportando,  setExportando]  = useState(false)
  const [errorExport, setErrorExport] = useState('')
  const [exportandoPdf, setExportandoPdf] = useState(false)

  const dashboardRef = useRef(null)

  const handleExportarPDF = () => {
    setExportandoPdf(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      const localFmt = (val) => '$' + Number(val ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })
      
      pdf.setFontSize(22)
      pdf.setTextColor(15, 23, 42)
      pdf.text('Reporte Gerencial - Plantopolis', 14, 20)
      
      pdf.setFontSize(11)
      pdf.setTextColor(100)
      const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
      pdf.text(`Fecha de generación: ${dateStr}`, 14, 28)
      if (fechaInicio || fechaFin) {
        pdf.text(`PerÃ­odo: ${fechaInicio || 'Inicio'} a ${fechaFin || 'Hoy'}`, 14, 34)
      }

      pdf.setFontSize(14)
      pdf.setTextColor(15, 23, 42)
      pdf.text('Indicadores Principales', 14, 45)
      
      pdf.autoTable({
        startY: 50,
        head: [['Métrica', 'Valor', 'Descripción']],
        body: [
          ['Ingresos', localFmt(reporte?.totalIngresos), 'Total de ventas procesadas'],
          ['Total Pedidos', (reporte?.totalPedidos ?? 0).toString(), 'Pedidos en el sistema'],
          ['Productos Activos', (reporte?.totalProductosActivos ?? 0).toString(), 'Plantas/Productos en catálogo'],
          ['Ticket Promedio', localFmt(reporte?.promedioOrden), 'Promedio de venta por orden']
        ],
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42] }
      })

      let finalY = pdf.lastAutoTable.finalY + 15

      if (reporte?.topProductos && reporte.topProductos.length > 0) {
        if (finalY > 230) { pdf.addPage(); finalY = 20; }
        pdf.setFontSize(14)
        pdf.text('Top Productos Más Vendidos', 14, finalY)
        
        pdf.autoTable({
          startY: finalY + 5,
          head: [['Producto', 'Cantidad Vendida', 'Total Recaudado']],
          body: reporte.topProductos.map(p => [
            p.nombreProducto, 
            (p.totalVendido ?? 0).toString(),
            localFmt(p.totalIngresos)
          ]),
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129] }
        })
        finalY = pdf.lastAutoTable.finalY + 15
      }

      if (reporte?.pedidosPorEstado) {
         if (finalY > 230) { pdf.addPage(); finalY = 20; }
         pdf.setFontSize(14)
         pdf.text('Desglose de Pedidos por Estado', 14, finalY)
         
         pdf.autoTable({
            startY: finalY + 5,
            head: [['Estado', 'Cantidad']],
            body: Object.entries(reporte.pedidosPorEstado).map(([estado, cantidad]) => [estado, cantidad.toString()]),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
         })
      }

      pdf.save(`reporte_ejecutivo_plantopolis_${new Date().toISOString().slice(0, 10)}.pdf`)
    } catch (err) {
      console.error(err)
      alert('Error: ' + err.message)
      setErrorExport('Error generando el PDF')
    } finally {
      setExportandoPdf(false)
    }
  }

  useEffect(() => {
    getReporte(fechaInicio, fechaFin)
      .then(r => setReporte(r.data))
      .catch(() => setError('No se pudo cargar el reporte. Revisa el backend.'))
      .finally(() => setLoading(false))
    }, [fechaInicio, fechaFin])

  useEffect(() => {
    getProductosStockCritico()
      .then(r => setStockCritico(r.data))
      .catch(() => setStockCritico([]))
      .finally(() => setCargandoStock(false))
  }, [])

  const handleExportarCSV = async () => {
    setExportando(true)
    setErrorExport('')
    try {
      const res = await exportarReporteCSV(fechaInicio || null, fechaFin || null)
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8' })
      const url  = window.URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = `pedidos_plantopolis_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      setErrorExport('No se pudo generar el archivo CSV. Intenta de nuevo.')
    } finally {
      setExportando(false)
    }
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600" />
    </div>
  )

  if (error) return (
    <div className="p-6 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800">
      <AlertTriangle className="inline mr-2" /> {error}
    </div>
  )

  const maxEstado = reporte?.pedidosPorEstado
    ? Math.max(...Object.values(reporte.pedidosPorEstado), 1)
    : 1

  const fmt = (val) =>
    '$' + Number(val ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 0 })

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10" ref={dashboardRef}>

      {/* --- ENCABEZADO LOCAL --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">Dashboard Ejecutivo</h1>
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">Análisis de E-Commerce y Ventas</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Desde</label>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Hasta</label>
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 transition-all" />
            </div>
            {(fechaInicio || fechaFin) && (
              <button onClick={() => { setFechaInicio(''); setFechaFin('') }} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors">Limpiar</button>
            )}
          </div>
          <button
            onClick={handleExportarPDF}
          disabled={exportandoPdf}
          className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-800/20 transition-all disabled:opacity-50 flex items-center gap-2"
        >
          {exportandoPdf ? (
            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <FileText size={18} />
          )}
          {exportandoPdf ? 'Generando PDF...' : 'Exportar a PDF'}
        </button>
      </div>

      {/* --- SECCIÓN E-COMMERCE --- */}
      <div>
        <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <TrendingUp size={16} /> E-Commerce & Ventas
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <KpiCard icon={DollarSign} titulo="Ingresos" valor={fmt(reporte?.totalIngresos)}
                   sub="Pagos aprobados" color="purple" />
          <KpiCard icon={Package} titulo="Pedidos" valor={reporte?.totalPedidos ?? 0}
                   sub="En el sistema" color="blue" />
          <KpiCard icon={Sprout} titulo="Productos" valor={reporte?.totalProductosActivos ?? 0}
                   sub="En catálogo" color="green" />
          <KpiCard icon={Target} titulo="Ticket Promedio" valor={fmt(reporte?.promedioOrden)}
                   sub="Valor por orden" color="pink" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart Panel Pedidos */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <h2 className="font-bold text-slate-800 dark:text-white text-lg mb-4">
            Pedidos por Estado
          </h2>

          <div className="flex-1 min-h-[250px]">
            {reporte?.pedidosPorEstado ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={Object.entries(reporte.pedidosPorEstado).map(([name, value]) => ({ name, value }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                      label={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                      labelLine={{ stroke: '#cbd5e1' }}
                  >
                    {Object.entries(reporte.pedidosPorEstado).map(([estado], index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_ESTADO[estado] || '#94a3b8'} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">Sin datos</div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-4">
             {reporte?.pedidosPorEstado && Object.keys(reporte.pedidosPorEstado).map(estado => (
               <div key={estado} className="flex items-center gap-1.5 text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: COLORS_ESTADO[estado] || '#94a3b8' }}></span>
                  {estado.substring(0, 3)}
               </div>
             ))}
          </div>
        </div>

        {/* Top Products Panel */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <h2 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2">
            Top productos vendidos
          </h2>

          <div className="flex-1 min-h-[250px]">
            {(!reporte?.topProductos || reporte.topProductos.length === 0) ? (
              <div className="h-full flex items-center justify-center text-slate-400">AÃºn no hay ventas</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reporte.topProductos} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="nombreProducto" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }} 
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none', color: '#fff' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    formatter={(value, name) => [value + ' uds.', 'Vendido']}
                  />
                  <Bar dataKey="totalVendido" fill="#10b981" radius={[0, 4, 4, 0]} barSize={24}>
                      <LabelList dataKey="totalVendido" position="right" fill="#64748b" fontSize={11} fontWeight="bold" />
                    </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* --- SECCIÓN ALERTAS Y EXPORTACIÃ“N --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        
        {/* Alerts Panel */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-orange-200 dark:border-orange-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px] rounded-full pointer-events-none"></div>
          
          <div className="flex items-center justify-between mb-6 relative z-10">
            <h2 className="font-bold text-slate-800 dark:text-white text-lg flex items-center gap-2">
              <AlertTriangle className="text-orange-500" /> Alerta de Stock Crítico
            </h2>
            {stockCritico.length > 0 && (
              <span className="text-xs font-black bg-orange-500 text-white px-3 py-1.5 rounded-xl shadow-md">
                {stockCritico.length} crÃ­tico
              </span>
            )}
          </div>

          {cargandoStock ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
            </div>
          ) : stockCritico.length === 0 ? (
            <p className="text-emerald-600 dark:text-emerald-400 text-sm font-bold text-center py-6 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
              Ningún producto está por debajo de su umbral
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto relative z-10 pr-2 custom-scrollbar">
              {stockCritico.map(p => (
                <div key={p.idProducto}
                     className="flex items-center justify-between bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-500/30 rounded-2xl px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                      {p.nombreProducto}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                      Umbral de alerta: {p.stockMinimoAlerta} ud.
                    </p>
                  </div>
                  <span className={`text-sm font-black flex-shrink-0 ml-3 px-3 py-1.5 rounded-xl
                                    ${p.stock === 0 ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                    {p.stock} ud.
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export Panel */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
          <h2 className="font-bold text-slate-800 dark:text-white text-lg mb-2 flex items-center gap-2">
            <Download className="text-blue-500" /> Exportar Ventas
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-6 font-medium leading-relaxed">
            Descarga el historial de pedidos en CSV para análisis en Excel/Sheets. Deja vacío para exportar todo el histórico.
          </p>

          <div className="mt-auto flex justify-end">
            <button
              onClick={handleExportarCSV}
              disabled={exportando}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/30 hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {exportando ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generando...
                </>
              ) : (
                <>Descargar CSV</>
              )}
            </button>
          </div>
          
          {errorExport && (
            <p className="text-xs font-bold text-red-500 mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-200 dark:border-red-800">
              <AlertTriangle size={14} className="inline mr-1" /> {errorExport}
            </p>
          )}
        </div>

      </div>

    </div>
  )
}

function KpiCard({ icon: Icon, titulo, valor, sub, color }) {
  const colorStyles = {
    purple: 'text-purple-600 dark:text-purple-400 bg-purple-100/50 dark:bg-purple-500/20 border-purple-200 dark:border-purple-500/30',
    blue:   'text-blue-600 dark:text-blue-400 bg-blue-100/50 dark:bg-blue-500/20 border-blue-200 dark:border-blue-500/30',
    green:  'text-emerald-600 dark:text-emerald-400 bg-emerald-100/50 dark:bg-emerald-500/20 border-emerald-200 dark:border-emerald-500/30',
    pink:   'text-pink-600 dark:text-pink-400 bg-pink-100/50 dark:bg-pink-500/20 border-pink-200 dark:border-pink-500/30',
  }

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl rounded-3xl border border-slate-200 dark:border-slate-800 p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl flex flex-col gap-3 group shadow-md">
      <div className="flex justify-between items-start">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorStyles[color]} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
      </div>
      <div>
        <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{titulo}</p>
        <p className="text-2xl lg:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none">{valor}</p>
      </div>
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">{sub}</p>
    </div>
  )
}