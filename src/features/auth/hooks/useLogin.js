import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auh-api';
import { addToLocalStorage } from '../../../shared/utils/local-storage-actions';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/auth-slice';
import { toast } from '../../../shared/lib/toast';

export const useLogin = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const { token, mobileNumber, firstName, lastName, roles } = data.data;
      const fullName = [firstName, lastName].filter(Boolean).join(' ');
      const user = { mobileNumber, firstName, lastName, fullName, roles };

      addToLocalStorage('token', token);
      addToLocalStorage('user', JSON.stringify(user));
      dispatch(setCredentials({ user, token }));
      toast.success('تم تسجيل الدخول بنجاح');
    },
  });
};
