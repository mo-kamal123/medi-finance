import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createCommercialPaper,
  updateCommercialPaper,
  deleteCommercialPaper,
} from '../api/commercial-papers.api';
import { commercialPapersKeys } from './commercial-papers.keys';

/* ===========================
   CREATE
=========================== */
export const useCreateCommercialPaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCommercialPaper,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commercialPapersKeys.lists(),
      });
    },
  });
};

/* ===========================
   UPDATE
=========================== */
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
    },
  });
};

/* ===========================
   DELETE
=========================== */
export const useDeleteCommercialPaper = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCommercialPaper,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commercialPapersKeys.lists(),
      });
    },
  });
};