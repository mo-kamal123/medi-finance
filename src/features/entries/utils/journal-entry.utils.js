import { buildTree } from '../../tree/utils/buildTree';

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

const toApiNumber = (value, defaultValue = 0) => {
  if (value === '' || value === null || value === undefined) return defaultValue;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? defaultValue : parsed;
};

const toNullableApiNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || parsed === 0) return null;
  return parsed;
};

export const normalizeTreeCollection = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.items)) return value.items;
  return [];
};

const getFinalNodes = (nodes = []) => {
  let finalNodes = [];

  nodes.forEach((node) => {
    if (node.isFinal) finalNodes.push(node);
    if (node.children?.length) {
      finalNodes = finalNodes.concat(getFinalNodes(node.children));
    }
  });

  return finalNodes;
};

const isNestedTree = (nodes = []) =>
  nodes.some((node) => Array.isArray(node.children));

const resolveTreeRoots = (collection, { idKey, parentKey, sortKey }) => {
  const roots = normalizeTreeCollection(collection);
  if (!roots.length) return [];

  if (isNestedTree(roots)) {
    return roots;
  }

  return buildTree(roots, { idKey, parentKey, sortKey });
};

export const buildAccountOptions = (accountsTree = []) => {
  const treeData = resolveTreeRoots(accountsTree, {
    idKey: 'id',
    parentKey: 'parentID',
    sortKey: 'accountCode',
  });

  const seen = new Set();

  return getFinalNodes(treeData)
    .map((account) => {
      const accountId = account.accountID ?? account.id;
      if (accountId === undefined || accountId === null || accountId === '') {
        return null;
      }

      const value = String(accountId);
      if (seen.has(value)) return null;
      seen.add(value);

      return {
        value,
        label: `${account.accountCode || ''} - ${account.nameAr || account.nameEn || ''}`,
      };
    })
    .filter(Boolean);
};

export const buildCostCenterOptions = (costTree = []) => {
  const treeData = resolveTreeRoots(costTree, {
    idKey: 'id',
    parentKey: 'parentID',
    sortKey: 'ccCode',
  });

  const seen = new Set();

  return getFinalNodes(treeData)
    .map((center) => {
      const centerId = center.costCenterID ?? center.id;
      if (centerId === undefined || centerId === null || centerId === '') {
        return null;
      }

      const value = String(centerId);
      if (seen.has(value)) return null;
      seen.add(value);

      return {
        value,
        label: `${center.costCenterCode || center.ccCode || ''} - ${center.nameAr || center.nameEn || ''}`,
      };
    })
    .filter(Boolean);
};

export const withCurrentOption = (options, value, label) => {
  if (!value) return options;

  const stringValue = String(value);
  if (options.some((option) => option.value === stringValue)) {
    return options;
  }

  return [
    {
      value: stringValue,
      label: label || stringValue,
    },
    ...options,
  ];
};

export const buildPartyOptions = (
  parties = [],
  { idKey, nameArKey, nameEnKey }
) => {
  const list = normalizeTreeCollection(parties);

  return list
    .map((party) => {
      const partyId = party[idKey] ?? party.id;
      if (partyId === undefined || partyId === null || partyId === '') {
        return null;
      }

      return {
        value: String(partyId),
        label: party[nameArKey] || party[nameEnKey] || '',
      };
    })
    .filter(Boolean);
};

export const buildJournalEntryPayload = (formData, { isCreate = false } = {}) => {
  const payload = {
    entryDate: toApiDateTime(formData.entryDate),
    journalType: formData.journalType,
    description: formData.description || '',
    referenceNumber: formData.referenceNumber || '',
    financialPeriodID: toApiNumber(formData.financialPeriodID),
    statusID: toApiNumber(formData.statusID),
    currencyID: toApiNumber(formData.currencyID),
    exchangeRate: toApiNumber(formData.exchangeRate, 1),
    details: formData.details.map((detail) => ({
      ...(detail.journalEntryDetailID
        ? { journalEntryDetailID: Number(detail.journalEntryDetailID) }
        : {}),
      accountID: toApiNumber(detail.accountID),
      costCenterID: toApiNumber(detail.costCenterID),
      debitAmount: toApiNumber(detail.debitAmount),
      creditAmount: toApiNumber(detail.creditAmount),
      description: detail.description || '',
      recordDate: toApiDateTime(detail.recordDate || formData.entryDate),
      documentNumber: detail.documentNumber || '',
      customerID: toNullableApiNumber(detail.customerID),
      supplierID: toNullableApiNumber(detail.supplierID),
    })),
  };

  if (isCreate) {
    payload.sourceType = 'Manual';
    payload.sourceId = 1;
  }

  return payload;
};

export const normalizeJournalEntriesResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};
