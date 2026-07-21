import { axiosInstance } from '../../../app/api/axiosInstance';

export const getBalanceSheet = async (params = {}) => {
  const requestParams = {
    includeHeaderAccounts: true,
    ...params,
  };

  if (!requestParams.asOfDate) delete requestParams.asOfDate;
  if (!requestParams.financialPeriodId) delete requestParams.financialPeriodId;
  if (!requestParams.costCenterId) delete requestParams.costCenterId;
  if (!requestParams.filterByCostCenter) delete requestParams.filterByCostCenter;

  const { data } = await axiosInstance.get('/reports/balance-sheet', {
    params: requestParams,
  });

  return data;
};

export const getBalanceSheetExportExcel = async (params = {}) => {
  const requestParams = {
    includeHeaderAccounts: true,
    ...params,
  };

  if (!requestParams.asOfDate) delete requestParams.asOfDate;
  if (!requestParams.financialPeriodId) delete requestParams.financialPeriodId;
  if (!requestParams.costCenterId) delete requestParams.costCenterId;
  if (!requestParams.filterByCostCenter) delete requestParams.filterByCostCenter;

  const { data } = await axiosInstance.get('/reports/balance-sheet/export-excel', {
    params: requestParams,
    responseType: 'blob',
  });

  return data;
};
