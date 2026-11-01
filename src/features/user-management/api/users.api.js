import { axiosInstance } from '../../../app/api/axiosInstance';

export const mapUser = (user) => ({
  ...user,
  id: String(user.userID),
  name: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.fullName || '',
  status: user.isActive ? 'active' : 'inactive',
});

export const getUsers = async (
  { pageNumber = 1, pageSize = 10 } = {},
  signal
) => {
  const { data } = await axiosInstance.get('/Users', {
    params: { pageNumber, pageSize },
    signal,
  });
  return {
    items: (Array.isArray(data.data) ? data.data : []).map(mapUser),
    totalCount: data.totalCount ?? 0,
    pageNumber: data.pageNumber ?? pageNumber,
    pageSize: data.pageSize ?? pageSize,
    totalPages: data.totalPages ?? 1,
  };
};

export const getUser = async (id, signal) => {
  const { data } = await axiosInstance.get(`/users/${encodeURIComponent(id)}`, {
    signal,
  });
  const user = data.data ?? data;
  return user ? mapUser(user) : null;
};
