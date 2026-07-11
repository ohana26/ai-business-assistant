import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
};

type AuthActions = {
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isAuthenticated: false,
  accessToken: null,
  setAccessToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: Boolean(token),
    }),
  clearAuth: () =>
    set({
      isAuthenticated: false,
      accessToken: null,
    }),
}));
