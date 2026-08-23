export const DEFAULT_AGING_REPORT_FILTERS = {
  partyType: 'Supplier',
  partyId: '',
  referenceDate: '',
  category: '',
  providerClass: '',
  importanceLevel: '',
  partyStatus: '',
  governorateId: '',
  sortBy: '',
  sortOrder: '',
  pageNumber: 1,
  pageSize: 10,
};

export const buildAgingReportQueryParams = (filters = {}) => {
  const params = {
    referenceDate: filters.referenceDate || undefined,
    partyType: filters.partyType || undefined,
    customerId: filters.partyType === 'Customer' && filters.partyId
      ? Number(filters.partyId)
      : undefined,
    supplierId: filters.partyType === 'Supplier' && filters.partyId
      ? Number(filters.partyId)
      : undefined,
    category: filters.category ? Number(filters.category) : undefined,
    providerClass: filters.providerClass ? Number(filters.providerClass) : undefined,
    importanceLevel: filters.importanceLevel ? Number(filters.importanceLevel) : undefined,
    partyStatus: filters.partyStatus ? Number(filters.partyStatus) : undefined,
    governorateId: filters.governorateId ? Number(filters.governorateId) : undefined,
    sortBy: filters.sortBy || undefined,
    sortOrder: filters.sortOrder || undefined,
    pageNumber: filters.pageNumber || 1,
    pageSize: filters.pageSize || 50,
  };

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
};

export const countActiveAgingReportFilters = (
  filters = {},
  { exclude = ['pageNumber', 'pageSize'] } = {}
) => {
  return Object.entries(filters).filter(([key, value]) => {
    if (exclude.includes(key)) return false;
    return value !== '' && value !== null && value !== undefined;
  }).length;
};
