import { axiosInstance } from '../../../../../app/api/axiosInstance';

const extractArray = (data) => {
  if (Array.isArray(data)) return data;
  if (!data || typeof data !== 'object') return [];
  const checks = ['data', 'items', 'list', '$values', 'records', 'rows', 'result'];
  for (const key of checks) {
    const val = data[key];
    if (Array.isArray(val)) return val;
    if (val && typeof val === 'object') {
      for (const sub of checks) {
        if (Array.isArray(val[sub])) return val[sub];
      }
    }
  }
  const found = Object.values(data).find(Array.isArray);
  return found || [];
};

// Get full tree
export const getCostTree = async () => {
  const response = await axiosInstance.get('cost-centers/tree');
  return response.data;
};

// Get by ID
export const getCostById = async (id) => {
  const response = await axiosInstance.get(`cost-centers/${id}`);
  return response.data;
};

// Search cost centers
export const searchCostCenters = async (params = {}) => {
  const { data } = await axiosInstance.get('/cost-centers/search', { params });
  return extractArray(data);
};

// Create cost center
export const createCost = async (formData) => {
  const { data } = await axiosInstance.post('/cost-centers', formData, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};

// Update cost center
export const updateCost = async ({ body }) => {
  const { data } = await axiosInstance.post(`/cost-centers`, body, {
    headers: { 'Content-Type': 'application/json' },
  });
  return data;
};
