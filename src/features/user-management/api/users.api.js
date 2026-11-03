import { axiosInstance } from '../../../app/api/axiosInstance';

export const mapUser = (user) => ({
  ...user,
  id: String(user.userID),
  name:
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.fullName ||
    '',
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

const userPath = (id) => `/users/${encodeURIComponent(id)}`;

export const getUser = async (id, signal) => {
  const { data } = await axiosInstance.get(userPath(id), {
    signal,
  });
  const user = data?.data ?? data;
  return user ? mapUser(user) : null;
};

export const createUser = (values) => axiosInstance.post('/users', values);

export const updateUser = (id, values) =>
  axiosInstance.put(userPath(id), values);
