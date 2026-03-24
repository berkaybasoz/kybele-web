import axios from 'axios';

export const apiClient = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);
