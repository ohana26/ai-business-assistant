export function useAppConfig() {
  return {
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  };
}
