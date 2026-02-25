import { useQuery } from '@tanstack/react-query';
import { getCostTree } from '../api/cost-tree';

const useCostTree = () => {
  return useQuery({
    queryKey: ['cost'],
    queryFn: getCostTree,
  });
};

export default useCostTree;
