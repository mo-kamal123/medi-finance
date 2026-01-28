import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auh-api';
import { addToLocalStorage } from '../../../shared/utils/local-storage-actions';

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
        addToLocalStorage('token', data.token)
        console.log('data');
    }
  });
};
