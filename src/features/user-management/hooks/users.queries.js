import { useQuery } from '@tanstack/react-query';
import { getUser, getUsers } from '../api/users.api';

export const useUsers = (params) =>
  useQuery({
    queryKey: ['users', 'list', params],
    queryFn: ({ signal }) => getUsers(params, signal),
  });

export const useUser = (id) => {
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: ({ signal }) => getUser(id, signal),
    enabled: Boolean(id) && !id.startsWith('USR-'),
    staleTime: 30_000,
  });
};
