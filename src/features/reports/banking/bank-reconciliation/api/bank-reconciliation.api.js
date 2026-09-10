import { axiosInstance } from '../../../../../app/api/axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getBankReconciliation = async (filters = {}) => {
  const { data } = await axiosInstance.get('/bank-reports/reconciliation', {
    params: cleanParams(filters),
  });
  return data;
};

export const getBankReconciliationExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/bank-reports/reconciliation/export-excel',
    {
      params: cleanParams(params),
      responseType: 'blob',
    }
  );
  return data;
};