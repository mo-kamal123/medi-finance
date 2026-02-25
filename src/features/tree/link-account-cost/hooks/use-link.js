import { useMutation } from '@tanstack/react-query';
import { linkAccountToCostCenter } from '../api/link-api';

const useLinkAccountCostCenter = () => {
  return useMutation({
    mutationFn: linkAccountToCostCenter,
    onSuccess: (data) => {
      alert('تم ربط الحساب بالمركز بنجاح!');
      console.log('Link success:', data);
    },
    onError: (error) => {
      alert('فشل الربط! تحقق من البيانات.');
      console.error('Link error:', error);
    },
  });
};

export default useLinkAccountCostCenter;
