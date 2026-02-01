import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'https://diadelphous-cairny-so.ngrok-free.dev/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});
