import { axiosInstance } from '../../../app/api/axiosInstance';

// Get journal entries with fixed pagination
export const getJournalEntries = async () => {
  const { data } = await axiosInstance.get(
    'https://mgm.mediconsulteg.com/api/journal-entries',
    {
      params: {
        pageNumber: 1,
        pageSize: 100,
      },
    }
  );
  return data;
};