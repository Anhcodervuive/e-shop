import axios from 'axios';

const API_BASE = (process.env.NEXT_PUBLIC_SERVER_URI ?? '').replace(/\/$/, '');

export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = apiClient
      .request({
        method: 'post',
        url: '/api/auth/refresh-token',
        skipAuthRefresh: true,
      } as any)
      .then(() => undefined)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | {
          _retry?: boolean;
          skipAuthRefresh?: boolean;
        }
      | undefined;

    if (!originalRequest || originalRequest.skipAuthRefresh) {
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const shouldRefresh = status === 401 || status === 403;

    if (!shouldRefresh || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (isRefreshing) {
        await refreshPromise;
      } else {
        isRefreshing = true;
        await refreshAccessToken();
      }

      return apiClient.request(originalRequest as any);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export const isAxiosError = axios.isAxiosError;
