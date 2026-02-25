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
      addToLocalStorage('token', data.data.token);
      dispatch(setCredentials({user:{name: 'mostafa'}, token:data.data.token}))
      console.log(data.data.token);
    },
  });
};
