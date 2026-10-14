import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';

const LanguageContext = createContext();

/**
 * Context to handle language selection.
 * Defaults to Spanish ('es').
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('app_language') || 'es';
  });

  useEffect(() => {
    localStorage.setItem('app_language', language);
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  /**
   * Traduce una clave al idioma activo con soporte de interpolación, alias y red de seguridad.
   * Evita mostrar prefijos de sistema (como 'orderStatus.' o 'status.') en la interfaz de usuario.
   *
   * @param {string} key Clave de traducción.
   * @param {Object|string} [params] Objeto con variables {var} a interpolar, o texto alternativo por defecto.
   * @param {string} [fallback] Texto alternativo en caso de que la clave no exista.
   * @returns {string} Cadena traducida lista para renderizar.
   */
  const t = (key, params = {}, fallback = null) => {
    const fallbackText = typeof params === 'string' ? params : (typeof fallback === 'string' ? fallback : null);
    let text = translations[language]?.[key] ?? translations['es']?.[key];

    // Soporte para alias de prefijos comunes (orderStatus.<VAL> <-> status.<VAL>)
    if (!text && key.startsWith('orderStatus.')) {
      const aliasKey = 'status.' + key.replace('orderStatus.', '');
      text = translations[language]?.[aliasKey] ?? translations['es']?.[aliasKey];
    } else if (!text && key.startsWith('status.')) {
      const aliasKey = 'orderStatus.' + key.replace('status.', '');
      text = translations[language]?.[aliasKey] ?? translations['es']?.[aliasKey];
    }

    if (!text) {
      if (fallbackText) {
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

    if (params && typeof params === 'object') {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramVal);
      });
    }
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
