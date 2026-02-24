import { useQuery } from '@tanstack/react-query';
import { getAccountsTree } from '../api/accounts-tree';

const useAccountsTree = () => {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: getAccountsTree,
  });
};

export default useAccountsTree;
