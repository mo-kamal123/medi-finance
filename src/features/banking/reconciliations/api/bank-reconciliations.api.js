import { axiosInstance } from '../../../../app/api/axiosInstance';

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const checks = ['data', 'items', 'list', '$values', 'records', 'rows', 'result'];
  for (const key of checks) {
    const val = data[key];
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
      for (const sub of checks) {
        if (Array.isArray(val[sub])) return val[sub];
      }
    }
  }
  const found = Object.values(data).find(Array.isArray);
  return found || [];
};

const normalizePaged = (data, fallbackPageSize = 20) => {
  const items = extractArray(data);
  return {
    items,
    totalCount: Number(data?.totalCount ?? items.length) || 0,
    pageNumber: Number(data?.pageNumber ?? 1) || 1,
    pageSize: Number(data?.pageSize ?? fallbackPageSize) || fallbackPageSize,
  };
};

const cleanParams = (params = {}) => {
  const cleaned = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

// GET /bank-reconciliations (list with filters)
export const getBankReconciliations = async (params = {}) => {
  const { data } = await axiosInstance.get('/bank-reconciliations', {
    params: cleanParams({ pageNumber: 1, pageSize: 20, ...params }),
  });
  // API may return a plain array or a paged object
  if (Array.isArray(data)) {
    return {
      items: data,
      totalCount: data.length,
      pageNumber: Number(params.pageNumber ?? 1) || 1,
      pageSize: Number(params.pageSize ?? 20) || 20,
    };
  }
  return normalizePaged(data, params.pageSize ?? 20);
};

// POST /bank-reconciliations (create)
export const createBankReconciliation = async (payload) => {
  const { data } = await axiosInstance.post('/bank-reconciliations', payload);
  return data;
};

// GET /bank-reconciliations/{id} (details)
export const getBankReconciliationById = async (id) => {
  const { data } = await axiosInstance.get(`/bank-reconciliations/${id}`);
  return data;
};

// GET /bank-reconciliations/{id}/items
export const getReconciliationItems = async (id, params = {}) => {
  const { data } = await axiosInstance.get(`/bank-reconciliations/${id}/items`, {
    params: cleanParams(params),
  });
  return extractArray(data);
};

// POST /bank-reconciliations/{id}/items/{itemId}/match
export const matchReconciliationItem = async ({ reconciliationId, itemId, bankTransactionId }) => {
  const { data } = await axiosInstance.post(
    `/bank-reconciliations/${reconciliationId}/items/${itemId}/match`,
    { bankTransactionId: Number(bankTransactionId) }
  );
  return data;
};

// POST /bank-reconciliations/{id}/items/{itemId}/unmatch
export const unmatchReconciliationItem = async ({ reconciliationId, itemId }) => {
  const { data } = await axiosInstance.post(
    `/bank-reconciliations/${reconciliationId}/items/${itemId}/unmatch`
  );
  return data;
};

// POST /bank-reconciliations/{id}/items/{itemId}/ignore
export const ignoreReconciliationItem = async ({ reconciliationId, itemId, notes = '' }) => {
  const { data } = await axiosInstance.post(
    `/bank-reconciliations/${reconciliationId}/items/${itemId}/ignore`,
    { notes }
  );
  return data;
};

// POST /bank-reconciliations/{id}/finalize
export const finalizeReconciliation = async (id) => {
  const { data } = await axiosInstance.post(`/bank-reconciliations/${id}/finalize`);
  return data;
};

// POST /bank-reconciliations/{id}/reconcile (legacy compat, reconciliationId only)
export const reconcileLegacy = async (id) => {
  const { data } = await axiosInstance.post(`/bank-reconciliations/${id}/reconcile`);
  return data;
};
