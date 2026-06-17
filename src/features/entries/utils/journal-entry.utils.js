export const JOURNAL_TYPES = [
  { value: 'DailyEntry', label: 'قيد يومية' },
  { value: 'ManualEntry', label: 'قيد تسوية' },
  { value: 'ClosingEntry', label: 'قيد إقفال' },
];

const JOURNAL_TYPE_LABELS = Object.fromEntries(
  JOURNAL_TYPES.map((type) => [type.value, type.label])
);

export const getJournalTypeLabel = (value) =>
  JOURNAL_TYPE_LABELS[value] || value || '-';

export const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).split('T')[0];
};

export const toApiDateTime = (value) => {
  const dateValue = toDateInputValue(value);
  return dateValue ? `${dateValue}T00:00:00` : null;
};

export const getJournalEntryDescription = (entry = {}) =>
  entry.description || entry.descriptionAr || '-';

export const isJournalEntryPosted = (entry = {}) =>
  entry.isPosted === true ||
  Number(entry.statusID) === 1 ||
  entry.statusName === 'مرحل' ||
  entry.statusName === 'Posted' ||
  entry.status === 'Posted';

export const isJournalEntryReversed = (entry = {}) =>
  entry.isReversed === true ||
  Number(entry.statusID) === 3 ||
  String(entry.statusName || entry.status || '')
    .toLowerCase()
    .includes('reverse') ||
  String(entry.statusName || '').includes('معكوس');

export const getJournalEntryStatusMeta = (entry = {}) => {
  const statusName = entry.statusName || entry.status || '-';

  if (isJournalEntryReversed(entry)) {
    return { badgeClass: 'bg-red-100 text-red-700', label: statusName };
  }

  if (isJournalEntryPosted(entry)) {
    return { badgeClass: 'bg-green-100 text-green-700', label: statusName };
  }

  return { badgeClass: 'bg-yellow-100 text-yellow-700', label: statusName };
};

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const buildJournalEntryPayload = (formData, { isCreate = false } = {}) => {
  const payload = {
    entryDate: toApiDateTime(formData.entryDate),
    journalType: formData.journalType,
    description: formData.description || '',
    referenceNumber: formData.referenceNumber || '',
    financialPeriodID: Number(formData.financialPeriodID),
    statusID: Number(formData.statusID),
    currencyID: Number(formData.currencyID),
    exchangeRate: Number(formData.exchangeRate) || 1,
    details: formData.details.map((detail) => ({
      ...(detail.journalEntryDetailID
        ? { journalEntryDetailID: Number(detail.journalEntryDetailID) }
        : {}),
      accountID: Number(detail.accountID),
      costCenterID: toNullableNumber(detail.costCenterID),
      debitAmount: Number(detail.debitAmount) || 0,
      creditAmount: Number(detail.creditAmount) || 0,
      description: detail.description || '',
      recordDate: toApiDateTime(detail.recordDate),
      documentNumber: detail.documentNumber || '',
      customerID: toNullableNumber(detail.customerID),
      supplierID: toNullableNumber(detail.supplierID),
    })),
  };

  if (isCreate) {
    payload.sourceType = 'Manual';
    payload.sourceId = null;
  }

  return payload;
};

export const normalizeJournalEntriesResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};
