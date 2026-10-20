import { useEffect, useState, useCallback, useMemo } from 'react'
import { getLogsSistema, limpiarLogsMemoria } from '../api/adminApi'
import { useLanguage } from '../context/LanguageContext'
import FlashMessage from '../components/ui/FlashMessage'
import Pagination from '../components/ui/Pagination'
import {
  ScrollText, Search, RefreshCcw, Download, Trash2, CheckCircle2,
  AlertTriangle, XCircle, Eye, X, Clock,
  User, Shield, HardHat, ShoppingBag, Kanban, Sprout, Users,
  Package, DatabaseBackup, Activity, Filter,
  ChevronUp, ChevronDown
} from 'lucide-react'

/**
 * Panel administrativo de Logs y Acciones del Sistema.
 * Permite consultar en una tabla clara y ordenada todas las acciones realizadas en el sistema,
 * con controles para colapsar/expandir las métricas de acciones (tarjetas de resumen) y el
 * panel de filtros de búsqueda.
 *
 * @component
 * @returns {JSX.Element} Panel de monitoreo de acciones del sistema
 */
export default function AdminLogs() {
  const { t, language } = useLanguage()

  const [resumen, setResumen] = useState({
    totalEventos: 0,
    totalInfo: 0,
    totalSuccess: 0,
    totalWarn: 0,
    totalError: 0,
    eventosPorModulo: {},
    logs: []
  })
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null)
  const [mensaje, setMensaje] = useState(null)
  const [paginaActual, setPaginaActual] = useState(0)
  const ITEMS_POR_PAGINA = 15

  // Control para mostrar/ocultar el cuadro de filtros y las métricas de acciones (tarjetas de resumen)
  const [mostrarFiltros, setMostrarFiltros] = useState(true)
  const [mostrarResumenAcciones, setMostrarResumenAcciones] = useState(true)

  const [filtros, setFiltros] = useState({
    busqueda: '',
    modulo: '',
    nivel: '',
    limite: 300
  })

  /**
   * Lista memoizada de categorías con etiquetas traducidas dinámicamente según el idioma actual.
   */
  const CATEGORIAS = useMemo(() => [
    { valor: '',          label: t('admin.logs.catAll', 'Todas'),               icono: ScrollText },
    { valor: 'PEDIDOS',   label: t('admin.logs.catOrders', 'Pedidos y Ventas'),    icono: ShoppingBag },
    { valor: 'TAREAS',    label: t('admin.logs.catTasks', 'Tareas del Vivero'),   icono: Kanban },
    { valor: 'LOTES',     label: t('admin.logs.catBatches', 'Lotes y Cultivos'),    icono: Sprout },
    { valor: 'MERMAS',    label: t('admin.logs.catWaste', 'Mermas'),              icono: AlertTriangle },
    { valor: 'PRODUCTOS', label: t('admin.logs.catInventory', 'Inventario'),          icono: Package },
    { valor: 'USUARIOS',  label: t('admin.logs.catUsers', 'Usuarios y Accesos'),  icono: Users },
    { valor: 'BACKUP',    label: t('admin.logs.catBackup', 'Copias de Seguridad'), icono: DatabaseBackup },
  ], [t])

  /**
   * Muestra una notificación temporal en pantalla.
   */
  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto })
    setTimeout(() => setMensaje(null), 3500)
  }

  /**
   * Carga las acciones registradas en el sistema desde el backend.
   *
   * @param {boolean} [silencioso=false] - Evita mostrar el indicador de carga durante auto-refresh
   */
  const cargarLogs = useCallback(async (silencioso = false) => {
    if (!silencioso) setLoading(true)
    try {
      const res = await getLogsSistema({ limite: filtros.limite })
      setResumen(res.data)
    } catch (error) {
      console.error('Error al cargar logs del sistema:', error)
      if (!silencioso) {
        mostrarMensaje('error', t('admin.logs.loadError', 'No se pudieron cargar las acciones del sistema.'))
      }
    } finally {
      if (!silencioso) setLoading(false)
    }
  }, [filtros.limite, t])

  useEffect(() => {
    cargarLogs()
  }, [cargarLogs])

  // Auto-refresco cada 8 segundos cuando está activo
  useEffect(() => {
    if (!autoRefresh) return
    const timer = setInterval(() => {
      cargarLogs(true)
    }, 8000)
    return () => clearInterval(timer)
  }, [autoRefresh, cargarLogs])

  /**
   * Actualiza un filtro y regresa a la primera página.
   */
  const handleFiltro = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }))
    setPaginaActual(0)
  }

  /**
   * Limpia todos los filtros activos.
   */
  const limpiarFiltros = () => {
    setFiltros({ busqueda: '', modulo: '', nivel: '', limite: 300 })
    setPaginaActual(0)
  }

  /**
   * Limpia el buffer de acciones en memoria del servidor.
   */
  const handleLimpiarMemoria = async () => {
    if (!window.confirm(
      t('admin.logs.confirmClearMemory', '¿Limpiar los eventos recientes en memoria? El historial guardado en la base de datos se conservará intacto.')
    )) return

    try {
      await limpiarLogsMemoria()
      mostrarMensaje('ok', t('admin.logs.memoryCleared', 'Eventos en memoria reiniciados correctamente.'))
      cargarLogs()
    } catch (error) {
      mostrarMensaje('error', t('admin.logs.clearError', 'No se pudo limpiar la memoria temporal.'))
    }
  }

  /**
   * Traduce un estado operativo o de pedido según el idioma activo.
   *
   * @param {string} estado - Estado en texto plano o enum.
   * @returns {string} Estado traducido.
   */
  const traducirTextoEstado = (estado) => {
    if (!estado) return ''
    const normalizado = estado.trim().toUpperCase().replace(/\s+/g, '_')
    if (language === 'en') {
      const mapaEn = {
        POR_HACER: 'To do',
        EN_PROGRESO: 'In progress',
        EN_REVISION: 'In review',
        COMPLETADA: 'Completed',
        BLOQUEADA: 'Blocked',
        GERMINANDO: 'Germinating',
        CRECIENDO: 'Growing',
        LISTO_PARA_VENTA: 'Ready for sale',
        EN_TIENDA: 'In store',
        DESCARTADO: 'Discarded',
        PENDIENTE: 'Pending',
        EN_PREPARACION: 'In preparation',
        ENVIADO: 'Shipped',
        ENTREGADO: 'Delivered',
        CANCELADO: 'Cancelled',
        INICIO: 'Start',
      }
      return mapaEn[normalizado] || estado
    }
    const mapaEs = {
      POR_HACER: 'Por hacer',
      EN_PROGRESO: 'En progreso',
      EN_REVISION: 'En revisión',
      COMPLETADA: 'Completada',
      BLOQUEADA: 'Bloqueada',
      GERMINANDO: 'Germinando',
      CRECIENDO: 'Creciendo',
      LISTO_PARA_VENTA: 'Listo para venta',
      EN_TIENDA: 'En tienda',
      DESCARTADO: 'Descartado',
      PENDIENTE: 'Pendiente',
      EN_PREPARACION: 'En preparación',
      ENVIADO: 'Enviado',
      ENTREGADO: 'Entregado',
      CANCELADO: 'Cancelado',
      INICIO: 'Inicio',
    }
    return mapaEs[normalizado] || estado
  }

  /**
   * Traduce un nombre de rol según el idioma activo.
   *
   * @param {string} rol - Nombre de rol en mayúsculas o minúsculas.
   * @returns {string} Nombre del rol internacionalizado.
   */
  const traducirRolTexto = (rol) => {
    if (!rol) return ''
    const r = rol.trim().toUpperCase()
    if (language === 'en') {
      if (r === 'ADMINISTRADOR') return 'Administrator'
      if (r === 'TRABAJADOR') return 'Worker'
      if (r === 'CLIENTE') return 'Customer'
      return 'System'
    }
    if (r === 'ADMINISTRADOR') return 'Administrador'
    if (r === 'TRABAJADOR') return 'Trabajador'
    if (r === 'CLIENTE') return 'Cliente'
    return 'Sistema'
  }

  /**
   * Traduce cualquier código interno o nombre de acción a un título claro según el idioma activo.
   *
   * @param {string} accion - Código técnico o nombre de la acción.
   * @returns {string} Título humanizado e internacionalizado.
   */
  const humanizarTitulo = (accion) => {
    if (!accion) return t('logAction.Acción del sistema', 'Acción del sistema')

    // 1. Búsqueda directa en diccionario por clave exacta
    const claveDirecta = 'logAction.' + accion
    const traduccionDirecta = t(claveDirecta)
    if (traduccionDirecta && traduccionDirecta !== claveDirecta) {
      return traduccionDirecta
    }

    // 2. Mapeo explícito para códigos conocidos con fallbacks
    const mapa = {
      CAMBIO_ESTADO_TAREA: t('logAction.CAMBIO_ESTADO_TAREA', 'Actualización de tarea'),
      COMENTARIO_TAREA: t('logAction.COMENTARIO_TAREA', 'Nota agregada en tarea'),
      REASIGNACION: t('logAction.REASIGNACION', 'Reasignación de tarea'),
      TRANSICION_FASE_LOTE: t('logAction.TRANSICION_FASE_LOTE', 'Cambio de etapa en lote de cultivo'),
      CREACION_LOTE_CULTIVO: t('logAction.CREACION_LOTE_CULTIVO', 'Nuevo lote sembrado'),
      REGISTRO_MERMA: t('logAction.REGISTRO_MERMA', 'Registro de pérdida (merma)'),
      ALTA_OPERARIO: t('logAction.ALTA_OPERARIO', 'Nuevo trabajador registrado'),
      REGISTRO_CUENTA: t('logAction.REGISTRO_CUENTA', 'Nuevo usuario registrado'),
      INICIO_SESION: t('logAction.INICIO_SESION', 'Inicio de sesión'),
      CIERRE_SESION: t('logAction.CIERRE_SESION', 'Cierre de sesión'),
      GENERAR_BACKUP_SQL: t('logAction.GENERAR_BACKUP_SQL', 'Descarga de copia de seguridad'),
      RESTAURAR_BASE_DATOS: t('logAction.RESTAURAR_BASE_DATOS', 'Restauración del sistema'),
      LIMPIEZA_LOGS_MEMORIA: t('logAction.LIMPIEZA_LOGS_MEMORIA', 'Limpieza de memoria de logs'),
    }
    if (mapa[accion]) return mapa[accion]
    if (accion.startsWith('ORDEN_COMPRA_')) return t('logAction.Compra realizada en tienda', 'Compra realizada en tienda')

    if (accion.includes('_')) {
      const limpio = accion.replace(/_/g, ' ').toLowerCase()
      return limpio.charAt(0).toUpperCase() + limpio.slice(1)
    }
    return accion
  }

  /**
   * Traduce y formatea las descripciones de las acciones del sistema para que sean cómodas
   * de leer y se adapten al idioma activo (español o inglés).
   *
   * @param {string} descripcion - Texto original de la descripción emitida por el backend.
   * @returns {string} Descripción procesada y adaptada al idioma seleccionado.
   */
  const humanizarDescripcion = (descripcion) => {
    if (!descripcion) return ''

    // 1. Comprobación directa en diccionario de traducciones
    const claveDirecta = 'logDesc.' + descripcion
    const traduccionDirecta = t(claveDirecta)
    if (traduccionDirecta && traduccionDirecta !== claveDirecta) {
      return traduccionDirecta
    }

    const esEn = language === 'en'

    // 2. Mapeos dinámicos basados en expresiones regulares
    // Tarea reasignada: "La tarea #123 pasó de estar asignada a X para asignarse a Y."
    const mReasig = descripcion.match(/^La tarea #(\d+) pasó de estar asignada a (.+) para asignarse a (.+)\.$/)
    if (mReasig) {
      const [, id, ant, nvo] = mReasig
      if (esEn) {
        const prev = ant === 'Sin asignar' ? 'Unassigned' : ant
        const next = nvo === 'Sin asignar' ? 'Unassigned' : nvo
        return `Task #${id} reassigned from ${prev} to ${next}.`
      }
      return descripcion
    }

    // Tarea cambio estado: "La tarea #123 cambió su estado de «X» a «Y»."
    const mEstTarea = descripcion.match(/^La tarea #(\d+) cambió su estado de [«"](.+?)[»"] a [«"](.+?)[»"]\.$/)
    if (mEstTarea) {
      const [, id, ant, nvo] = mEstTarea
      if (esEn) {
        return `Task #${id} status changed from "${traducirTextoEstado(ant)}" to "${traducirTextoEstado(nvo)}".`
      }
      return `La tarea #${id} cambió su estado de «${traducirTextoEstado(ant)}» a «${traducirTextoEstado(nvo)}».`
    }

    // Comentario en tarea: "Se dejó un comentario en la tarea #123: "XYZ""
    const mComentario = descripcion.match(/^Se dejó un comentario en la tarea #(\d+): "(.*)"$/)
    if (mComentario) {
      const [, id, texto] = mComentario
      if (esEn) {
        return `A note was added to task #${id}: "${texto}"`
      }
      return descripcion
    }

    // Cambio etapa lote: "El lote #123 pasó de «X» a «Y» (obs)."
    const mLoteFase = descripcion.match(/^El lote #(\d+) pasó de [«"](.+?)[»"] a [«"](.+?)[»"](\s*\(.*?\))?\.$/)
    if (mLoteFase) {
      const [, id, ant, nvo, obs = ''] = mLoteFase
      if (esEn) {
        return `Crop batch #${id} transitioned from "${traducirTextoEstado(ant)}" to "${traducirTextoEstado(nvo)}"${obs}.`
      }
      return `El lote #${id} pasó de «${traducirTextoEstado(ant)}» a «${traducirTextoEstado(nvo)}»${obs}.`
    }

    // Merma reportada: "Se reportaron 5 plantas perdidas en el lote LOTE-1 por motivo de «Causa»."
    const mMerma = descripcion.match(/^Se reportaron (\d+) plantas perdidas en el lote (.+?) por motivo de [«"](.+?)[»"]\.$/)
    if (mMerma) {
      const [, cant, lote, causa] = mMerma
      if (esEn) {
        const causaTrad = t('wasteCause.' + causa, causa)
        return `Reported ${cant} plants lost in batch ${lote} due to "${causaTrad}".`
      }
      return descripcion
    }

    // Pedido registrado: "Pedido PED-001 registrado por valor de $50000 (Estado: Pendiente)."
    const mPed = descripcion.match(/^Pedido (.+?) registrado por valor de \$([0-9.,]+) \(Estado: (.+?)\)\.$/)
    if (mPed) {
      const [, num, val, est] = mPed
      if (esEn) {
        return `Order ${num} placed for $${val} (Status: ${traducirTextoEstado(est)}).`
      }
      return descripcion
    }

    // Lote sembrado: "Se creó el lote L-1 (Ficus) con 50 unidades iniciales en Invernadero 1."
    const mLoteCreado = descripcion.match(/^Se creó el lote (.+?) \((.+?)\) con (\d+) unidades iniciales en (.+?)\.$/)
    if (mLoteCreado) {
      const [, cod, esp, cant, zona] = mLoteCreado
      if (esEn) {
        const zonaTrad = t('zone.name.' + zona, zona)
        return `Batch ${cod} (${esp}) created with ${cant} initial units in ${zonaTrad}.`
      }
      return descripcion
    }

    // Cuenta creada: "Se creó la cuenta de Juan (juan@mail.com) con perfil de TRABAJADOR."
    const mCuenta = descripcion.match(/^Se creó la cuenta de (.+?) \((.+?)\) con perfil de (.+?)\.$/)
    if (mCuenta) {
      const [, nombre, correo, rol] = mCuenta
      if (esEn) {
        return `Account created for ${nombre} (${correo}) with ${traducirRolTexto(rol)} profile.`
      }
      return descripcion
    }

    // Limpieza de memoria: "El administrador X limpió el buffer de logs en tiempo real. Los registros históricos de auditoría en BD se mantienen intactos."
    const mLimpieza = descripcion.match(/^El administrador (.+?) limpió el buffer de logs en tiempo real\. Los registros históricos de auditoría en BD se mantienen intactos\.$/)
    if (mLimpieza) {
      const [, admin] = mLimpieza
      if (esEn) {
        return `Administrator ${admin} cleared the real-time logs buffer. Database audit history remains intact.`
      }
      return descripcion
    }

    // Operación exitosa: "Operación realizada exitosamente por X."
    const mOp = descripcion.match(/^Operación realizada exitosamente por (.+?)\.$/)
    if (mOp) {
      const [, usuario] = mOp
      if (esEn) {
        return `Operation performed successfully by ${usuario}.`
      }
      return descripcion
    }

    // 3. Reemplazos de palabras y estados comunes si no hubo coincidencia completa
    if (esEn) {
      return descripcion
        .replace(/POR_HACER|Por hacer/gi, 'To do')
        .replace(/EN_PROGRESO|En progreso/gi, 'In progress')
        .replace(/EN_REVISION|En revisión/gi, 'In review')
        .replace(/COMPLETADA|Completada/gi, 'Completed')
        .replace(/BLOQUEADA|Bloqueada/gi, 'Blocked')
        .replace(/LISTO_PARA_VENTA|Listo para venta/gi, 'Ready for sale')
        .replace(/GERMINANDO|Germinando/gi, 'Germinating')
        .replace(/CRECIENDO|Creciendo/gi, 'Growing')
        .replace(/DESCARTADO|Descartado/gi, 'Discarded')
        .replace(/EN_PREPARACION|En preparación/gi, 'In preparation')
        .replace(/PENDIENTE|Pendiente/gi, 'Pending')
        .replace(/ENVIADO|Enviado/gi, 'Shipped')
        .replace(/ENTREGADO|Entregado/gi, 'Delivered')
        .replace(/CANCELADO|Cancelado/gi, 'Cancelled')
    }

    return descripcion
      .replace(/POR_HACER/g, 'Por hacer')
      .replace(/EN_PROGRESO/g, 'En progreso')
      .replace(/EN_REVISION/g, 'En revisión')
      .replace(/COMPLETADA/g, 'Completada')
      .replace(/BLOQUEADA/g, 'Bloqueada')
      .replace(/LISTO_PARA_VENTA/g, 'Listo para venta')
      .replace(/GERMINANDO/g, 'Germinando')
      .replace(/CRECIENDO/g, 'Creciendo')
      .replace(/DESCARTADO/g, 'Descartado')
      .replace(/EN_PREPARACION/g, 'En preparación')
  }

  /**
   * Convierte el título de una acción a un identificador técnico en mayúsculas para la consola.
   */
  const codigoTecnicoAccion = (item) => {
    if (!item?.accion) return 'SYSTEM_ACTION'
    return item.accion
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_|_$/g, '')
  }

  /**
   * Calcula cuántos filtros se encuentran activos actualmente para mostrarlo como indicador.
   */
  const cantidadFiltrosActivos = useMemo(() => {
    let total = 0
    if (filtros.modulo) total += 1
    if (filtros.nivel) total += 1
    if (filtros.busqueda.trim()) total += 1
    return total
  }, [filtros])

  /**
   * Filtra únicamente las acciones que se hacen en el sistema (excluyendo trazas internas de arranque)
   * y aplica los criterios de área, estado y búsqueda.
   */
  const accionesFiltradas = useMemo(() => {
    const soloAcciones = (resumen.logs || []).filter(item => item.origen !== 'MOTOR_SISTEMA')
    const q = filtros.busqueda.trim().toLowerCase()
    const modFiltro = filtros.modulo.toUpperCase()
    const nivFiltro = filtros.nivel.toUpperCase()

    return soloAcciones.filter(item => {
      const mod = (item.modulo || '').toUpperCase()
      if (modFiltro) {
        if (modFiltro === 'USUARIOS' && mod !== 'USUARIOS' && mod !== 'AUTH') return false
        if (modFiltro === 'LOTES' && mod !== 'LOTES' && mod !== 'ZONAS' && mod !== 'PROVEEDORES') return false
        if (modFiltro === 'PEDIDOS' && mod !== 'PEDIDOS' && mod !== 'CARRITO') return false
        if (!['USUARIOS', 'LOTES', 'PEDIDOS'].includes(modFiltro) && mod !== modFiltro) return false
      }

      if (nivFiltro && (item.nivel || '').toUpperCase() !== nivFiltro) {
        return false
      }

      if (!q) return true
      return (
        humanizarTitulo(item.accion).toLowerCase().includes(q) ||
        humanizarDescripcion(item.descripcion).toLowerCase().includes(q) ||
        (item.usuario || '').toLowerCase().includes(q) ||
        (item.endpoint || '').toLowerCase().includes(q) ||
        (item.id || '').toLowerCase().includes(q)
      )
    })
  }, [resumen.logs, filtros])

  const totalPaginas = Math.ceil(accionesFiltradas.length / ITEMS_POR_PAGINA)
  const accionesPaginadas = accionesFiltradas.slice(
    paginaActual * ITEMS_POR_PAGINA,
    (paginaActual + 1) * ITEMS_POR_PAGINA
  )

  /**
   * Formatea una fecha ISO a formato técnico exacto (YYYY-MM-DD HH:mm:ss) para exportación CSV.
   */
  const formatearFechaTecnica = (isoString) => {
    if (!isoString) return '0000-00-00 00:00:00'
    const f = new Date(isoString)
    if (isNaN(f.getTime())) return isoString.replace('T', ' ').slice(0, 19)
    const pad = (n) => String(n).padStart(2, '0')
    return `${f.getFullYear()}-${pad(f.getMonth() + 1)}-${pad(f.getDate())} ${pad(f.getHours())}:${pad(f.getMinutes())}:${pad(f.getSeconds())}`
  }

  /**
   * Formatea la fecha de manera amigable ("Hace 5 min", "Ayer") para la tabla de actividades.
   */
  /**
   * Formatea la fecha de manera amigable ("Hace 5 min", "Ayer") respetando el idioma activo.
   *
   * @param {string} isoString - Fecha en formato ISO.
   * @returns {{ relativo: string, completa: string }} Fecha amigable relativa y completa.
   */
  const formatearTiempoAmigable = (isoString) => {
    if (!isoString) return { relativo: t('admin.logs.recent', 'Reciente'), completa: '' }
    const fecha = new Date(isoString)
    if (isNaN(fecha.getTime())) {
      return { relativo: isoString.slice(0, 10), completa: isoString.slice(11, 16) }
    }
    const diffSeg = Math.floor((new Date() - fecha) / 1000)
    let relativo
    const esEn = language === 'en'
    if (diffSeg < 60) {
      relativo = t('admin.logs.justNow', 'Hace unos segundos')
    } else if (diffSeg < 3600) {
      const min = Math.floor(diffSeg / 60)
      relativo = esEn ? `${min} min ago` : `Hace ${min} min`
    } else if (diffSeg < 86400) {
      const h = Math.floor(diffSeg / 3600)
      relativo = esEn ? `${h} h ago` : `Hace ${h} h`
    } else {
      const dias = Math.floor(diffSeg / 86400)
      if (dias === 1) {
        relativo = t('admin.logs.yesterday', 'Ayer')
      } else if (dias < 30) {
        relativo = esEn ? `${dias} days ago` : `Hace ${dias} días`
      } else {
        relativo = fecha.toLocaleDateString(esEn ? 'en-US' : 'es-CO')
      }
    }
    const completa = fecha.toLocaleString(esEn ? 'en-US' : 'es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
    return { relativo, completa }
  }

  /**
   * Configuración visual amigable por área funcional adaptada al idioma activo.
   *
   * @param {string} modulo - Módulo funcional del sistema.
   * @param {string} nivel - Nivel de severidad de la acción.
   * @returns {object} Configuración con nombre, icono y estilos de badge.
   */
  const obtenerConfigArea = (modulo, nivel) => {
    const esAviso = nivel === 'WARN' || nivel === 'ERROR'
    switch ((modulo || '').toUpperCase()) {
      case 'PEDIDOS':
      case 'CARRITO':
        return {
          nombre: t('admin.logs.catOrders', 'Pedidos y Ventas'),
          icono: ShoppingBag,
          colorIcono: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
          badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
        }
      case 'TAREAS':
        return {
          nombre: t('admin.logs.catTasks', 'Tareas del Vivero'),
          icono: Kanban,
          colorIcono: esAviso
            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50'
            : 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/50',
          badge: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
        }
      case 'LOTES':
      case 'ZONAS':
      case 'PROVEEDORES':
        return {
          nombre: t('admin.logs.catBatches', 'Lotes y Cultivos'),
          icono: Sprout,
          colorIcono: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
          badge: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
        }
      case 'MERMAS':
        return {
          nombre: t('admin.logs.catWaste', 'Mermas'),
          icono: AlertTriangle,
          colorIcono: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
          badge: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
        }
      case 'PRODUCTOS':
        return {
          nombre: t('admin.logs.catInventory', 'Inventario'),
          icono: Package,
          colorIcono: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50',
          badge: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300'
        }
      case 'USUARIOS':
      case 'AUTH':
        return {
          nombre: t('admin.logs.catUsers', 'Usuarios y Accesos'),
          icono: Users,
          colorIcono: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50',
          badge: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
        }
      case 'BACKUP':
        return {
          nombre: t('admin.logs.catBackup', 'Copias de Seguridad'),
          icono: DatabaseBackup,
          colorIcono: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50',
          badge: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
        }
      default:
        return {
          nombre: t('admin.logs.catSystem', 'Sistema'),
          icono: ScrollText,
          colorIcono: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700',
          badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
        }
    }
  }

  /**
   * Etiqueta amigable e internacionalizada del rol del actor.
   *
   * @param {string} rol - Rol del usuario en mayúsculas.
   * @returns {object} Texto del rol, icono descriptivo y clases Tailwind.
   */
  const obtenerBadgeRol = (rol) => {
    const r = (rol || '').toUpperCase()
    if (r === 'ADMINISTRADOR') {
      return {
        texto: t('admin.logs.roleAdmin', 'Administrador'),
        icono: <Shield size={12} />,
        clase: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
      }
    }
    if (r === 'TRABAJADOR') {
      return {
        texto: t('admin.logs.roleWorker', 'Trabajador'),
        icono: <HardHat size={12} />,
        clase: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
      }
    }
    if (r === 'CLIENTE') {
      return {
        texto: t('admin.logs.roleCustomer', 'Cliente'),
        icono: <User size={12} />,
        clase: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
      }
    }
    return {
      texto: t('admin.logs.roleSystem', 'Sistema'),
      icono: <User size={12} />,
      clase: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
    }
  }

  /**
   * Exporta las acciones filtradas a un archivo CSV.
   */
  const handleExportarCSV = () => {
    if (!accionesFiltradas.length) return

    const cabeceras = ['ID', 'Fecha_Hora', 'Nivel', 'Modulo', 'Accion', 'Usuario', 'Rol', 'Metodo_HTTP', 'Endpoint', 'Codigo_HTTP', 'Duracion_ms', 'Origen', 'Descripcion']
    const escapar = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`

    const filas = accionesFiltradas.map(l => [
      escapar(l.id),
      escapar(formatearFechaTecnica(l.fechaHora)),
      escapar(l.nivel),
      escapar(l.modulo),
      escapar(humanizarTitulo(l.accion)),
      escapar(l.usuario),
      escapar(l.rol),
      escapar(l.metodoHttp),
      escapar(l.endpoint),
      escapar(l.codigoEstado ?? 200),
      escapar(l.duracionMs ?? 0),
      escapar(l.origen),
      escapar(humanizarDescripcion(l.descripcion))
    ].join(','))

    const contenido = '\uFEFF' + [cabeceras.join(','), ...filas].join('\n')
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `plantopolis_acciones_sistema_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Encabezado y barra de herramientas superior */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 rounded-2xl text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-sm">
            <ScrollText size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {t('admin.logs.title', 'Logs y Acciones del Sistema')}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {t('admin.logs.subtitle', 'Consulta de forma clara y ordenada las acciones realizadas en el sistema.')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Botón Auto-Refresh en vivo */}
          <button
            type="button"
            onClick={() => setAutoRefresh(prev => !prev)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
              autoRefresh
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
            {autoRefresh ? t('admin.logs.liveActive', 'En vivo (8s)') : t('admin.logs.livePaused', 'Auto-refresco')}
          </button>

          {/* Botón Actualizar */}
          <button
            type="button"
            onClick={() => cargarLogs(false)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCcw size={14} className={loading ? 'animate-spin text-cyan-500' : ''} />
            {t('admin.logs.refreshBtn', 'Actualizar')}
          </button>

          {/* Botón Exportar CSV */}
          <button
            type="button"
            onClick={handleExportarCSV}
            disabled={!accionesFiltradas.length}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Download size={14} />
            {t('admin.logs.exportCsv', 'Exportar CSV')}
          </button>

          {/* Botón Limpiar Memoria */}
          <button
            type="button"
            onClick={handleLimpiarMemoria}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 transition-colors flex items-center gap-1.5"
          >
            <Trash2 size={14} />
            {t('admin.logs.clearMemoryBtn', 'Limpiar Memoria')}
          </button>
        </div>
      </div>

      <FlashMessage mensaje={mensaje} />

      {/* Sección Colapsable de Métricas / Resumen de Acciones (KPIs) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {t('admin.logs.summaryTitle', 'Resumen de Acciones')}
          </span>
          <button
            type="button"
            onClick={() => setMostrarResumenAcciones(prev => !prev)}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 flex items-center gap-1 transition-colors"
          >
            {mostrarResumenAcciones ? t('admin.logs.hideActions', 'Ocultar acciones') : t('admin.logs.showActions', 'Mostrar acciones')}
            {mostrarResumenAcciones ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </div>

        {mostrarResumenAcciones && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {t('admin.logs.kpiTotalTitle', 'Total Acciones')}
                </p>
                <p className="text-3xl font-black text-slate-800 dark:text-white mt-1 font-mono">
                  {accionesFiltradas.length}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t('admin.logs.kpiTotalSub', 'Acciones realizadas en el sistema')}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                <Activity size={26} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  {t('admin.logs.kpiSuccessTitle', 'Acciones Exitosas')}
                </p>
                <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
                  {accionesFiltradas.filter(x => x.nivel === 'SUCCESS' || x.nivel === 'INFO').length}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t('admin.logs.kpiSuccessSub', 'Operaciones completadas sin novedad')}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={26} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  {t('admin.logs.kpiWarnTitle', 'Avisos / Atención')}
                </p>
                <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-1 font-mono">
                  {accionesFiltradas.filter(x => x.nivel === 'WARN').length}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t('admin.logs.kpiWarnSub', 'Mermas, bloqueos o desactivaciones')}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle size={26} />
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                  {t('admin.logs.kpiErrorTitle', 'Errores / Fallos')}
                </p>
                <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1 font-mono">
                  {accionesFiltradas.filter(x => x.nivel === 'ERROR').length}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t('admin.logs.kpiErrorSub', 'Operaciones rechazadas o con fallo')}
                </p>
              </div>
              <div className="p-3.5 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400">
                <XCircle size={26} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN COLAPSABLE DE FILTROS */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div
          onClick={() => setMostrarFiltros(prev => !prev)}
          className="px-4 py-3 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-teal-600 dark:text-teal-400" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              {t('admin.logs.filtersTitle', 'Filtros de Búsqueda y Área')}
            </span>
            {cantidadFiltrosActivos > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-500/15 text-teal-700 dark:text-teal-300">
                {cantidadFiltrosActivos === 1
                  ? t('admin.logs.activeFilter', '{count} filtro activo').replace('{count}', cantidadFiltrosActivos)
                  : t('admin.logs.activeFilters', '{count} filtros activos').replace('{count}', cantidadFiltrosActivos)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {cantidadFiltrosActivos > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  limpiarFiltros()
                }}
                className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {t('admin.logs.clearFilters', 'Limpiar filtros')}
              </button>
            )}
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              {mostrarFiltros ? t('admin.logs.hide', 'Ocultar') : t('admin.logs.show', 'Mostrar')}
              {mostrarFiltros ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </span>
          </div>
        </div>

        {mostrarFiltros && (
          <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mr-1">
                {t('admin.logs.areaLabel', 'Área:')}
              </span>
              {CATEGORIAS.map(cat => {
                const Icon = cat.icono
                const activa = filtros.modulo === cat.valor
                return (
                  <button
                    key={cat.valor}
                    type="button"
                    onClick={() => handleFiltro('modulo', cat.valor)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      activa
                        ? 'bg-teal-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <Icon size={14} />
                    {cat.label}
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center pt-1">
              <div className="md:col-span-8 relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={filtros.busqueda}
                  onChange={e => handleFiltro('busqueda', e.target.value)}
                  placeholder={t('admin.logs.searchPlaceholderInput', 'Buscar por acción, persona o descripción (ej. tarea, lote, pedido, usuario)...')}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="md:col-span-3">
                <select
                  value={filtros.nivel}
                  onChange={e => handleFiltro('nivel', e.target.value)}
                  className="w-full px-3 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">{t('admin.logs.allStatuses', 'Todos los estados')}</option>
                  <option value="SUCCESS">{t('admin.logs.statusSuccess', 'Exitosas (SUCCESS)')}</option>
                  <option value="INFO">{t('admin.logs.statusInfo', 'Informativas (INFO)')}</option>
                  <option value="WARN">{t('admin.logs.statusWarn', 'Avisos / Atención (WARN)')}</option>
                  <option value="ERROR">{t('admin.logs.statusError', 'Errores (ERROR)')}</option>
                </select>
              </div>

              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={limpiarFiltros}
                  className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  {t('admin.logs.clearBtn', 'Limpiar')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TABLA DE ACCIONES DEL SISTEMA */}
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {t('admin.logs.showingActions', 'Mostrando {count} de {total} acciones realizadas en el sistema')
              .replace('{count}', accionesPaginadas.length)
              .replace('{total}', accionesFiltradas.length)}
          </span>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Clock size={13} />
            {t('admin.logs.rowClickHint', 'Haz clic en cualquier fila para ver el detalle')}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <th className="py-3.5 px-5">{t('admin.logs.thDateTime', 'Fecha y Hora')}</th>
                <th className="py-3.5 px-4">{t('admin.logs.thArea', 'Área')}</th>
                <th className="py-3.5 px-4">{t('admin.logs.thAction', 'Acción Realizada en el Sistema')}</th>
                <th className="py-3.5 px-4">{t('admin.logs.thActor', 'Realizado por')}</th>
                <th className="py-3.5 px-4">{t('admin.logs.thStatus', 'Estado')}</th>
                <th className="py-3.5 px-5 text-right">{t('admin.logs.thDetail', 'Detalle')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <RefreshCcw size={26} className="animate-spin mx-auto mb-2 text-cyan-500" />
                    {t('admin.logs.loading', 'Cargando acciones del sistema...')}
                  </td>
                </tr>
              ) : accionesPaginadas.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    {t('admin.logs.empty', 'No se encontraron acciones con los filtros seleccionados.')}
                  </td>
                </tr>
              ) : (
                accionesPaginadas.map(item => {
                  const area = obtenerConfigArea(item.modulo, item.nivel)
                  const AreaIcon = area.icono
                  const rolInfo = obtenerBadgeRol(item.rol)
                  const tiempo = formatearTiempoAmigable(item.fechaHora)
                  const esError = item.nivel === 'ERROR'
                  const esAviso = item.nivel === 'WARN'

                  return (
                    <tr
                      key={item.id}
                      onClick={() => setEventoSeleccionado(item)}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      {/* Fecha y Hora */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {tiempo.relativo}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {tiempo.completa}
                        </div>
                      </td>

                      {/* Área */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold ${area.badge}`}>
                          <AreaIcon size={14} />
                          {area.nombre}
                        </span>
                      </td>

                      {/* Acción Realizada */}
                      <td className="py-3.5 px-4 max-w-md">
                        <div className="font-bold text-slate-800 dark:text-white text-sm">
                          {humanizarTitulo(item.accion)}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-2">
                          {humanizarDescripcion(item.descripcion)}
                        </p>
                      </td>

                      {/* Realizado por */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {item.usuario || t('admin.logs.roleSystem', 'Sistema')}
                        </div>
                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold ${rolInfo.clase}`}>
                          {rolInfo.icono}
                          {rolInfo.texto}
                        </span>
                      </td>

                      {/* Estado amigable */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {esError ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60">
                            <XCircle size={13} />
                            {t('admin.logs.badgeFailed', 'Falló')}
                          </span>
                        ) : esAviso ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                            <AlertTriangle size={13} />
                            {t('admin.logs.badgeWarning', 'Atención')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                            <CheckCircle2 size={13} />
                            {t('admin.logs.badgeCompleted', 'Completada')}
                          </span>
                        )}
                      </td>

                      {/* Botón Detalle */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setEventoSeleccionado(item)
                          }}
                          className="p-2 rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title={t('admin.logs.viewDetailsTooltip', 'Ver detalles')}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        currentPage={paginaActual}
        totalPages={totalPaginas}
        onPageChange={(nuevaPagina) => setPaginaActual(nuevaPagina)}
      />

      {/* Modal de Detalle de la Acción */}
      {eventoSeleccionado && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setEventoSeleccionado(null)}
        >
          <div
            className="bg-white dark:bg-[#111827] rounded-3xl p-6 max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/15 text-cyan-600 dark:text-cyan-400">
                  <ScrollText size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white">
                    {humanizarTitulo(eventoSeleccionado.accion)}
                  </h3>
                  <p className="text-xs font-mono text-slate-400">
                    ID: {eventoSeleccionado.id} • {formatearFechaTecnica(eventoSeleccionado.fechaHora)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEventoSeleccionado(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-600 dark:text-cyan-400">
                {t('admin.logs.modalActionDesc', 'Descripción de la acción')}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {humanizarDescripcion(eventoSeleccionado.descripcion)}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px]">
                  {t('admin.logs.modalPerformedBy', 'Realizado por')}
                </span>
                <span className="font-bold text-slate-800 dark:text-white break-all">
                  {eventoSeleccionado.usuario || t('admin.logs.roleSystem', 'Sistema')}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px]">
                  {t('admin.logs.modalRole', 'Rol / Perfil')}
                </span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {obtenerBadgeRol(eventoSeleccionado.rol).texto}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px]">
                  {t('admin.logs.modalArea', 'Área')}
                </span>
                <span className="font-bold text-slate-800 dark:text-white">
                  {obtenerConfigArea(eventoSeleccionado.modulo, eventoSeleccionado.nivel).nombre}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px]">
                  {t('admin.logs.modalTechnicalLevel', 'Nivel Técnico')}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">
                  {eventoSeleccionado.nivel} ({eventoSeleccionado.origen})
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px]">
                  {t('admin.logs.modalEndpoint', 'Endpoint / Ruta')}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-white break-all">
                  {eventoSeleccionado.metodoHttp} {eventoSeleccionado.endpoint || '—'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 block mb-1 font-bold uppercase text-[10px]">
                  {t('admin.logs.modalHttpStatusLatency', 'Estado HTTP / Latencia')}
                </span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">
                  HTTP {eventoSeleccionado.codigoEstado ?? 200}
                  {eventoSeleccionado.duracionMs != null ? ` • ${eventoSeleccionado.duracionMs} ms` : ''}
                </span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setEventoSeleccionado(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
              >
                {t('common.close', 'Cerrar')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
