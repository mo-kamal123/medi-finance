import { toApiDateTime } from '../../../../transactions/entries/utils/journal-entry.utils';

export const DEFAULT_GENERAL_LEDGER_FILTERS = {
  accountId: '',
  fromDate: '',
  toDate: '',
  financialPeriodId: '',
  costCenterId: '',
  customerId: '',
  supplierId: '',
  currencyId: '',
  partyType: '',
  sourceType: '',
};

const cleanValue = (value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
};

export const buildGeneralLedgerQueryParams = (filters = {}) => {
  const params = {
    accountId: filters.accountId ? Number(filters.accountId) : undefined,
    fromDate: filters.fromDate ? toApiDateTime(filters.fromDate) : undefined,
    toDate: filters.toDate ? toApiDateTime(filters.toDate) : undefined,
    financialPeriodId: filters.financialPeriodId
      ? Number(filters.financialPeriodId)
      : undefined,
    costCenterId: filters.costCenterId
      ? Number(filters.costCenterId)
      : undefined,
    customerId: filters.customerId ? Number(filters.customerId) : undefined,
    supplierId: filters.supplierId ? Number(filters.supplierId) : undefined,
    currencyId: filters.currencyId ? Number(filters.currencyId) : undefined,
    partyType: cleanValue(filters.partyType),
    sourceType: cleanValue(filters.sourceType),
  };

  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined)
  );
};

export const countActiveGeneralLedgerFilters = (
  filters = {},
  { exclude = [] } = {}
) => {
  return Object.entries(filters).filter(([key, value]) => {
    if (exclude.includes(key)) return false;
    return value !== '' && value !== null && value !== undefined;
  }).length;
};
