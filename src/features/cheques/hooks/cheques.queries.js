import { useQuery, keepPreviousData } from '@tanstack/react-query';
import {
  getAllCheques,
  getChequeById,
  getChequeBanks,
  getChequeCustomers,
  getChequeStatuses,
  getPendingCheques,
  getSupplierList,
  getCurrencies,
} from '../api/cheques.api';
import { chequesKeys } from './cheques.keys';

export const useCheques = (filters) => {
  return useQuery({
    queryKey: chequesKeys.lists(filters),
    queryFn: () => getAllCheques(filters),
    placeholderData: keepPreviousData,
  });
};

export const useCheque = (id) => {
  return useQuery({
    queryKey: chequesKeys.detail(id),
    queryFn: () => getChequeById(id),
    enabled: !!id,
  });
};

export const useChequeStatuses = () => {
  return useQuery({
    queryKey: chequesKeys.statuses(),
    queryFn: getChequeStatuses,
  });
};

export const usePendingCheques = (params) => {
  return useQuery({
    queryKey: chequesKeys.pending(params),
    queryFn: () => getPendingCheques(params),
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

export const useChequeSuppliers = () => {
  return useQuery({
    queryKey: chequesKeys.suppliers(),
    queryFn: getSupplierList,
  });
};

export const useChequeCurrencies = () => {
  return useQuery({
    queryKey: chequesKeys.currencies(),
    queryFn: getCurrencies,
  });
};
