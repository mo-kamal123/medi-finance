import { axiosInstance } from '../../../../../app/api/axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getBankChequesSummary = async (filters = {}) => {
  const { data } = await axiosInstance.get('/bank-reports/cheques/summary', {
    params: cleanParams(filters),
  });
  return data;
};

export const getBankChequesSummaryExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/bank-reports/cheques/summary/export-excel',
    {
      params: cleanParams(params),
      responseType: 'blob',
    }
  );
  return data;
};