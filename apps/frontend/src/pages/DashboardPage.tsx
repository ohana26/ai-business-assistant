import { useState } from "react";
import {
  Alert,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useAuthStore } from "../store/authStore";
import { fetchAssistantConversations, fetchKnowledgeAssets } from "../api";
import { useOnboardingStore } from "../store/onboardingStore";

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const companyId = useWorkspaceStore((state) => state.companyId);
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const collectionId = useWorkspaceStore((state) => state.collectionId);
  const assistantProfile = useOnboardingStore((state) =>
    state.getAssistantProfile(companyId, workspaceId),
  );
  const invitedEmployees = useOnboardingStore((state) =>
    state.getInvitedEmployees(companyId, workspaceId),
  );
  const addInvitedEmployee = useOnboardingStore((state) => state.addInvitedEmployee);
  const [inviteEmail, setInviteEmail] = useState("");

  const assetsQuery = useQuery({
    queryKey: ["dashboard-assets-summary", companyId, workspaceId],
    queryFn: () => fetchKnowledgeAssets({ companyId, workspaceId }),
    enabled: Boolean(companyId && workspaceId),
  });

  const conversationsQuery = useQuery({
    queryKey: ["dashboard-conversations-summary", companyId, workspaceId],
    queryFn: () => fetchAssistantConversations({ companyId, workspaceId }),
    enabled: Boolean(companyId && workspaceId),
  });

  const readyAssetsCount = (assetsQuery.data?.items ?? []).filter(
    (asset) => asset.status === "READY",
  ).length;

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1.25}>
          <Typography variant="h5">Admin Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your organization onboarding, assistant configuration, knowledge,
            and employee adoption from one place.
          </Typography>
          <Stack spacing={0.4}>
            <Typography variant="body2">
              <strong>Admin:</strong> {user?.displayName || "Not set"}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {user?.email || "Not available"}
            </Typography>
            <Typography variant="body2">
              <strong>Assistant:</strong>{" "}
              {assistantProfile?.assistantName || "Not configured"}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            <Chip label={`Company: ${companyId || "N/A"}`} size="small" />
            <Chip label={`Workspace: ${workspaceId || "N/A"}`} size="small" />
            <Chip label={`Collection: ${collectionId || "N/A"}`} size="small" />
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
            <Button component={RouterLink} to="/onboarding" variant="outlined">
              Open Onboarding
            </Button>
            <Button component={RouterLink} to="/knowledge" variant="outlined">
              Manage Knowledge
            </Button>
            <Button component={RouterLink} to="/assistant" variant="outlined">
              Open Assistant Chat
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1.25}>
          <Typography variant="h6">Product Flow Status</Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="body2">1) Company signup/login</Typography>
              <Chip size="small" label="Complete" color="success" />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="body2">2) Organization onboarding wizard</Typography>
              <Chip
                size="small"
                label={assistantProfile ? "Complete" : "Pending"}
                color={assistantProfile ? "success" : "default"}
              />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="body2">3) Upload company knowledge</Typography>
              <Chip
                size="small"
                label={readyAssetsCount > 0 ? `${readyAssetsCount} ready` : "Pending"}
                color={readyAssetsCount > 0 ? "success" : "default"}
              />
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="body2">4) Employees use personalized assistant</Typography>
              <Chip
                size="small"
                label={
                  (conversationsQuery.data?.items.length ?? 0) > 0
                    ? `${conversationsQuery.data?.items.length ?? 0} conversations`
                    : "Pending"
                }
                color={
                  (conversationsQuery.data?.items.length ?? 0) > 0
                    ? "success"
                    : "default"
                }
              />
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">Employee Invitations</Typography>
          <Typography variant="body2" color="text.secondary">
            Invite workflow is local for now and represents the upcoming SaaS
            invitation backend flow.
          </Typography>
          {!companyId || !workspaceId ? (
            <Alert severity="warning">Company/workspace context is missing.</Alert>
          ) : null}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="Employee email"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              disabled={!inviteEmail.trim() || !companyId || !workspaceId}
              onClick={() => {
                if (!companyId || !workspaceId) {
                  return;
                }
                addInvitedEmployee(
                  companyId,
                  workspaceId,
                  inviteEmail.trim().toLowerCase(),
                );
                setInviteEmail("");
              }}
            >
              Invite
            </Button>
          </Stack>
          <Divider />
          <Stack spacing={0.75}>
            {invitedEmployees.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No invited employees yet.
              </Typography>
            ) : (
              invitedEmployees.map((email) => (
                <Typography key={email} variant="body2">
                  {email}
                </Typography>
              ))
            )}
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
