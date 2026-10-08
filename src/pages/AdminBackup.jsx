import { useState, useEffect } from 'react'
import { generarBackup, getResumenBackup, restaurarBackup } from '../api/adminApi'
import { DatabaseBackup, Download, UploadCloud, AlertTriangle, ShieldCheck, RefreshCcw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function AdminBackup() {
  const [generando, setGenerando] = useState(false)
  const [restaurando, setRestaurando] = useState(false)
  const [resumenBD, setResumenBD] = useState([])
  const [reporteGenerado, setReporteGenerado] = useState(null)
  const [reporteRestaurado, setReporteRestaurado] = useState(null)

  const [archivo, setArchivo] = useState(null)
  const [confirmacion, setConfirmacion] = useState('')
  const [showModal, setShowModal] = useState(false)

  const { logout } = useAuth()

  const cargarResumen = async () => {
    try {
      const res = await getResumenBackup()
      setResumenBD(res.data)
    } catch (error) {
      console.error('Error al cargar resumen:', error)
    }
  }

  useEffect(() => {
    cargarResumen()
  }, [])

  const handleGenerarBackup = async () => {
    if (generando) return
    setGenerando(true)
    setReporteGenerado(null)
    setReporteRestaurado(null)

    try {
      const res = await generarBackup()
      
      const text = await res.data.text()
      const lineas = text.split('\n')
      const tablas = []
      let total = 0
      
      for (const linea of lineas) {
        if (linea.startsWith('-- @reporte')) {
          const [tabla, filas] = linea.replace('-- @reporte ', '').split('=')
          tablas.push({ nombreTabla: tabla, filas: parseInt(filas, 10) })
        } else if (linea.startsWith('-- @total')) {
          total = parseInt(linea.replace('-- @total ', ''), 10)
        }
      }

      setReporteGenerado({ tablas, totalFilas: total })

      const blob = new Blob([res.data], { type: 'application/sql;charset=utf-8' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `plantopolis_backup_${new Date().toISOString().replace(/[:.]/g, '').slice(0, 15)}.sql`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Error al generar backup', error)
      alert('Hubo un error al generar la copia de seguridad.')
    } finally {
      setGenerando(false)
    }
  }

  const handleRestaurar = async () => {
    if (confirmacion !== 'RESTAURAR' || !archivo) return
    
    setShowModal(false)
    setRestaurando(true)
    setReporteRestaurado(null)
    setReporteGenerado(null)

    try {
      const res = await restaurarBackup(archivo)
      setReporteRestaurado(res.data)
      setConfirmacion('')
      setArchivo(null)
      cargarResumen()

    } catch (error) {
      console.error('Error al restaurar', error)
      if (error.response?.status === 413) {
        alert('El archivo supera el tamaño máximo permitido (50 MB).')
      } else if (error.response?.status === 400) {
        alert('Archivo inválido o corrupto: ' + error.response.data?.mensaje)
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        alert('Tu sesión ya no es válida tras la restauración. Inicia sesión con una cuenta del backup.')
        logout()
      } else {
        alert('Error al restaurar la base de datos.')
      }
    } finally {
      setRestaurando(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-400">
          <DatabaseBackup size={28} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Copias de Seguridad</h1>
          <p className="text-slate-500 text-sm">Respalda y restaura toda la base de datos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4 text-emerald-500">
            <Download size={24} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Generar Backup</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Descarga un archivo <code>.sql</code> con todos los datos actuales (24 tablas). 
            La estructura se mantiene, solo se exportan los datos en una transacción consistente.
          </p>
          <button 
            onClick={handleGenerarBackup}
            disabled={generando}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {generando ? <RefreshCcw className="animate-spin" size={20} /> : <DatabaseBackup size={20} />}
            {generando ? 'Generando...' : 'Generar Copia de Seguridad'}
          </button>

          {reporteGenerado && (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
              <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex justify-between">
                <span>Backup generado con éxito</span>
                <span>{reporteGenerado.totalFilas} filas totales</span>
              </h3>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto custom-scrollbar">
                {reporteGenerado.tablas.map(t => (
                  <div key={t.nombreTabla} className="flex justify-between">
                    <span className="truncate pr-2">{t.nombreTabla}</span>
                    <span className="font-mono font-bold">{t.filas}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-sm border border-red-200 dark:border-red-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle size={100} className="text-red-500" />
          </div>
          
          <div className="flex items-center gap-2 mb-4 text-red-500">
            <UploadCloud size={24} />
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Restaurar Base de Datos</h2>
          </div>
          
          <div className="p-3 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm rounded-xl mb-6 font-medium">
            <strong>Advertencia crítica:</strong> Esta acción borrará todos los datos actuales y los reemplazará por los del archivo <code>.sql</code>. Se generará un backup automático de seguridad antes de proceder.
          </div>

          <div className="space-y-4 relative z-10">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                Archivo de Backup (.sql)
              </label>
              <input 
                type="file" 
                accept=".sql"
                onChange={e => setArchivo(e.target.files[0])}
                className="w-full text-sm text-slate-500 dark:text-slate-400
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-xl file:border-0
                  file:text-sm file:font-semibold
                  file:bg-cyan-50 file:text-cyan-700
                  hover:file:bg-cyan-100
                  dark:file:bg-cyan-900/50 dark:file:text-cyan-300"
              />
            </div>

            <button 
              onClick={() => setShowModal(true)}
              disabled={!archivo || restaurando}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {restaurando ? <RefreshCcw className="animate-spin" size={20} /> : <AlertTriangle size={20} />}
              {restaurando ? 'Restaurando y validando...' : 'Iniciar Restauración'}
            </button>
          </div>

          {reporteRestaurado && (
            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
              <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex justify-between">
                <span>Restauración completada en {reporteRestaurado.duracionMs}ms</span>
                <span>{reporteRestaurado.totalFilas} filas</span>
              </h3>
              
              {reporteRestaurado.advertencias?.length > 0 && (
                <div className="mb-2 p-2 bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs rounded-lg">
                  {reporteRestaurado.advertencias.map((adv, i) => <p key={i}>⚠️ {adv}</p>)}
                </div>
              )}

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400 max-h-40 overflow-y-auto custom-scrollbar">
                {reporteRestaurado.tablas.map(t => (
                  <div key={t.nombreTabla} className="flex justify-between">
                    <span className="truncate pr-2">{t.nombreTabla}</span>
                    <span className="font-mono font-bold">{t.filas}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
          <ShieldCheck className="text-cyan-500" />
          Estado actual (Filas por tabla)
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {resumenBD.map(t => (
            <div key={t.nombreTabla} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate pr-2">{t.nombreTabla}</span>
              <span className="text-sm font-black text-slate-800 dark:text-white font-mono">{t.filas}</span>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#111827] rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <div className="flex justify-center mb-4 text-red-500">
              <AlertTriangle size={48} />
            </div>
            <h3 className="text-xl font-black text-center text-slate-800 dark:text-white mb-2">
              ¿Estás seguro?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm text-center mb-6">
              Todos los datos actuales se perderán. Escribe la palabra <strong className="text-red-500">RESTAURAR</strong> para confirmar la restauración del archivo:
              <strong className="text-cyan-600 dark:text-cyan-400 font-mono mt-2 block bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded-lg border border-cyan-100 dark:border-cyan-800">
                {archivo?.name} ({(archivo?.size / 1024 / 1024).toFixed(2)} MB)
              </strong>
            </p>
            
            <input 
              type="text"
              value={confirmacion}
              onChange={e => setConfirmacion(e.target.value)}
              placeholder="RESTAURAR"
              className="w-full text-center p-3 mb-6 bg-slate-50 dark:bg-[#060A11] border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-slate-800 dark:text-white font-bold"
            />

            <div className="flex gap-3">
              <button 
                onClick={() => { setShowModal(false); setConfirmacion(''); }}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleRestaurar}
                disabled={confirmacion !== 'RESTAURAR'}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
