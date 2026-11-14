/**
 * Utilidades para manejo, optimización y normalización de imágenes de productos.
 * Soporta enlaces compartidos de Google Drive, SharePoint, URLs directas
 * y generación local de placeholders SVG instantáneos (sin latencia de red).
 */

/**
 * Genera un placeholder SVG codificado como Data URI (`data:image/svg+xml;utf8,...`).
 * Se utiliza como respaldo instantáneo (0 ms de red) cuando un producto no tiene imagen
 * o cuando el servidor externo falla, evitando peticiones adicionales a servicios como placehold.co.
 *
 * @param {string} texto Texto o nombre del producto a mostrar en el centro de la imagen
 * @param {string} [bgColor='#dcfce7'] Color hexadecimal de fondo (por defecto verde claro orgánico)
 * @param {string} [textColor='#166534'] Color hexadecimal del texto (por defecto verde bosque)
 * @returns {string} Data URI con el gráfico SVG listo para usar en el atributo `src` de `<img>`
 */
export function generarPlaceholderSvg(texto = 'Plantopolis', bgColor = '#dcfce7', textColor = '#166534') {
  const textoLimpio = String(texto || 'Plantopolis')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .slice(0, 28)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <g fill="${textColor}" opacity="0.18" transform="translate(160, 110) scale(3.3)">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </g>
    <text x="50%" y="62%" dominant-baseline="middle" text-anchor="middle" fill="${textColor}" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700">${textoLimpio}</text>
  </svg>`

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

// Placeholders de fallback por categoría botánica generados localmente (sin llamadas externas)
export const IMAGENES_PLACEHOLDER = {
  'Plantas de Interior':  generarPlaceholderSvg('Interior', '#d1fae5', '#166534'),
  'Plantas de Exterior':  generarPlaceholderSvg('Exterior', '#bbf7d0', '#14532d'),
  'Suculentas y Cactus':  generarPlaceholderSvg('Suculenta', '#fef9c3', '#713f12'),
  'Plantas Aromáticas':   generarPlaceholderSvg('Aromática', '#ede9fe', '#4c1d95'),
  'Huerto y Aromáticas':  generarPlaceholderSvg('Huerto', '#dcfce7', '#166534'),
  'Flores y Orquídeas':   generarPlaceholderSvg('Flores', '#fce7f3', '#9d174d'),
  'Macetas y Accesorios': generarPlaceholderSvg('Accesorio', '#fee2e2', '#991b1b'),
  'Sustratos y Abonos':   generarPlaceholderSvg('Sustrato', '#fef3c7', '#92400e'),
  'Accesorios':           generarPlaceholderSvg('Accesorio', '#fee2e2', '#991b1b'),
}

/**
 * Convierte enlaces compartidos de Google Drive (o SharePoint) a URLs directas de imagen.
 * Google Drive entrega por defecto una página web HTML de visualización (viewer), la cual
 * no puede incrustarse directamente en etiquetas <img>. Esta función extrae el ID del archivo
 * y genera la URL directa a través del CDN oficial de Google (lh3.googleusercontent.com/d/ID).
 *
 * Ejemplos de enlaces soportados:
 * - https://drive.google.com/file/d/1a2B3c4D5e.../view?usp=sharing
 * - https://drive.google.com/file/d/1a2B3c4D5e.../view?usp=drive_link
 * - https://drive.google.com/open?id=1a2B3c4D5e...
 * - https://drive.google.com/uc?id=1a2B3c4D5e...
 *
 * @param {string|null} url Enlace provisto por el usuario
 * @returns {string} URL directa optimizada para etiquetas <img>
 */
export function normalizarUrlImagen(url) {
  if (!url || typeof url !== 'string') return ''
  const trimmed = url.trim()

  // 1. Detección de enlaces compartidos de Google Drive o endpoints lh3 existentes
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)|docs\.google\.com\/file\/d\/|lh3\.googleusercontent\.com\/d\/)([a-zA-Z0-9_-]+)/
  const match = trimmed.match(driveRegex)
  if (match && match[1]) {
    const fileId = match[1]
    // Endpoint CDN oficial de Google con parámetro de redimensionamiento (=w600)
    // para acelerar la descarga y reducir el peso de transferencia en el catálogo
    return `https://lh3.googleusercontent.com/d/${fileId}=w600`
  }

  // 2. Soporte para enlaces compartidos de SharePoint
  if (trimmed.includes('sharepoint.com') && !trimmed.includes('download=1')) {
    const separator = trimmed.includes('?') ? '&' : '?'
    return `${trimmed}${separator}download=1`
  }

  return trimmed
}

/**
 * Retorna la URL de imagen a mostrar con fallbacks botánicos locales.
 * Prioridad:
 * 1) URL normalizada del producto (convirtiendo links de Google Drive si aplica)
 * 2) Placeholder SVG local por categoría botánica
 * 3) Placeholder SVG genérico de Plantopolis
 *
 * @param {string|null} imagenUrl URL guardada en base de datos o provista en formulario
 * @param {string|null} [categoria] Nombre de la categoría del producto
 * @returns {string} URL de imagen lista para renderizar
 */
export function getImagenProducto(imagenUrl, categoria) {
  if (imagenUrl && typeof imagenUrl === 'string' && imagenUrl.trim() !== '') {
    return normalizarUrlImagen(imagenUrl)
  }
  if (categoria && IMAGENES_PLACEHOLDER[categoria]) {
    return IMAGENES_PLACEHOLDER[categoria]
  }
  return generarPlaceholderSvg('Plantopolis')
}