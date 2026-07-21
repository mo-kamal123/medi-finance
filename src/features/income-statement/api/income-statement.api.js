import { axiosInstance } from '../../../app/api/axiosInstance';

export const getIncomeStatement = async (params = {}) => {
  const requestParams = {
    postedOnly: true,
    includeHeaderAccounts: true ,
    ...params,
  };

  if (!requestParams.fromDate) delete requestParams.fromDate;
  if (!requestParams.toDate) delete requestParams.toDate;
  if (!requestParams.financialPeriodId) delete requestParams.financialPeriodId;
  if (!requestParams.costCenterId) delete requestParams.costCenterId;

  const { data } = await axiosInstance.get('/reports/income-statement', {
    params: requestParams,
  });

  return data;
};

export const getIncomeStatementExportExcel = async (params = {}) => {
  const requestParams = {
    postedOnly: true,
    includeHeaderAccounts: true,
    ...params,
  };

  if (!requestParams.fromDate) delete requestParams.fromDate;
  if (!requestParams.toDate) delete requestParams.toDate;
  if (!requestParams.financialPeriodId) delete requestParams.financialPeriodId;
  if (!requestParams.costCenterId) delete requestParams.costCenterId;

  const { data } = await axiosInstance.get('/reports/income-statement/export-excel', {
    params: requestParams,
    responseType: 'blob',
  });

  return data;
};
