import { useLanguage } from '../../context/LanguageContext';
import { Globe } from 'lucide-react';

/**
 * Button component to toggle the application language between Spanish and English.
 * Supports custom styling via className.
 *
 * @param {{ className?: string }} props
 */
export const LanguageSwitcher = ({ className = '' }) => {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    changeLanguage(language === 'es' ? 'en' : 'es');
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-black uppercase transition-all duration-200 border border-white/20 bg-white/10 hover:bg-white/20 text-white shadow-sm hover:scale-105 active:scale-95 ${className}`}
      title={language === 'es' ? 'Cambiar idioma a Inglés (EN)' : 'Switch language to Spanish (ES)'}
      aria-label="Cambiar idioma"
    >
      <Globe size={15} strokeWidth={2.5} className="text-emerald-300" />
      <span className="tracking-wider">{language === 'es' ? 'ES' : 'EN'}</span>
    </button>
  );
};
