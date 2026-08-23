import { axiosInstance } from '../../../../../app/api/axiosInstance';

export const getAgingReport = async (filters = {}) => {
  const cleanedParams = Object.fromEntries(
    Object.entries(filters).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

  const { data } = await axiosInstance.get('/reports/aging-report', {
    params: cleanedParams,
  });

  return data;
};

export const getAgingReportExportExcel = async (params = {}) => {
  const cleanedParams = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== '' && value !== null && value !== undefined
    )
  );

  const { data } = await axiosInstance.get('/reports/aging-report/export-excel', {
    params: cleanedParams,
    responseType: 'blob',
  });

  return data;
};

export const getProviderClasses = async () => {
  const { data } = await axiosInstance.get('/lookups/provider-classes');
  return Array.isArray(data) ? data : [];
};

export const getImportanceLevels = async () => {
  const { data } = await axiosInstance.get('/lookups/importance-levels');
  return Array.isArray(data) ? data : [];
};

export const getSupplierStatuses = async () => {
  const { data } = await axiosInstance.get('/lookups/supplier-statuses');
  return Array.isArray(data) ? data : [];
};

export const getCustomerCategories = async () => {
  const { data } = await axiosInstance.get('/lookups/customer-categories');
  return Array.isArray(data) ? data : [];
};

export const getCustomerStatuses = async () => {
  const { data } = await axiosInstance.get('/lookups/customer-statuses');
  return Array.isArray(data) ? data : [];
};
