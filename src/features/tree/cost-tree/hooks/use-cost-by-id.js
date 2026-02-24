import { useQuery } from "@tanstack/react-query";
import { getCostById } from "../api/cost-tree";

const useCostById = (id) => {
  return useQuery({
    queryKey: ['cost', id],
    queryFn: () =>  getCostById(id),
  });
}

export default useCostById