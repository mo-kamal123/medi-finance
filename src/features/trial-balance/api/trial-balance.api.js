import { axiosInstance } from '../../../app/api/axiosInstance';

const buildParams = (params = {}) => {
  const p = {
    includeOpeningBalance: true,
    ...params,
  };
  if (!p.financialPeriodId) delete p.financialPeriodId;
  if (!p.fromDate) delete p.fromDate;
  if (!p.toDate) delete p.toDate;
  if (!p.costCenterId) delete p.costCenterId;
  if (!p.filterByCostCenter) delete p.filterByCostCenter;
  delete p.includeOpeningBalance;
  p.includeOpeningBalance = true;
  return p;
};

const unwrapAccounts = (data) => {
  if (data && Array.isArray(data.accounts)) return data;
  if (Array.isArray(data)) return { accounts: data, totalAggregatedDebit: 0, totalAggregatedCredit: 0, totalCount: data.length };
  return { accounts: [], totalAggregatedDebit: 0, totalAggregatedCredit: 0, totalCount: 0 };
};

export const getTrialBalanceRoots = async (params = {}) => {
  const { data } = await axiosInstance.get('/reports/trial-balance/roots', {
    params: buildParams(params),
  });
  return unwrapAccounts(data);
};

export const getTrialBalanceChildren = async (accountId, params = {}) => {
  const { data } = await axiosInstance.get(
    `/reports/trial-balance/${accountId}/children`,
    { params: buildParams(params) }
  );
  const result = unwrapAccounts(data);
  return result.accounts;
};

export const getTrialBalanceExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get('/reports/trial-balance/export-excel', {
    params: buildParams(params),
    responseType: 'blob',
  });
  return data;
};
