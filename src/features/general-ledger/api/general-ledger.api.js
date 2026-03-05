import { axiosInstance } from "../../../app/api/axiosInstance";

export const getGeneralLedger = async (filters) => {
  const cleanedParams = Object.fromEntries(
    Object.entries(filters || {}).filter(
      ([_, value]) => value !== "" && value !== null && value !== undefined
    )
  );

  const { data } = await axiosInstance.get("/general-ledger", {
    params: cleanedParams,
  });

  return data;
};