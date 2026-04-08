import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCommercialPaper,
  deleteCommercialPaper,
  updateCommercialPaper,
} from '../api/commercial-papers.api';
import { commercialPapersKeys } from './commercial-papers.keys';
import { getErrorMessage, toast } from '../../../shared/lib/toast';

export const useCreateCommercialPaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommercialPaper,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commercialPapersKeys.lists(),
      });
      toast.success('تم إنشاء الورقة التجارية بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر إنشاء الورقة التجارية'));
    },
  });
};

export const useUpdateCommercialPaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCommercialPaper,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: commercialPapersKeys.lists(),
      });

      if (variables?.id) {
        queryClient.invalidateQueries({
          queryKey: commercialPapersKeys.detail(variables.id),
        });
      }

      toast.success('تم تحديث الورقة التجارية بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر تحديث الورقة التجارية'));
    },
  });
};

export const useDeleteCommercialPaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommercialPaper,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commercialPapersKeys.lists(),
      });
      toast.success('تم حذف الورقة التجارية بنجاح');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'تعذر حذف الورقة التجارية'));
    },
  });
};
