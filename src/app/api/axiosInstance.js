import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://mgm.mediconsulteg.com/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});
