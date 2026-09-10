import { axiosInstance } from '../../../../../app/api/axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getOutstandingCheques = async (filters = {}) => {
  const { data } = await axiosInstance.get('/bank-reports/outstanding-cheques', {
    params: cleanParams(filters),
  });
  return data;
};

export const getOutstandingChequesExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/bank-reports/outstanding-cheques/export-excel',
    {
      params: cleanParams(params),
      responseType: 'blob',
    }
  );
  return data;
};