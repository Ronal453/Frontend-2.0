/**
 * Utilidades para manejo y normalización de imágenes de productos.
 * Soporta enlaces compartidos de Google Drive, SharePoint y URLs directas.
 */

// Placeholders de fallback por categoría botánica
export const IMAGENES_PLACEHOLDER = {
  'Plantas de Interior':  'https://placehold.co/400x400/d1fae5/166534?text=Interior',
  'Plantas de Exterior':  'https://placehold.co/400x400/bbf7d0/14532d?text=Exterior',
  'Suculentas y Cactus':  'https://placehold.co/400x400/fef9c3/713f12?text=Suculenta',
  'Plantas Aromáticas':   'https://placehold.co/400x400/ede9fe/4c1d95?text=Aromatica',
  'Accesorios':           'https://placehold.co/400x400/fee2e2/991b1b?text=Accesorio',
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

  // 1. Detección de enlaces compartidos de Google Drive
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=view&)?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/
  const match = trimmed.match(driveRegex)
  if (match && match[1]) {
    const fileId = match[1]
    // Endpoint CDN oficial de Google para entrega directa de imágenes públicas
    return `https://lh3.googleusercontent.com/d/${fileId}`
  }

  // 2. Soporte para enlaces compartidos de SharePoint
  if (trimmed.includes('sharepoint.com') && !trimmed.includes('download=1')) {
    const separator = trimmed.includes('?') ? '&' : '?'
    return `${trimmed}${separator}download=1`
  }

  return trimmed
}

/**
 * Retorna la URL de imagen a mostrar con fallbacks botánicos.
 * Prioridad:
 * 1) URL normalizada del producto (convirtiendo links de Google Drive si aplica)
 * 2) Placeholder por categoría botánica
 * 3) Placeholder genérico de Plantopolis
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
  return 'https://placehold.co/400x400/f0fdf4/166534?text=Plantopolis'
}