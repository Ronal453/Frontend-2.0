/**
 * @file useDynamicTranslation.js
 * @description Hook de React para resolver traducciones dinámicas de textos libres de usuario.
 * 
 * ¿Por qué este hook?
 * Combina la prioridad del diccionario estático (si existe una clave predefinida),
 * la caché inmediata en memoria/localStorage (para evitar parpadeos), y la traducción
 * asíncrona mediante translatorService si es un registro completamente nuevo.
 */

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getCachedTranslation, translateDynamicText } from '../services/translatorService';

/**
 * Hook para traducir textos dinámicos o ingresados por el usuario.
 *
 * @param {string} text - Texto original en español (ej. observaciones, comentarios, notas).
 * @param {Object} [options] - Opciones de configuración.
 * @param {string} [options.prefix] - Prefijo opcional del diccionario estático (ej. 'wasteObservation', 'lotObservation').
 * @param {string} [options.fallback] - Texto alternativo si el texto principal viene vacío.
 * @returns {{ translated: string, loading: boolean }} Objeto con el texto traducido y bandera de carga.
 */
export function useDynamicTranslation(text, options = {}) {
  const { prefix = null, fallback = '' } = options;
  const { language, t } = useLanguage();

  // Función auxiliar para determinar si existe una traducción síncrona disponible de inmediato
  const getImmediateTranslation = () => {
    if (!text || typeof text !== 'string') return fallback || '';
    if (language === 'es') return text;

    // 1. Probar primero si existe en el diccionario estático pregrabado
    if (prefix) {
      const dictKey = `${prefix}.${text.trim()}`;
      const dictVal = t(dictKey, null);
      if (dictVal && dictVal !== dictKey && dictVal !== text) {
        return dictVal;
      }
    }

    // 2. Probar si ya está en la caché en memoria o persistente
    const cached = getCachedTranslation(text, language);
    if (cached) {
      return cached;
    }

    // 3. Fallback inicial mientras se traduce en segundo plano
    return text;
  };

  const [translated, setTranslated] = useState(getImmediateTranslation);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!text || typeof text !== 'string') {
      setTranslated(fallback || '');
      setLoading(false);
      return;
    }

    if (language === 'es') {
      setTranslated(text);
      setLoading(false);
      return;
    }

    // 1. Revisar diccionario estático
    if (prefix) {
      const dictKey = `${prefix}.${text.trim()}`;
      const dictVal = t(dictKey, null);
      if (dictVal && dictVal !== dictKey && dictVal !== text) {
        setTranslated(dictVal);
        setLoading(false);
        return;
      }
    }

    // 2. Revisar si ya está en caché
    const cached = getCachedTranslation(text, language);
    if (cached) {
      setTranslated(cached);
      setLoading(false);
      return;
    }

    // 3. No está en caché ni en diccionario: disparar traducción en segundo plano
    setLoading(true);
    translateDynamicText(text, language)
      .then((res) => {
        if (isMounted) {
          setTranslated(res);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTranslated(text);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, language, prefix, fallback, t]);

  return { translated, loading };
}
