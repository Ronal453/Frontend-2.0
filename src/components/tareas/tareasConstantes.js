/**
 * Constantes y definiciones compartidas para el módulo de Tareas y Tablero Kanban en Plantopolis.
 * Alineado con las máquinas de estado y reglas de negocio del Backend (HU22 - HU30).
 */
import {
  ClipboardList,
  Hourglass,
  Search,
  CheckCircle2,
  Lock,
  Droplet,
  Scissors,
  Sparkles,
  Wheat,
  Bug,
  MoveRight,
  Wrench,
  HelpCircle
} from 'lucide-react'

/**
 * Definición visual y funcional de las 5 columnas del tablero Kanban.
 * Incluye colores de cabecera, borde y badges acordes al tema claro y oscuro.
 */
export const COLUMNAS_KANBAN = [
  {
    id: 'POR_HACER',
    titulo: 'Por Hacer',
    icono: ClipboardList,
    colorBorde: 'border-slate-300 dark:border-slate-700',
    colorHeader: 'bg-slate-100/70 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300',
    colorBadge: 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200',
  },
  {
    id: 'EN_PROGRESO',
    titulo: 'En Progreso',
    icono: Hourglass,
    colorBorde: 'border-blue-300 dark:border-blue-700',
    colorHeader: 'bg-blue-50/70 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
    colorBadge: 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200',
  },
  {
    id: 'EN_REVISION',
    titulo: 'En Revisión',
    icono: Search,
    colorBorde: 'border-purple-300 dark:border-purple-700',
    colorHeader: 'bg-purple-50/70 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300',
    colorBadge: 'bg-purple-100 dark:bg-purple-800 text-purple-800 dark:text-purple-200',
  },
  {
    id: 'BLOQUEADA',
    titulo: 'Bloqueada',
    icono: Lock,
    colorBorde: 'border-amber-300 dark:border-amber-700',
    colorHeader: 'bg-amber-50/70 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300',
    colorBadge: 'bg-amber-100 dark:bg-amber-800 text-amber-900 dark:text-amber-200',
  },
  {
    id: 'COMPLETADA',
    titulo: 'Completada',
    icono: CheckCircle2,
    colorBorde: 'border-emerald-300 dark:border-emerald-700',
    colorHeader: 'bg-emerald-50/70 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300',
    colorBadge: 'bg-emerald-100 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-200',
  },
]

/**
 * Matriz estricta de transiciones válidas de la máquina de estados.
 * Corresponde 1:1 con EstadoTarea.java del Backend:
 * - COMPLETADA es estado terminal (no puede moverse a ningún otro).
 * - Se permite retroceso de un paso entre estados activos.
 * - BLOQUEADA puede ingresar desde cualquier estado no terminal y regresar a POR_HACER o EN_PROGRESO.
 */
export const DESTINOS_VALIDOS = {
  POR_HACER: ['EN_PROGRESO', 'BLOQUEADA'],
  EN_PROGRESO: ['POR_HACER', 'EN_REVISION', 'BLOQUEADA'],
  EN_REVISION: ['EN_PROGRESO', 'COMPLETADA', 'BLOQUEADA'],
  BLOQUEADA: ['POR_HACER', 'EN_PROGRESO'],
  COMPLETADA: [],
}

/**
 * Verifica si es válida la transición entre un estado origen y un estado destino.
 *
 * @param {string} origen - Estado actual
 * @param {string} destino - Estado deseado
 * @returns {boolean} True si la transición está permitida
 */
export const esTransicionValida = (origen, destino) => {
  if (!origen || !destino || origen === destino) return false
  const permitidos = DESTINOS_VALIDOS[origen] || []
  return permitidos.includes(destino)
}

/**
 * Estilos y etiquetas para los niveles de prioridad de las tareas.
 */
export const PRIORIDAD_CONFIG = {
  ALTA: {
    label: 'Alta',
    badge: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/60',
    punto: 'bg-red-500',
  },
  MEDIA: {
    label: 'Media',
    badge: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60',
    punto: 'bg-amber-500',
  },
  BAJA: {
    label: 'Baja',
    badge: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60',
    punto: 'bg-emerald-500',
  },
}

/**
 * Metadatos para los tipos de tareas botánicas y operativas del vivero.
 */
export const TIPOS_TAREA = [
  { id: 'RIEGO', label: 'Riego', icono: Droplet, color: 'text-sky-500' },
  { id: 'PODA', label: 'Poda', icono: Scissors, color: 'text-rose-500' },
  { id: 'FERTILIZACION', label: 'Fertilización', icono: Sparkles, color: 'text-indigo-500' },
  { id: 'COSECHA', label: 'Cosecha', icono: Wheat, color: 'text-amber-500' },
  { id: 'MONITOREO_PLAGAS', label: 'Monitoreo de Plagas', icono: Bug, color: 'text-red-500' },
  { id: 'TRASPLANTE', label: 'Trasplante', icono: MoveRight, color: 'text-emerald-500' },
  { id: 'MANTENIMIENTO', label: 'Mantenimiento', icono: Wrench, color: 'text-slate-500' },
  { id: 'OTRO', label: 'Otro', icono: HelpCircle, color: 'text-slate-400' },
]

/**
 * Periodicidades disponibles para tareas recurrentes (HU23).
 */
export const PERIODICIDADES = [
  { id: 'DIARIA', label: 'Diaria' },
  { id: 'SEMANAL', label: 'Semanal' },
  { id: 'QUINCENAL', label: 'Quincenal' },
  { id: 'MENSUAL', label: 'Mensual' },
]

export const DIAS_SEMANA = [
  { id: 'LUNES', label: 'Lunes' },
  { id: 'MARTES', label: 'Martes' },
  { id: 'MIERCOLES', label: 'Miércoles' },
  { id: 'JUEVES', label: 'Jueves' },
  { id: 'VIERNES', label: 'Viernes' },
  { id: 'SABADO', label: 'Sábado' },
  { id: 'DOMINGO', label: 'Domingo' },
]

/**
 * Formatea de forma segura cualquier representación de fecha proveniente de la API
 * (String ISO, arreglo numérico de Jackson [año, mes, día] u objeto).
 *
 * @param {string|Array|Object|null} fecha - Valor de fecha a formatear
 * @param {string} [fallback='Sin fecha'] - Texto a mostrar si la fecha no está presente
 * @returns {string} Fecha formateada en YYYY-MM-DD
 */
export const formatFecha = (fecha, fallback = 'Sin fecha') => {
  if (!fecha) return fallback
  if (typeof fecha === 'string') return fecha.split('T')[0]
  if (Array.isArray(fecha)) {
    const [y, m, d] = fecha
    return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  }
  if (typeof fecha === 'object' && fecha.year) {
    return `${fecha.year}-${String(fecha.monthValue || fecha.month).padStart(2, '0')}-${String(fecha.dayOfMonth || fecha.day).padStart(2, '0')}`
  }
  return String(fecha)
}

/**
 * Extrae y separa de forma segura el título y la descripción u observaciones operativas
 * a partir del campo compuesto 'descripcion' almacenado en base de datos ("Título - Descripción").
 * Permite mantener compatibilidad con tareas creadas con título explícito o con solo descripción/tipo.
 *
 * @param {Object} item - Objeto de tarea o regla recurrente
 * @param {string} [fallbackLabel=''] - Etiqueta o tipo de tarea a utilizar como título por defecto
 * @returns {{ titulo: string, descripcion: string }} Objeto con título y descripción claramente diferenciados
 */
export const extraerTituloYDescripcion = (item, fallbackLabel = '') => {
  if (!item) return { titulo: fallbackLabel, descripcion: '' }

  // Si el objeto ya tiene título y descripción desacoplados
  if (item.titulo && item.descripcion) {
    return {
      titulo: item.titulo.trim(),
      descripcion: item.descripcion.trim()
    }
  }

  const rawDesc = item.descripcion || item.titulo || ''

  // Formato compuesto estándar: "Título - Observaciones adicionales"
  if (rawDesc.includes(' - ')) {
    const partes = rawDesc.split(' - ')
    return {
      titulo: partes[0].trim(),
      descripcion: partes.slice(1).join(' - ').trim()
    }
  }

  // Si solo contiene texto sin separador, se asume como título principal
  if (rawDesc.trim()) {
    return {
      titulo: rawDesc.trim(),
      descripcion: ''
    }
  }

  // Respaldo basado en el tipo de actividad si no existe descripción previa
  const tipoLegible = item.tipoTarea ? item.tipoTarea.replace(/_/g, ' ') : fallbackLabel
  return {
    titulo: tipoLegible || fallbackLabel,
    descripcion: ''
  }
}

