import { axiosInstance } from '../../../../app/api/axiosInstance';

// Link account to cost center
export const linkAccountToCostCenter = async (body) => {
  const { data } = await axiosInstance.post('/AccountCostCenterLink', body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};
