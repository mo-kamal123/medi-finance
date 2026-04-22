import SearchableSelect from '../ui/searchable-select';

const Pagination = ({
  currentPage = 1,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const generatePages = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i += 1) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:flex-row">
      <div className="text-sm text-gray-600">
        صفحة {currentPage} من {totalPages} - إجمالي {totalCount} عنصر
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-md border px-3 py-1 disabled:opacity-50"
        >
          السابق
        </button>

        {generatePages().map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`rounded-md border px-3 py-1 ${
              page === currentPage ? 'bg-primary text-white' : 'bg-white'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-md border px-3 py-1 disabled:opacity-50"
        >
          التالي
        </button>
      </div>

      <div className="w-full md:w-28">
        <SearchableSelect
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          options={[5, 10, 20, 50]}
        />
      </div>
    </div>
  );
};

export default Pagination;
