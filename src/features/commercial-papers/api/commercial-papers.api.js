import { axiosInstance } from "../../../app/api/axiosInstance";

/* ===========================
   GET ALL
=========================== */
export const getAllCommercialPapers = async (params) => {
  const { data } = await axiosInstance.get('/commercial-papers', {
    params,
  });
  return data;
};

/* ===========================
   GET BY ID
=========================== */
export const getCommercialPaperById = async (id) => {
  const { data } = await axiosInstance.get(`/commercial-papers/${id}`);
  return data;
};

/* ===========================
   CREATE
=========================== */
export const createCommercialPaper = async (payload) => {
  const { data } = await axiosInstance.post(
    '/commercial-papers',
    payload
  );
  return data;
};

/* ===========================
   UPDATE
=========================== */
export const updateCommercialPaper = async ({ id, ...payload }) => {
  const { data } = await axiosInstance.put(
    `/commercial-papers/${id}`,
    payload
  );
  return data;
};

/* ===========================
   DELETE
=========================== */
export const deleteCommercialPaper = async (id) => {
  const { data } = await axiosInstance.delete(
    `/commercial-papers/${id}`
  );
  return data;
};