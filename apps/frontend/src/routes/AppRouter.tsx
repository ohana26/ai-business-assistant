import { Navigate, Route, Routes } from "react-router-dom";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { KnowledgePage } from "../pages/KnowledgePage";
import { ChatPage } from "../pages/ChatPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { OnboardingPage } from "../pages/OnboardingPage";
import { MemoryPage } from "../pages/MemoryPage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { AdminAssistantPage } from "../pages/AdminAssistantPage";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/assistant" replace />} />
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/assistant" element={<ChatPage />} />
          <Route path="/chat" element={<Navigate to="/assistant" replace />} />
          <Route path="/knowledge" element={<KnowledgePage />} />
          <Route path="/memory" element={<MemoryPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/assistant" element={<AdminAssistantPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
