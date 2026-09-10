import { axiosInstance } from '../../../../../app/api/axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getBankBalances = async (filters = {}) => {
  const { data } = await axiosInstance.get('/bank-reports/balances', {
    params: cleanParams(filters),
  });
  return data;
};

export const getBankBalancesExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/bank-reports/balances/export-excel',
    {
      params: cleanParams(params),
      responseType: 'blob',
    }
  );
  return data;
};