import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getCustomers, getCustomerById } from '../api/customers.api';
import { customersKeys } from './customers.keys';

export const useCustomers = (filters) =>
  useQuery({
    queryKey: customersKeys.lists(filters),
    queryFn: () => getCustomers(filters),
    placeholderData: keepPreviousData,
  });

export const useCustomer = (id) =>
  useQuery({
    queryKey: customersKeys.detail(id),
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });
