import { useQuery } from '@tanstack/react-query';
import { getAccountRoots } from '../api/accounts-tree';

const useAccountRoots = (params = {}) => {
  return useQuery({
    queryKey: ['accounts', 'roots', params],
    queryFn: () => getAccountRoots(params),
  });
};

export default useAccountRoots;
