import { useQuery } from '@tanstack/react-query';
import {
  getAllCommercialPapers,
  getCommercialPaperById,
} from '../api/commercial-papers.api';
import { commercialPapersKeys } from './commercial-papers.keys';

/* ===========================
   GET ALL
=========================== */
export const useCommercialPapers = (filters) => {
  return useQuery({
    queryKey: commercialPapersKeys.lists(filters),
    queryFn: () => getAllCommercialPapers(filters),
    keepPreviousData: true,
  });
};

/* ===========================
   GET BY ID
=========================== */
export const useCommercialPaper = (id) => {
  return useQuery({
    queryKey: commercialPapersKeys.detail(id),
    queryFn: () => getCommercialPaperById(id),
    enabled: !!id,
  });
};