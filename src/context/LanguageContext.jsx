import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

/**
 * Proveedor de contexto para gestionar el idioma activo de la aplicación ('es' o 'en').
 * Persiste la preferencia en `localStorage` y expone la función traductora `t()`.
 *
 * @component
 * @param {Object} props - Propiedades del componente.
 * @param {React.ReactNode} props.children - Árbol de componentes hijos.
 * @returns {JSX.Element} Proveedor de contexto de idioma.
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'es';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
  }, [language]);

  /**
   * Actualiza el idioma activo de la plataforma.
   *
   * @param {string} lang - Código de idioma ('es' o 'en').
   */
  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  /**
   * Traduce una clave al idioma activo con soporte de interpolación `{clave}`, alias y red de seguridad.
   * - Si el 2.º argumento es un objeto plano (`typeof paramsOrFallback === 'object' && paramsOrFallback !== null`),
   *   utiliza `optionalFallback` como respaldo si la clave no existe y reemplaza `{clave}` con `paramsOrFallback[clave]`.
   * - Si el 2.º argumento es un string (o `undefined`), actúa como texto `fallback` tradicional.
   * - Nunca devuelve un objeto como retorno de `t()`, previniendo errores de renderizado en React.
   *
   * @param {string} key - Clave de traducción a buscar en el diccionario.
   * @param {Object|string} [paramsOrFallback] - Objeto con variables `{clave}` a interpolar, o texto de respaldo.
   * @param {string} [optionalFallback] - Texto alternativo cuando el 2.º argumento es un objeto de interpolación.
   * @returns {string} Cadena traducida lista para renderizar.
   */
  const t = (key, paramsOrFallback, optionalFallback) => {
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

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook personalizado para consumir el contexto de internacionalización (`language`, `changeLanguage`, `t`).
 *
 * @returns {{ language: string, changeLanguage: function(string): void, t: function(string, (Object|string)=, string=): string }}
 */
export const useLanguage = () => useContext(LanguageContext);

