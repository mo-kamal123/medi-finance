import { useQuery } from '@tanstack/react-query';
import {
  getAllCheques,
  getChequeBanks,
  getChequeById,
  getChequeCustomers,
} from '../api/cheques.api';
import { chequesKeys } from './cheques.keys';

export const useCheques = (filters) => {
  return useQuery({
    queryKey: chequesKeys.lists(filters),
    queryFn: () => getAllCheques(filters),
    keepPreviousData: true,
  });
};

export const useCheque = (id) => {
  return useQuery({
    queryKey: chequesKeys.detail(id),
    queryFn: () => getChequeById(id),
    enabled: !!id,
  });
};

export const useChequeBanks = () => {
  return useQuery({
    queryKey: chequesKeys.banks(),
    queryFn: getChequeBanks,
  });
};

export const useChequeCustomers = () => {
  return useQuery({
    queryKey: chequesKeys.customers(),
    queryFn: getChequeCustomers,
  });
};
