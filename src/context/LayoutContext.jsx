import { createContext, useContext, useState } from 'react';

/**
 * Contexto global para la gestión de Layout.
 * Permite a las páginas establecer su título y subtítulo en el Navbar global.
 */
const LayoutContext = createContext();

export function LayoutProvider({ children }) {
  const [pageTitle, setPageTitle] = useState('');
  const [pageSubtitle, setPageSubtitle] = useState('');

  return (
    <LayoutContext.Provider value={{ pageTitle, setPageTitle, pageSubtitle, setPageSubtitle }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayoutContext() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayoutContext must be used within a LayoutProvider');
  }
  return context;
}
