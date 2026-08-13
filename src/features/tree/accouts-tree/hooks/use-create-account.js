import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAccount } from '../api/accounts-tree';
import { getErrorMessage, toast } from '../../../../shared/lib/toast';

const useCreateAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['accounts'],
        refetchType: 'all',
      });
      toast.success('تم إنشاء الحساب بنجاح');
    },
    onError: (err) => {
      toast.error(getErrorMessage(err, 'تعذر إنشاء الحساب. تحقق من البيانات.'));
    },
  });
};

export default useCreateAccount;
