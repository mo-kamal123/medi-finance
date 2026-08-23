import { toApiDateTime } from './mapCashVoucherValues';

export const DEFAULT_CASH_VOUCHER_FILTERS = {
  searchTerm: '',
  isReceipt: '',
  isCleared: '',
  isVoid: '',
  fromDate: '',
  toDate: '',
  pageNumber: 1,
  pageSize: 10,
};

const cleanValue = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
};

export const buildCashVoucherQueryParams = (filters = {}) => {
  const params = {
    searchTerm: cleanValue(filters.searchTerm),
    isReceipt: cleanValue(filters.isReceipt),
    isCleared: cleanValue(filters.isCleared),
    isVoid: cleanValue(filters.isVoid),
    fromDate: filters.fromDate ? toApiDateTime(filters.fromDate) : undefined,
    toDate: filters.toDate ? toApiDateTime(filters.toDate) : undefined,
    pageNumber: filters.pageNumber || 1,
    pageSize: filters.pageSize || 10,
  };

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
};

export const countActiveCashVoucherFilters = (
  filters = {},
  { exclude = ['pageNumber', 'pageSize'] } = {}
) => {
  return Object.entries(filters).filter(([key, value]) => {
    if (exclude.includes(key)) return false;
    return value !== '' && value !== null && value !== undefined;
  }).length;
};
