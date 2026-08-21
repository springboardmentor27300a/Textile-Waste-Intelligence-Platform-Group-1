import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ page, pages, total, limit, onPageChange }) => {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-forest-100 px-1 pt-4 sm:flex-row">
      <p className="text-xs text-ink/50">
        Showing <span className="font-semibold text-ink/70">{start}–{end}</span> of{' '}
        <span className="font-semibold text-ink/70">{total}</span> records
      </p>
      <div className="flex items-center gap-1.5">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-forest-100 text-ink/60 transition-colors hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="px-2 text-sm font-medium text-ink/70">
          Page {page} of {Math.max(pages, 1)}
        </span>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-forest-100 text-ink/60 transition-colors hover:bg-forest-50 disabled:cursor-not-allowed disabled:opacity-40"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label="Next page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
