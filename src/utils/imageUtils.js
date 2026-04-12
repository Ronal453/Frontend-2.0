/**
 * Utilidades para manejo de imágenes de productos
 * Las imágenes están en SharePoint, organizadas por tipo de producto
 */

// Base URL del SharePoint (sin barra final)
const SP_BASE = 'https://mailunicundiedu-my.sharepoint.com/personal/rjalarcon_ucundinamarca_edu_co/_layouts/15/download.aspx'

/**
 * Categorías de imágenes por tipo de producto
 * Llena los IDs después de subir cada imagen a SharePoint y obtener el link
 * Formato de URL directa SharePoint: 
 *   https://mailunicundiedu-my.sharepoint.com/:i:/g/personal/.../[ID]?e=[token]&download=1
 */
export const IMAGENES_PLACEHOLDER = {
  // Por categoría de producto
  'Plantas de Interior':  'https://placehold.co/400x400/d1fae5/166534?text=Interior',
  'Plantas de Exterior':  'https://placehold.co/400x400/bbf7d0/14532d?text=Exterior',
  'Suculentas y Cactus':  'https://placehold.co/400x400/fef9c3/713f12?text=Suculenta',
  'Plantas Aromáticas':   'https://placehold.co/400x400/ede9fe/4c1d95?text=Aromatica',
  'Accesorios':           'https://placehold.co/400x400/fee2e2/991b1b?text=Accesorio',
}

/**
 * Retorna la URL de imagen a mostrar
 * Prioridad: 1) imagen_url del producto, 2) placeholder por categoría, 3) genérico
 * @param {string|null} imagenUrl — URL guardada en BD
 * @param {string|null} categoria — nombre de la categoría del producto
 * @returns {string} URL de imagen
 */
export function getImagenProducto(imagenUrl, categoria) {
  if (imagenUrl && imagenUrl.trim() !== '') return imagenUrl
  if (categoria && IMAGENES_PLACEHOLDER[categoria]) {
    return IMAGENES_PLACEHOLDER[categoria]
  }
  return 'https://placehold.co/400x400/f0fdf4/166534?text=Plantopolis'
}

/**
 * Convierte un link de compartir de SharePoint a URL directa de imagen
 * @param {string} shareLink — Link generado al compartir en SharePoint
 * @returns {string} URL directa para usar en <img>
 */
export function sharePointToDirectUrl(shareLink) {
  if (!shareLink) return ''
  // Si ya tiene &download=1 o es una URL directa, retornar tal cual
  if (shareLink.includes('download=1') || !shareLink.includes('sharepoint.com')) {
    return shareLink
  }
  // Añadir parámetro de descarga directa
  const separator = shareLink.includes('?') ? '&' : '?'
  return `${shareLink}${separator}download=1`
}