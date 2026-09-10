import { axiosInstance } from '../../../../../app/api/axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getBankCashFlow = async (filters = {}) => {
  const { data } = await axiosInstance.get('/bank-reports/cash-flow', {
    params: cleanParams(filters),
  });
  return data;
};

export const getBankCashFlowExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/bank-reports/cash-flow/export-excel',
    {
      params: cleanParams(params),
      responseType: 'blob',
    }
  );
  return data;
};