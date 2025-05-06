import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (value: number) => void;
  isDarkMode: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  // totalItems is used for interface compatibility but not in rendering
  onPageChange,
  onItemsPerPageChange,
  isDarkMode
}) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = window.innerWidth < 768 ? 2 : 3;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      {itemsPerPage && onItemsPerPageChange && (
        <div className="flex items-center gap-2 whitespace-nowrap text-xs">
          <label className="text-gray-500 dark:text-gray-400">
            Items per page:
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className={`px-1.5 py-0.5 rounded text-xs ${
              isDarkMode
                ? 'bg-gray-700 text-white border-gray-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`p-1 rounded ${
            isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
          }`}
        >
          <ChevronLeft className="w-3 h-3" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-1 py-0.5 text-gray-500 text-xs">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(page as number)}
                  className={`px-1.5 py-0.5 rounded text-xs font-medium min-w-[1.5rem] ${
                    page === currentPage
                      ? isDarkMode
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-100 text-blue-700'
                      : isDarkMode
                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`p-1 rounded ${
            isDarkMode
              ? 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400'
          }`}
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default Pagination; 