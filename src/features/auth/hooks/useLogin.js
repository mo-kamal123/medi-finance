import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auh-api';
import { addToLocalStorage } from '../../../shared/utils/local-storage-actions';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/auth-slice';

export const useLogin = () => {
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      const { token, username, fullName } = data.data;
      const user = { username, fullName };

      addToLocalStorage('token', token);
      addToLocalStorage('user', JSON.stringify(user));
      dispatch(setCredentials({ user, token }));
    },
  });
};
