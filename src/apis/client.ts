import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError, BaseResponse } from '@/types/api';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/utils/accessToken';

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 재발급 중복 호출 방지용
let refreshPromise: Promise<string> | null = null;

const refreshAccessToken = async () => {
  const { data } = await axios.post<BaseResponse<{ accessToken: string }>>(
    `${BASE_URL}/auth/refresh`,
    null,
    {
      withCredentials: true,
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    }
  );
  setAccessToken(data.data.accessToken);
  return data.data.accessToken;
};

// Access Token 재발급
export const refreshSession = () => {
  refreshPromise ??= refreshAccessToken().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

const toApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    const body = error.response?.data as Partial<BaseResponse<unknown>>;
    return {
      status: error.response?.status ?? null,
      code: body?.code ?? 'NETWORK_ERROR',
      message: body?.message ?? error.message,
    };
  }
  return { status: null, code: 'UNKNOWN_ERROR', message: String(error) };
};

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = (error as AxiosError).config as RetryConfig | undefined;
    const isAuthRequest = config?.url?.startsWith('/auth/');

    // 로그인 등 인증 요청의 401은 재발급하지 않음
    if (
      error instanceof AxiosError &&
      error.response?.status === 401 &&
      config &&
      !config._retry &&
      !isAuthRequest
    ) {
      config._retry = true;
      try {
        const token = await refreshSession();
        config.headers.Authorization = `Bearer ${token}`;
        return apiClient(config);
      } catch (refreshError) {
        clearAccessToken();
        window.location.replace('/login');
        return Promise.reject(toApiError(refreshError));
      }
    }

    return Promise.reject(toApiError(error));
  }
);
