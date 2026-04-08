import { axiosInstance } from '../../../app/api/axiosInstance';

export const getBalanceSheet = async (params = {}) => {
  const requestParams = {
    ...params,
  };

  if (!requestParams.asOfDate) {
    delete requestParams.asOfDate;
  }

  if (!requestParams.financialPeriodId) {
    delete requestParams.financialPeriodId;
  }

  const { data } = await axiosInstance.get('/reports/balance-sheet', {
    params: requestParams,
  });

  return data;
};
