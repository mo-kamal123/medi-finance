const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
}) => {
  if (totalPages <= 1 && !onPageSizeChange) return null;

  const pages = [];
  const startPage = Math.max(currentPage - 2, 1);
  const endPage = Math.min(startPage + 4, totalPages);

  for (let page = startPage; page <= endPage; page += 1) {
    pages.push(page);
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
        >
          السابق
        </button>

        <div className="flex items-center gap-2">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange?.(page)}
              className={`px-3 py-2 rounded-lg text-sm border ${
                page === currentPage
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 text-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange?.(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm disabled:opacity-50"
        >
          التالي
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          صفحة {currentPage} من {totalPages}
        </span>

        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default Pagination;
