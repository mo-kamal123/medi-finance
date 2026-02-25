import { axiosInstance } from '../../../../app/api/axiosInstance';

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
