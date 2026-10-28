import React from 'react'
import {
  Home,
  Trees,
  Sun,
  Flower2,
  Sprout,
  Package,
  Layers,
  Leaf,
  LayoutGrid
} from 'lucide-react'

/**
 * @typedef {Object} CategoryVisualConfig
 * @property {React.ComponentType} Icon - Componente de icono Lucide asociado.
 * @property {string} colorClass - Clases Tailwind de color del icono.
 * @property {string} badgeBgClass - Clases de fondo y borde para badges individuales.
 * @property {string} activeChipClass - Clases de estilo cuando el botón de filtro está activo.
 * @property {string} chipBorderHover - Clases de borde y sombra en hover para el botón.
 */

/**
 * Mapeo visual centralizado de las categorías botánicas y operativas del vivero.
 * Permite mantener coherencia visual entre la barra de navegación de categorías
 * y las insignias (badges) en la esquina superior de cada tarjeta de producto.
 */
const CATEGORY_MAP = {
  interior: {
    Icon: Home,
    colorClass: 'text-blue-500 dark:text-blue-400',
    badgeBgClass: 'bg-blue-50/90 dark:bg-blue-950/60 border-blue-200/80 dark:border-blue-800/80',
    activeChipClass: 'bg-blue-600 text-white shadow-blue-600/30 border-blue-600',
    chipBorderHover: 'hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/30'
  },
  exterior: {
    Icon: Trees,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeBgClass: 'bg-emerald-50/90 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/80',
    activeChipClass: 'bg-emerald-600 text-white shadow-emerald-600/30 border-emerald-600',
    chipBorderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
  },
  suculenta: {
    Icon: Sun,
    colorClass: 'text-amber-500 dark:text-amber-400',
    badgeBgClass: 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/80',
    activeChipClass: 'bg-amber-500 text-white shadow-amber-500/30 border-amber-500',
    chipBorderHover: 'hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
  },
  cactus: {
    Icon: Sun,
    colorClass: 'text-amber-500 dark:text-amber-400',
    badgeBgClass: 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/80',
    activeChipClass: 'bg-amber-500 text-white shadow-amber-500/30 border-amber-500',
    chipBorderHover: 'hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
  },
  flor: {
    Icon: Flower2,
    colorClass: 'text-rose-500 dark:text-rose-400',
    badgeBgClass: 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/80',
    activeChipClass: 'bg-rose-500 text-white shadow-rose-500/30 border-rose-500',
    chipBorderHover: 'hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
  },
  orquidea: {
    Icon: Flower2,
    colorClass: 'text-rose-500 dark:text-rose-400',
    badgeBgClass: 'bg-rose-50/90 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/80',
    activeChipClass: 'bg-rose-500 text-white shadow-rose-500/30 border-rose-500',
    chipBorderHover: 'hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50/50 dark:hover:bg-rose-950/30'
  },
  huerto: {
    Icon: Sprout,
    colorClass: 'text-lime-600 dark:text-lime-400',
    badgeBgClass: 'bg-lime-50/90 dark:bg-lime-950/60 border-lime-200/80 dark:border-lime-800/80',
    activeChipClass: 'bg-lime-600 text-white shadow-lime-600/30 border-lime-600',
    chipBorderHover: 'hover:border-lime-300 dark:hover:border-lime-700 hover:bg-lime-50/50 dark:hover:bg-lime-950/30'
  },
  aromatica: {
    Icon: Sprout,
    colorClass: 'text-lime-600 dark:text-lime-400',
    badgeBgClass: 'bg-lime-50/90 dark:bg-lime-950/60 border-lime-200/80 dark:border-lime-800/80',
    activeChipClass: 'bg-lime-600 text-white shadow-lime-600/30 border-lime-600',
    chipBorderHover: 'hover:border-lime-300 dark:hover:border-lime-700 hover:bg-lime-50/50 dark:hover:bg-lime-950/30'
  },
  maceta: {
    Icon: Package,
    colorClass: 'text-orange-500 dark:text-orange-400',
    badgeBgClass: 'bg-orange-50/90 dark:bg-orange-950/60 border-orange-200/80 dark:border-orange-800/80',
    activeChipClass: 'bg-orange-500 text-white shadow-orange-500/30 border-orange-500',
    chipBorderHover: 'hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/30'
  },
  accesorio: {
    Icon: Package,
    colorClass: 'text-orange-500 dark:text-orange-400',
    badgeBgClass: 'bg-orange-50/90 dark:bg-orange-950/60 border-orange-200/80 dark:border-orange-800/80',
    activeChipClass: 'bg-orange-500 text-white shadow-orange-500/30 border-orange-500',
    chipBorderHover: 'hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50/50 dark:hover:bg-orange-950/30'
  },
  sustrato: {
    Icon: Layers,
    colorClass: 'text-amber-800 dark:text-amber-300',
    badgeBgClass: 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-300/80 dark:border-amber-800/80',
    activeChipClass: 'bg-amber-800 text-white shadow-amber-800/30 border-amber-800',
    chipBorderHover: 'hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
  },
  abono: {
    Icon: Layers,
    colorClass: 'text-amber-800 dark:text-amber-300',
    badgeBgClass: 'bg-amber-50/90 dark:bg-amber-950/60 border-amber-300/80 dark:border-amber-800/80',
    activeChipClass: 'bg-amber-800 text-white shadow-amber-800/30 border-amber-800',
    chipBorderHover: 'hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-amber-950/30'
  }
}

/** Configuración fallback por defecto para plantas o categorías no específicas */
const DEFAULT_VISUAL = {
  Icon: Leaf,
  colorClass: 'text-green-600 dark:text-green-400',
  badgeBgClass: 'bg-green-50/90 dark:bg-green-950/60 border-green-200/80 dark:border-green-800/80',
  activeChipClass: 'bg-green-600 text-white shadow-green-600/30 border-green-600',
  chipBorderHover: 'hover:border-green-300 dark:hover:border-green-700 hover:bg-green-50/50 dark:hover:bg-green-950/30'
}

/** Configuración para la opción 'Todas las categorías' */
export const ALL_CATEGORIES_VISUAL = {
  Icon: LayoutGrid,
  colorClass: 'text-emerald-600 dark:text-emerald-400',
  badgeBgClass: 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
  activeChipClass: 'bg-emerald-600 text-white shadow-emerald-600/30 border-emerald-600',
  chipBorderHover: 'hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30'
}

/**
 * Normaliza una cadena de texto eliminando tildes y caracteres especiales para búsquedas seguras.
 * @param {string} str - Texto a normalizar.
 * @returns {string} Texto sin tildes en minúsculas.
 */
function normalizarTexto(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Obtiene la configuración visual (icono y colores Tailwind) correspondiente a una categoría.
 * 
 * @param {string|null|undefined} nombreCategoria - Nombre de la categoría a consultar.
 * @returns {CategoryVisualConfig} Configuración visual con icono y clases de color.
 */
export function getCategoryVisual(nombreCategoria) {
  const norm = normalizarTexto(nombreCategoria)

  if (norm.includes('interior')) return CATEGORY_MAP.interior
  if (norm.includes('exterior')) return CATEGORY_MAP.exterior
  if (norm.includes('suculenta')) return CATEGORY_MAP.suculenta
  if (norm.includes('cactus')) return CATEGORY_MAP.cactus
  if (norm.includes('orquidea') || norm.includes('flor')) return CATEGORY_MAP.flor
  if (norm.includes('huerto') || norm.includes('aromat')) return CATEGORY_MAP.huerto
  if (norm.includes('maceta') || norm.includes('accesorio') || norm.includes('insumo')) return CATEGORY_MAP.maceta
  if (norm.includes('sustrato') || norm.includes('abono') || norm.includes('tierra')) return CATEGORY_MAP.sustrato

  return DEFAULT_VISUAL
}
