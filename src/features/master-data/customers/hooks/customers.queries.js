import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getCustomers, getCustomerById, getCustomerPolicies, getCustomerCategories } from '../api/customers.api';
import { customersKeys } from './customers.keys';

export const useCustomerCategories = () =>
  useQuery({
    queryKey: ['lookups', 'customer-categories'],
    queryFn: getCustomerCategories,
  });

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

export const useCustomerPolicies = (id, isWithWataniya = true) =>
  useQuery({
    queryKey: customersKeys.policies(id, isWithWataniya),
    queryFn: ({ signal }) => getCustomerPolicies(id, signal, isWithWataniya),
  });
