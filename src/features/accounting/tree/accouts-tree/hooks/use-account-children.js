import { useQuery } from '@tanstack/react-query';
import { getAccountChildren } from '../api/accounts-tree';

const useAccountChildren = (parentId) => {
  return useQuery({
    queryKey: ['accounts', 'children', parentId],
    queryFn: () => getAccountChildren(parentId),
    enabled: !!parentId,
  });
};

export default useAccountChildren;
