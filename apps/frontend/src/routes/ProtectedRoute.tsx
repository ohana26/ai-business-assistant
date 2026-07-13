import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthSession } from "../auth/useAuthSession";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuthSession();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
