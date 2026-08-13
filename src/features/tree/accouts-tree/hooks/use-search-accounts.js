import { useQuery } from '@tanstack/react-query';
import { searchAccounts } from '../api/accounts-tree';

const useSearchAccounts = ({ searchText = '', accountType = undefined }) => {
  const query = searchText.trim();

  return useQuery({
    queryKey: ['accounts', 'search', { searchText: query, accountType }],
    queryFn: () =>
      searchAccounts({
        searchText: query,
        accountType: accountType && accountType !== 'all' ? accountType : undefined,
      }),
    enabled: query.length > 0,
  });
};

export default useSearchAccounts;
