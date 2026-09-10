import { axiosInstance } from '../../../../../app/api/axiosInstance';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

export const getBankTransfersReport = async (filters = {}) => {
  const { data } = await axiosInstance.get('/bank-reports/transfers', {
    params: cleanParams(filters),
  });
  return data;
};

export const getBankTransfersReportExportExcel = async (params = {}) => {
  const { data } = await axiosInstance.get(
    '/bank-reports/transfers/export-excel',
    {
      params: cleanParams(params),
      responseType: 'blob',
    }
  );
  return data;
};