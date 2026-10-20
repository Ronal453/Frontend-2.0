/**
 * @file DynamicText.jsx
 * @description Componente reutilizable para renderizar textos libres o generados por el usuario
 * (observaciones, notas de historial, comentarios de tareas, especies botánicas) con traducción
 * automática en caliente y soporte para caché persistente.
 *
 * ¿Por qué este componente?
 * Facilita insertar texto dinámico en cualquier vista (tablas, modales, tarjetas) sin tener que
 * gestionar manualmente llamadas a APIs, estados de carga o claves del diccionario.
 * Si el usuario está en español, renderiza de forma instantánea sin impacto en rendimiento.
 * Si está en inglés, consulta primero el diccionario estático y la caché local, y si es un
 * nuevo registro, lo traduce en segundo plano y actualiza el nodo en tiempo real.
 */

import React from 'react';
import { useDynamicTranslation } from '../../hooks/useDynamicTranslation';

/**
 * Renderiza texto traducido dinámicamente con soporte para comillas, etiquetas HTML personalizadas y tooltips.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.text - Texto original a mostrar o traducir.
 * @param {string} [props.prefix] - Prefijo opcional del diccionario (ej. 'wasteObservation', 'lotObservation').
 * @param {string} [props.fallback] - Texto alternativo si el texto es nulo o vacío.
 * @param {boolean} [props.showQuotes=false] - Indica si el texto debe envolverse en comillas dobles ("...").
 * @param {boolean|string} [props.title] - Si es true, añade el texto traducido como atributo title; o una cadena personalizada.
 * @param {React.ElementType} [props.as='span'] - Etiqueta HTML o componente contenedor (por defecto 'span').
 * @param {string} [props.className] - Clases CSS de Tailwind.
 * @returns {JSX.Element|null} Elemento React renderizado.
 */
export default function DynamicText({
  text,
  prefix = null,
  fallback = '',
  showQuotes = false,
  title = false,
  as: Component = 'span',
  className = '',
  children,
  ...rest
}) {
  const { translated } = useDynamicTranslation(text, { prefix, fallback });

  if (!text && !fallback) {
    return null;
  }

  const displayText = showQuotes ? `"${translated}"` : translated;
  const tooltipText = title === true ? translated : (typeof title === 'string' ? title : undefined);

  return (
    <Component className={className} title={tooltipText} {...rest}>
      {displayText}
      {children}
    </Component>
  );
}
