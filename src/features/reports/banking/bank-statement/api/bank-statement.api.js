import { axiosInstance } from '../../../../../app/api/axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getBankStatement = async (filters = {}) => {
  const { data } = await axiosInstance.get('/bank-reports/statement', {
    params: cleanParams(filters),
  });
  return data;
};

export const getBankStatementExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/bank-reports/statement/export-excel',
    {
      params: cleanParams(params),
      responseType: 'blob',
    }
  );
  return data;
};