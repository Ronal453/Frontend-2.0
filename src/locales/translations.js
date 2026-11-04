import { es } from './es.js';
import { en } from './en.js';

/**
 * Diccionario central de traducciones para Plantopolis.
 * Exporta los idiomas disponibles ('es', 'en').
 */
export const translations = {
  es,
  en,
};

/**
 * Crea una función traductora pura `t(key, paramsOrFallback, optionalFallback)` para el idioma indicado.
 * Soporta interpolación de variables `{variable}`, sobrecarga de 2 y 3 argumentos, resolución de alias
 * de estado y garantía estricta de devolver siempre un string (nunca un objeto).
 *
 * @param {string} [language='es'] - Código de idioma activo ('es' o 'en').
 * @returns {function(string, (Object|string)=, string=): string} Función traductora `t`.
 */
export const createTranslator = (language = 'es') => {
  return (key, paramsOrFallback, optionalFallback) => {
    if (typeof key !== 'string' || !key) {
      return typeof optionalFallback === 'string'
        ? optionalFallback
        : typeof paramsOrFallback === 'string'
        ? paramsOrFallback
        : '';
    }

    const isParamsObject =
      typeof paramsOrFallback === 'object' &&
      paramsOrFallback !== null &&
      !Array.isArray(paramsOrFallback);

    const interpolationParams = isParamsObject ? paramsOrFallback : null;
    const fallbackText = isParamsObject
      ? typeof optionalFallback === 'string'
        ? optionalFallback
        : null
      : typeof paramsOrFallback === 'string'
      ? paramsOrFallback
      : typeof optionalFallback === 'string'
      ? optionalFallback
      : null;

    let text = translations[language]?.[key] ?? translations['es']?.[key];

    // Soporte para alias de prefijos comunes (orderStatus.<VAL> <-> status.<VAL>)
    if (!text && key.startsWith('orderStatus.')) {
      const aliasKey = 'status.' + key.replace('orderStatus.', '');
      text = translations[language]?.[aliasKey] ?? translations['es']?.[aliasKey];
    } else if (!text && key.startsWith('status.')) {
      const aliasKey = 'orderStatus.' + key.replace('status.', '');
      text = translations[language]?.[aliasKey] ?? translations['es']?.[aliasKey];
    }

    if (typeof text !== 'string' || !text) {
      if (fallbackText !== null) {
        text = fallbackText;
      } else if (key.includes('.')) {
        // Red de seguridad: Si la clave no existe, nunca mostrar prefijos internos como "orderStatus." al usuario
        const parts = key.split('.');
        const lastPart = parts[parts.length - 1];
        text = lastPart.replace(/_/g, ' ');
      } else {
        text = key;
      }
    }

    let result = String(text);

    if (interpolationParams) {
      Object.entries(interpolationParams).forEach(([paramKey, paramVal]) => {
        const safeVal = paramVal !== undefined && paramVal !== null ? String(paramVal) : '';
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), safeVal);
      });
    }

    return typeof result === 'string' ? result : String(result ?? '');
  };
};

