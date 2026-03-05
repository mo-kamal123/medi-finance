import { useQuery } from "@tanstack/react-query";
import { getGeneralLedger } from "../api/general-ledger.api";
import { generalLedgerKeys } from "./general-ledger.keys";

export const useGeneralLedger = (filters) => {
  return useQuery({
    queryKey: generalLedgerKeys.list(filters),
    queryFn: () => getGeneralLedger(filters),
  });
};