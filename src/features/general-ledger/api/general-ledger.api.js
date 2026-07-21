import { axiosInstance } from '../../../app/api/axiosInstance';

export const getGeneralLedger = async (filters) => {
  const cleanedParams = Object.fromEntries(
    Object.entries(filters || {}).filter(
      ([_, value]) => value !== '' && value !== null && value !== undefined
    )
  );

  const { data } = await axiosInstance.get('/general-ledger/report', {
    params: cleanedParams,
  });

  return data;
};

export const getGeneralLedgerExportExcel = async (filters) => {
  const cleanedParams = Object.fromEntries(
    Object.entries(filters || {}).filter(
      ([_, value]) => value !== '' && value !== null && value !== undefined
    )
  );

  const { data } = await axiosInstance.get('/general-ledger/export-excel', {
    params: cleanedParams,
    responseType: 'blob',
  });

  return data;
};
