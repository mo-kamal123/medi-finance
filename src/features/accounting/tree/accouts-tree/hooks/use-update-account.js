import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAccount } from '../api/accounts-tree';
import { getErrorMessage, toast } from '../../../../../shared/lib/toast';

const useUpdateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAccount,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
        refetchType: 'all',
      });
      queryClient.invalidateQueries({
        queryKey: ['account', variables.id],
        refetchType: 'all',
      });
      toast.success('تم تحديث الحساب بنجاح');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'تعذر تحديث الحساب'));
    },
  });
};

export default useUpdateAccount;
