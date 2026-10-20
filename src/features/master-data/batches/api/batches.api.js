import { axiosInstance } from '../../../../app/api/axiosInstance';

export const updateBatchStatus = async ({ batchNumber, statusID }) => {
  const number = String(batchNumber ?? '').trim();
  if (!number) throw new Error('تعذر تحديد رقم الدفعة');
  const { data } = await axiosInstance.patch(`/batches/${encodeURIComponent(number)}/status`, { statusID });
  if (data?.success === false) {
    throw new Error(data.message || 'تعذر تحديث حالة الدفعة');
  }
  return data;
};

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
