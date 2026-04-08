import { axiosInstance } from '../../../app/api/axiosInstance';

export const getJournalEntries = async (params = {}) => {
  const { data } = await axiosInstance.get('/journal-entries', {
    params: {
      pageNumber: 1,
      pageSize: 100,
      ...params,
    },
  });
  return data;
};

export const getJournalEntryById = async (id) => {
  const { data } = await axiosInstance.get(`/journal-entries/${id}`);
  return data;
};

export const createJournalEntry = async (payload) => {
  const { data } = await axiosInstance.post('/journal-entries', payload);
  return data;
};

export const updateJournalEntry = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(`/journal-entries/${id}`, payload);
  return data;
};
