import { create } from "zustand";

const AUTH_TOKEN_STORAGE_KEY = "ai-assistant-access-token";

function getStoredToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
};

type AuthActions = {
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isAuthenticated: Boolean(getStoredToken()),
  accessToken: getStoredToken(),
  setAccessToken: (token) => {
    if (token) {
      sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
    set({
      accessToken: token,
      isAuthenticated: Boolean(token),
    });
  },
  clearAuth: () => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    set({
      isAuthenticated: false,
      accessToken: null,
    });
  },
}));
