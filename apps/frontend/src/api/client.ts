import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";

const baseURL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const apiClient = axios.create({
  baseURL,
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const authState = useAuthStore.getState();
    const refreshToken = authState.refreshToken;
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post<{
        accessToken: string;
        refreshToken?: string;
      }>(
        `${baseURL}/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${refreshToken}`,
          },
          timeout: 20000,
        },
      );

      const newAccessToken = response.data.accessToken;
      const nextRefreshToken = response.data.refreshToken ?? refreshToken;
      useAuthStore.getState().setSession({
        token: newAccessToken,
        refreshToken: nextRefreshToken,
        user: authState.user,
      });
      return newAccessToken;
    } catch {
      useAuthStore.getState().clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalConfig = error.config as RetriableConfig | undefined;
    if (!originalConfig) {
      return Promise.reject(error);
    }

    if (error.response?.status !== 401 || originalConfig._retry) {
      if (error.response?.status === 401) {
        useAuthStore.getState().clearAuth();
      }
      return Promise.reject(error);
    }

    originalConfig._retry = true;
    const token = await refreshAccessToken();
    if (!token) {
      return Promise.reject(error);
    }

    originalConfig.headers = originalConfig.headers ?? {};
    originalConfig.headers.Authorization = `Bearer ${token}`;
    return apiClient.request(originalConfig);
  },
);

export function withCompanyHeaders(companyId: string) {
  return {
    "x-company-id": companyId,
  };
}

export function withWorkspaceHeaders(companyId: string, workspaceId: string) {
  return {
    "x-company-id": companyId,
    "x-workspace-id": workspaceId,
  };
}
