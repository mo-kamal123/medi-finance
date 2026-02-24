import { useMutation } from '@tanstack/react-query';
import { createAccount } from '../api/accounts-tree';

const useCreateAccount = () => {
  return useMutation({
    mutationFn: createAccount,
    onSuccess: (data) => {
      console.log('Account created:', data);
      alert('تم إنشاء الحساب بنجاح!');
    },
    onError: (err) => {
      console.error('Create failed:', err);
      alert('فشل إنشاء الحساب. تحقق من البيانات.');
    },
  });
};

export default useCreateAccount;