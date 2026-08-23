import { toApiDateTime } from './journal-entry.utils';

export const DEFAULT_JOURNAL_ENTRY_FILTERS = {
  journalEntryNumber: '',
  journalType: '',
  status: '',
  fromDate: '',
  toDate: '',
  financialPeriodId: '',
  referenceNumber: '',
  accountId: '',
  pageNumber: 1,
  pageSize: 10,
};

const cleanValue = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
};

export const buildJournalEntryQueryParams = (filters = {}) => {
  const params = {
    journalEntryNumber: cleanValue(filters.journalEntryNumber),
    journalType: cleanValue(filters.journalType),
    status: cleanValue(filters.status),
    fromDate: filters.fromDate ? toApiDateTime(filters.fromDate) : undefined,
    toDate: filters.toDate ? toApiDateTime(filters.toDate) : undefined,
    financialPeriodId: filters.financialPeriodId
      ? Number(filters.financialPeriodId)
      : undefined,
    referenceNumber: cleanValue(filters.referenceNumber),
    accountId: filters.accountId ? Number(filters.accountId) : undefined,
    pageNumber: filters.pageNumber || 1,
    pageSize: filters.pageSize || 10,
  };

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
};

export const countActiveJournalEntryFilters = (
  filters = {},
  { exclude = ['pageNumber', 'pageSize'] } = {}
) => {
  return Object.entries(filters).filter(([key, value]) => {
    if (exclude.includes(key)) return false;
    return value !== '' && value !== null && value !== undefined;
  }).length;
};
