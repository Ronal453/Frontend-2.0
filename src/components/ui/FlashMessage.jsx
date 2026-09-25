import React from 'react';

export default function FlashMessage({ mensaje }) {
  if (!mensaje) return null;

  return (
    <div
      className={`mb-4 p-4 rounded-lg flex items-center justify-between transition-all ${
        mensaje.tipo === 'error'
          ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50'
          : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50'
      }`}
      role="alert"
    >
      <p className="font-medium">{mensaje.texto}</p>
    </div>
  );
}
