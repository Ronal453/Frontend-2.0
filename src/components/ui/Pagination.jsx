import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Reusable pagination controls with dynamic translation support.
 *
 * @param {{ currentPage: number, totalPages: number, onPageChange: (page: number) => void }} props
 */
export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  return (
    <div className="flex justify-center gap-2 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
      >
        {t('common.prev')}
      </button>
      <span className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400">
        {t('common.page_info', { current: currentPage + 1, total: totalPages })}
      </span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40"
      >
        {t('common.next')}
      </button>
    </div>
  );
}
