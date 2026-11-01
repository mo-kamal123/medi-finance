import { useQuery, useQueryClient } from '@tanstack/react-query';
import { findUser, getUsers } from '../api/users.api';

export const useUsers = (params) =>
  useQuery({
    queryKey: ['users', 'list', params],
    queryFn: ({ signal }) => getUsers(params, signal),
  });

export const useUser = (id) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['users', 'detail', id],
    queryFn: ({ signal }) => findUser(id, signal),
    enabled: Boolean(id) && !id.startsWith('USR-'),
    initialData: () =>
      queryClient
        .getQueriesData({ queryKey: ['users', 'list'] })
        .flatMap(([, response]) => response?.items ?? [])
        .find((user) => user.id === id),
    staleTime: 30_000,
  });
};
