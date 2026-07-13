import { create } from "zustand";

const AUTH_TOKEN_STORAGE_KEY = "ai-assistant-access-token";
const AUTH_USER_STORAGE_KEY = "ai-assistant-user";

function getStoredToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
};

function getStoredUser(): AuthUser | null {
  const raw = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

type AuthState = {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: AuthUser | null;
};

type AuthActions = {
  setSession: (params: { token: string | null; user?: AuthUser | null }) => void;
  setAccessToken: (token: string | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isAuthenticated: Boolean(getStoredToken()),
  accessToken: getStoredToken(),
  user: getStoredUser(),
  setSession: ({ token, user = null }) => {
    if (token) {
      sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }

    if (user) {
      sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }

    set({
      accessToken: token,
      isAuthenticated: Boolean(token),
      user,
    });
  },
  setAccessToken: (token) => {
    if (token) {
      sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }
    set({
      accessToken: token,
      isAuthenticated: Boolean(token),
      user: getStoredUser(),
    });
  },
  clearAuth: () => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    set({
      isAuthenticated: false,
      accessToken: null,
      user: null,
    });
  },
}));
