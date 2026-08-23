import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCost } from '../api/cost-tree';

const useUpdateCost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCost,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['cost-tree']);
      queryClient.invalidateQueries(['cost-center', variables.id]);
      alert('تم تحديث مركز التكلفة بنجاح');
    },
    onError: (err) => {
      console.error(err);
      alert('فشل تحديث مركز التكلفة');
    },
  });
};

export default useUpdateCost;
