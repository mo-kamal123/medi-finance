export const normalizeSearchText = (value) =>
  String(value ?? '')
    .toLowerCase()
    .trim();

export const matchesSearch = (item, fields, searchTerm) => {
  const normalizedSearch = normalizeSearchText(searchTerm);

  if (!normalizedSearch) return true;

  return fields.some((field) => {
    const value = typeof field === 'function' ? field(item) : item?.[field];
    return normalizeSearchText(value).includes(normalizedSearch);
  });
};

export const paginateItems = (items, pageNumber = 1, pageSize = 10) => {
  const safePageSize = Math.max(Number(pageSize) || 10, 1);
  const safePageNumber = Math.max(Number(pageNumber) || 1, 1);
  const totalItems = items.length;
  const totalPages = Math.max(Math.ceil(totalItems / safePageSize), 1);
  const currentPage = Math.min(safePageNumber, totalPages);
  const startIndex = (currentPage - 1) * safePageSize;

  return {
    items: items.slice(startIndex, startIndex + safePageSize),
    totalItems,
    totalPages,
    currentPage,
    pageSize: safePageSize,
  };
};
