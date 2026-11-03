import { axiosInstance } from '../../../app/api/axiosInstance';

export const getRoles = async (signal) => {
  const { data } = await axiosInstance.get('/roles', {
    headers: { Accept: '*/*' },
    signal,
  });
  if (!Array.isArray(data)) {
    throw new Error('Invalid roles response');
  }

  return data.map((role) => ({
    ...role,
    status: role.isActive ? 'active' : 'inactive',
  }));
};

const getRolePath = (id) => `/roles/${encodeURIComponent(id)}`;

export const getRole = async (id, signal) => {
  const { data } = await axiosInstance.get(getRolePath(id), {
    headers: { Accept: '*/*' },
    signal,
  });
  if (!Array.isArray(data?.permissionCodes)) {
    throw new Error('Invalid role response');
  }
  return data;
};

export const getPermissionModules = async (signal) => {
  const { data } = await axiosInstance.get('/permissions/modules', {
    headers: { Accept: '*/*' },
    signal,
  });
  if (!Array.isArray(data)) {
    throw new Error('Invalid permission modules response');
  }
  return data;
};

export const saveRole = (id, values) =>
  id
    ? axiosInstance.put(getRolePath(id), values)
    : axiosInstance.post('/roles', values);
