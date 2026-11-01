import { axiosInstance } from '../../../app/api/axiosInstance';

export const mapUser = (user) => ({
  ...user,
  id: String(user.userID),
  name: user.fullName ?? '',
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

// Only the paginated list endpoint is documented. Resolve direct user links
// through that endpoint rather than assuming a user-detail API exists.
export const findUser = async (id, signal) => {
  let pageNumber = 1;
  let response;
  do {
    response = await getUsers({ pageNumber, pageSize: 50 }, signal);
    const user = response.items.find((item) => item.id === String(id));
    if (user) return user;
    pageNumber += 1;
  } while (pageNumber <= response.totalPages);
  return null;
};
