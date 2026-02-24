import { useQuery } from "@tanstack/react-query";
import { getAccountById } from "../api/accounts-tree";

const useAccountById = (id) => {
  return useQuery({
    queryKey: ['accounts', id],
    queryFn: () =>  getAccountById(id),
  });
}

export default useAccountById