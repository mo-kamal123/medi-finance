import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCustomer, updateCustomer, deleteCustomer } from "../api/customers.api";
import { customersKeys } from "./customers.keys";

export const useCreateCustomer = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      qc.invalidateQueries(customersKeys.lists());
    },
  });
};

export const useUpdateCustomer = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => updateCustomer(id, data),
    onSuccess: () => {
      qc.invalidateQueries(customersKeys.lists());
    },
  });
};

export const useDeleteCustomer = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      qc.invalidateQueries(customersKeys.lists());
    },
  });
};