import { Navigate, Outlet } from "react-router-dom";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useOnboardingStore } from "../store/onboardingStore";

export function OnboardingRequiredRoute() {
  const companyId = useWorkspaceStore((state) => state.companyId);
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const isCompleted = useOnboardingStore((state) =>
    state.isCompleted(companyId, workspaceId),
  );

  if (!companyId || !workspaceId) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
}
