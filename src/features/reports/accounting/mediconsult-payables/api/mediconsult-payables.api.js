import { axiosInstance } from '../../../../../app/api/axiosInstance';

export const getMediconsultPayables = async (
  pageNumber,
  pageSize,
  filters,
  signal
) => {
  const params = Object.fromEntries(
    Object.entries(filters)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value !== '')
  );
  if (params.FromDate) params.FromDate += 'T00:00:00';
  if (params.ToDate) params.ToDate += 'T23:59:59.999';
  if (params.SupplierId) params.SupplierId = Number(params.SupplierId);

  const { data } = await axiosInstance.get('/reports/mediconsult-payables', {
    params: { ...params, PageNumber: pageNumber, PageSize: pageSize },
    signal,
  });

  if (!Array.isArray(data?.data)) {
    throw new Error('Invalid Mediconsult payables response');
  }

  return data;
};
