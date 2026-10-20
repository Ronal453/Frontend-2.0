/**
 * @file translatorService.js
 * @description Servicio de traducción dinámica en tiempo real para contenido generado por el usuario (UGC).
 * 
 * ¿Por qué existe este servicio?
 * Las cadenas estáticas de la plataforma se traducen mediante diccionarios precompilados (es.js y en.js).
 * Sin embargo, observaciones de mermas, notas de auditoría de lotes, comentarios de tareas y nuevas
 * especies botánicas son introducidos libremente por los usuarios en tiempo de ejecución. Este servicio
 * traduce automáticamente dicho contenido cuando el usuario cambia a inglés, almacenando en caché
 * persistente cada traducción para eliminar peticiones repetidas a la red y ofrecer carga instantánea.
 */

const STORAGE_CACHE_KEY = 'plantopolis_translations_cache';

// Mapa en memoria para acceso ultra-rápido síncrono
const memoryCache = new Map();

// Control de peticiones en vuelo para evitar llamadas duplicadas simultáneas
const inFlightRequests = new Map();

/**
 * Decodifica entidades HTML que puedan devolver APIs externas (ej. &quot;, &#39;, &amp;).
 * @param {string} str - Cadena de texto a sanear.
 * @returns {string} Cadena con caracteres legibles.
 */
function decodeHtmlEntities(str) {
  if (!str || typeof str !== 'string' || !str.includes('&')) {
    return str;
  }
  try {
    const parser = new DOMParser();
    const dom = parser.parseFromString(`<!doctype html><body>${str}`, 'text/html');
    return dom.body.textContent || str;
  } catch {
    return str;
  }
}

/**
 * Carga la caché persistente desde localStorage al inicio.
 */
function initializeCache() {
  try {
    const raw = localStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      Object.entries(parsed).forEach(([key, val]) => {
        memoryCache.set(key, val);
      });
    }
  } catch (error) {
    console.warn('[translatorService] No se pudo leer la caché de localStorage:', error);
  }
}

// Inicializar la caché al cargar el módulo
initializeCache();

/**
 * Guarda una traducción tanto en memoria como en localStorage.
 * @param {string} cacheKey - Clave única idioma:texto.
 * @param {string} translatedText - Texto traducido y saneado.
 */
function saveToCache(cacheKey, translatedText) {
  memoryCache.set(cacheKey, translatedText);
  try {
    const current = {};
    memoryCache.forEach((val, key) => {
      current[key] = val;
    });
    localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(current));
  } catch (error) {
    console.warn('[translatorService] Error escribiendo en localStorage:', error);
  }
}

/**
 * Genera la clave compuesta para indexar una traducción.
 * @param {string} text - Texto original.
 * @param {string} targetLang - Idioma de destino ('en', 'es').
 * @param {string} sourceLang - Idioma de origen (por defecto 'es').
 * @returns {string} Clave normalizada.
 */
function getCacheKey(text, targetLang, sourceLang = 'es') {
  return `${sourceLang}_${targetLang}:${text.trim().toLowerCase()}`;
}

/**
 * Consulta síncrona de caché. Permite al UI pintar el texto traducido en el primer frame si ya fue consultado.
 * @param {string} text - Texto original a buscar.
 * @param {string} targetLang - Idioma destino.
 * @param {string} sourceLang - Idioma origen.
 * @returns {string|null} Texto traducido o null si aún no existe en caché.
 */
export function getCachedTranslation(text, targetLang = 'en', sourceLang = 'es') {
  if (!text || typeof text !== 'string') return null;
  if (targetLang === sourceLang) return text;
  const key = getCacheKey(text, targetLang, sourceLang);
  return memoryCache.get(key) || null;
}

/**
 * Traduce de forma asíncrona un texto libre mediante canal primario (Google GTX)
 * con failover automático a canal secundario (MyMemory API).
 * Si ocurre fallo total de red, devuelve el texto original sin romper la aplicación.
 *
 * @param {string} text - Texto original en español ingresado por el usuario.
 * @param {string} targetLang - Idioma al que se desea traducir (ej. 'en').
 * @param {string} sourceLang - Idioma base (por defecto 'es').
 * @returns {Promise<string>} Promesa con el texto traducido.
 */
export async function translateDynamicText(text, targetLang = 'en', sourceLang = 'es') {
  // 1. Validaciones inmediatas
  if (!text || typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed || targetLang === sourceLang) return text;

  // Si es un número puro, fecha (YYYY-MM-DD), o código simple, no requiere traducción externa
  if (/^[\d\s\-:.,#_/]+$/.test(trimmed)) {
    return text;
  }

  // 2. Verificar caché en memoria
  const cacheKey = getCacheKey(trimmed, targetLang, sourceLang);
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  // 3. Deduplicación de peticiones simultáneas idénticas
  if (inFlightRequests.has(cacheKey)) {
    return inFlightRequests.get(cacheKey);
  }

  const translationPromise = (async () => {
    // 4. Intento Primario: Google GTX (rápido, sin límites estrictos y alta precisión semántica)
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
      const res = await fetch(gtxUrl, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const translated = data[0].map(segment => segment[0]).join('');
          if (translated && translated.trim()) {
            const cleanResult = decodeHtmlEntities(translated.trim());
            saveToCache(cacheKey, cleanResult);
            return cleanResult;
          }
        }
      }
    } catch (gtxError) {
      console.warn('[translatorService] Canal primario no disponible, intentando respaldo...', gtxError);
    }

    // 5. Intento Secundario (Failover): MyMemory Translation API
    try {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${sourceLang}|${targetLang}`;
      const res = await fetch(myMemoryUrl, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        const candidate = data?.responseData?.translatedText;
        if (candidate && typeof candidate === 'string' && !candidate.toUpperCase().includes('MYMEMORY WARNING')) {
          const cleanResult = decodeHtmlEntities(candidate.trim());
          saveToCache(cacheKey, cleanResult);
          return cleanResult;
        }
      }
    } catch (fallbackError) {
      console.warn('[translatorService] Falló canal secundario de traducción:', fallbackError);
    }

    // 6. Red de seguridad final: devolver el texto original para no degradar la experiencia visual
    return text;
  })();

  inFlightRequests.set(cacheKey, translationPromise);

  try {
    return await translationPromise;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}

/**
 * Limpia la caché local de traducciones dinámicas (útil para pruebas o mantenimiento).
 */
export function clearTranslationCache() {
  memoryCache.clear();
  try {
    localStorage.removeItem(STORAGE_CACHE_KEY);
  } catch (error) {
    console.warn('[translatorService] Error al limpiar caché de localStorage:', error);
  }
}
