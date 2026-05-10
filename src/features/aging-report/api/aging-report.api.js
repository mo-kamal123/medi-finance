import { axiosInstance } from '../../../app/api/axiosInstance';

export const getAgingReport = async (filters = {}) => {
  const cleanedParams = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

  const { data } = await axiosInstance.get('/aging-report', {
    params: cleanedParams,
  });

  return data;
};
