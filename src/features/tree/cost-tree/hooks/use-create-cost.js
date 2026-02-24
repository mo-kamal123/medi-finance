import { useMutation } from '@tanstack/react-query';
import { createCost } from '../api/cost-tree';

const useCreateCost = () => {
  return useMutation({
    mutationFn: createCost,
    onSuccess: (data) => {
      console.log('Cost created:', data);
      alert('تم إنشاء مركز التكلفه بنجاح!');
    },
    onError: (err) => {
      console.error('Create failed:', err);
      alert('فشل إنشاء المركز. تحقق من البيانات.');
    },
  });
};

export default useCreateCost;