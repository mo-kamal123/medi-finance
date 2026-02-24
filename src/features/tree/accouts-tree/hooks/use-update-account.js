import { useMutation } from '@tanstack/react-query';
import { updateAccount } from '../api/accounts-tree';

// 🔹 Update
const useUpdateAccount = () => {
  return useMutation({
    mutationFn: updateAccount,
    onSuccess: (data) => {
      console.log(data);
    },
  });
};

export default useUpdateAccount;
