import { create } from "zustand";

const AUTH_TOKEN_STORAGE_KEY = "ai-assistant-access-token";
const AUTH_REFRESH_TOKEN_STORAGE_KEY = "ai-assistant-refresh-token";
const AUTH_USER_STORAGE_KEY = "ai-assistant-user";

function getStoredToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
}

function getStoredRefreshToken(): string | null {
  return sessionStorage.getItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
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
  refreshToken: string | null;
  user: AuthUser | null;
};

type AuthActions = {
  setSession: (params: {
    token: string | null;
    refreshToken?: string | null;
    user?: AuthUser | null;
  }) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  isAuthenticated: Boolean(getStoredToken()),
  accessToken: getStoredToken(),
  refreshToken: getStoredRefreshToken(),
  user: getStoredUser(),
  setSession: ({ token, refreshToken = null, user = null }) => {
    if (token) {
      sessionStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    } else {
      sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    }

    if (refreshToken) {
      sessionStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    } else {
      sessionStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
    }

    if (user) {
      sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    }

    set({
      accessToken: token,
      refreshToken,
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
      refreshToken: getStoredRefreshToken(),
      isAuthenticated: Boolean(token),
      user: getStoredUser(),
    });
  },
  setRefreshToken: (refreshToken) => {
    if (refreshToken) {
      sessionStorage.setItem(AUTH_REFRESH_TOKEN_STORAGE_KEY, refreshToken);
    } else {
      sessionStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
    }
    set({
      accessToken: getStoredToken(),
      refreshToken,
      isAuthenticated: Boolean(getStoredToken()),
      user: getStoredUser(),
    });
  },
  clearAuth: () => {
    sessionStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_REFRESH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
    set({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      user: null,
    });
  },
}));
