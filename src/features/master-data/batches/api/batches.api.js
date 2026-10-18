import { axiosInstance } from '../../../../app/api/axiosInstance';

export const getBatchStatuses = async () => {
  const { data: response } = await axiosInstance.get('/batches/statuses');
  if (response?.success === false) {
    throw new Error(response.message || 'تعذر تحميل حالات الدفعات');
  }
  const statuses = response?.data ?? response;
  if (!Array.isArray(statuses)) {
    throw new Error('تعذر قراءة حالات الدفعات');
  }
  return statuses;
};

export const getAllBatches = async ({ pageNumber = 1, pageSize = 20, search, status, fromDate, toDate } = {}) => {
  const params = Object.fromEntries(
    Object.entries({ search, status, fromDate, toDate, pageNumber, pageSize }).filter(([, value]) => value !== '' && value != null)
  );
  const { data: response } = await axiosInstance.get('/batches', { params });
  if (response?.success === false) {
    throw new Error(response.message || 'تعذر تحميل الدفعات');
  }
  const data = response?.data ?? response;
  const items = Array.isArray(data) ? data : data?.items ?? data?.batches;
  if (!Array.isArray(items)) {
    throw new Error('تعذر قراءة بيانات الدفعات');
  }
  const totalCount = data?.totalCount ?? response?.totalCount ?? items.length;
  return {
    items,
    totalCount,
    totalPages: Math.max(1, data?.totalPages ?? response?.totalPages ?? Math.ceil(totalCount / pageSize)),
    pageNumber: data?.pageNumber ?? response?.pageNumber ?? pageNumber,
    pageSize: data?.pageSize ?? response?.pageSize ?? pageSize,
  };
};
