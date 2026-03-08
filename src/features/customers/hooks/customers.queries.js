import { useQuery } from "@tanstack/react-query";
import { getCustomers, getCustomerById } from "../api/customers.api";
import { customersKeys } from "./customers.keys";

export const useCustomers = () =>
  useQuery({
    queryKey: customersKeys.lists(),
    queryFn: getCustomers,
  });

export const useCustomer = (id) =>
  useQuery({
    queryKey: customersKeys.detail(id),
    queryFn: () => getCustomerById(id),
    enabled: !!id,
  });