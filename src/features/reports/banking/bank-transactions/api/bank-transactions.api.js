import { axiosInstance } from '../../../../../app/api/axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getBankTransactionsReport = async (filters = {}) => {
  const { data } = await axiosInstance.get('/bank-reports/transactions', {
    params: cleanParams(filters),
  });
  return data;
};

export const getBankTransactionsReportExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/bank-reports/transactions/export-excel',
    {
      params: cleanParams(params),
      responseType: 'blob',
    }
  );
  return data;
};