import SearchableSelect from './searchable-select';

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
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 md:flex-row">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange?.(currentPage - 1)}
          disabled={currentPage <= 1}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          السابق
        </button>

        <div className="flex items-center gap-2">
          {pages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange?.(page)}
              className={`rounded-lg border px-3 py-2 text-sm ${
                page === currentPage
                  ? 'border-primary bg-primary text-white'
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
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm disabled:opacity-50"
        >
          التالي
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span>
          صفحة {currentPage} من {totalPages}
        </span>

        {onPageSizeChange ? (
          <div className="w-24">
            <SearchableSelect
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              options={[5, 10, 20, 50]}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Pagination;
