import { axiosInstance } from '../../../../../app/api/axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getBankChequesReport = async (filters = {}) => {
  const { data } = await axiosInstance.get('/bank-reports/cheques', {
    params: cleanParams(filters),
  });
  return data;
};

export const getBankChequesReportExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/bank-reports/cheques/export-excel',
    {
      params: cleanParams(params),
      responseType: 'blob',
    }
  );
  return data;
};