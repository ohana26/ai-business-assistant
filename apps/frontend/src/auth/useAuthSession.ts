import { useAuthStore } from "../store/authStore";

export function useAuthSession() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const user = useAuthStore((state) => state.user);
  const setSession = useAuthStore((state) => state.setSession);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return {
    isAuthenticated,
    accessToken,
    refreshToken,
    user,
    setSession,
    clearAuth,
  };
}
