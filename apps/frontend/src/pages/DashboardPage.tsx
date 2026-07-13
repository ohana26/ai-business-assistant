import { useEffect, useState } from "react";
import { Alert, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useAuthStore } from "../store/authStore";

export function DashboardPage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const companyId = useWorkspaceStore((state) => state.companyId);
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const collectionId = useWorkspaceStore((state) => state.collectionId);
  const setContext = useWorkspaceStore((state) => state.setContext);
  const [companyInput, setCompanyInput] = useState(companyId);
  const [workspaceInput, setWorkspaceInput] = useState(workspaceId);
  const [collectionInput, setCollectionInput] = useState(collectionId);

  useEffect(() => {
    setCompanyInput(companyId);
    setWorkspaceInput(workspaceId);
    setCollectionInput(collectionId);
  }, [companyId, workspaceId, collectionId]);

  const hasContext = Boolean(companyId && workspaceId);

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1.5}>
          <Typography variant="h5">Welcome</Typography>
          <Typography variant="body2" color="text.secondary">
            Your workspace is ready. You can upload knowledge and chat immediately.
          </Typography>
          <Stack spacing={0.5}>
            <Typography variant="body2">
              <strong>Name:</strong> {user?.displayName || "Not set"}
            </Typography>
            <Typography variant="body2">
              <strong>Email:</strong> {user?.email || "Not available"}
            </Typography>
            <Typography variant="body2">
              <strong>Company ID:</strong> {companyId || "Not available"}
            </Typography>
            <Typography variant="body2">
              <strong>Workspace ID:</strong> {workspaceId || "Not available"}
            </Typography>
            <Typography variant="body2">
              <strong>Default Collection ID:</strong> {collectionId || "Not available"}
            </Typography>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button component={RouterLink} to="/knowledge" variant="outlined">
              Upload Knowledge
            </Button>
            <Button component={RouterLink} to="/chat" variant="outlined">
              Open Chat
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1.5}>
          <Typography variant="h6">Usage order</Typography>
          <Typography variant="body2" color="text.secondary">
            Follow these steps in sequence for full end-to-end testing.
          </Typography>
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="body2">1) Register user in Login screen</Typography>
              <Chip size="small" label={isAuthenticated ? "Done" : "Pending"} color={isAuthenticated ? "success" : "default"} />
            </Stack>
            <Typography variant="body2">2) Login and open Dashboard</Typography>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="body2">3) Set Company + Workspace + Collection IDs</Typography>
              <Chip size="small" label={hasContext ? "Done" : "Pending"} color={hasContext ? "success" : "default"} />
            </Stack>
            <Typography variant="body2">4) Go to Knowledge page and upload a document</Typography>
            <Typography variant="body2">5) Go to Chat page, ask questions, continue same conversation</Typography>
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2}>
          <Typography variant="h6">Context override (optional)</Typography>
          <Typography variant="body2" color="text.secondary">
            You usually do not need this. It is available only for advanced/manual overrides.
          </Typography>
          {!hasContext ? (
            <Alert severity="warning">Set company and workspace IDs before testing APIs.</Alert>
          ) : null}
          <TextField
            label="Company ID"
            value={companyInput}
            onChange={(event) => setCompanyInput(event.target.value)}
            fullWidth
          />
          <TextField
            label="Workspace ID"
            value={workspaceInput}
            onChange={(event) => setWorkspaceInput(event.target.value)}
            fullWidth
          />
          <TextField
            label="Default Collection ID (for uploads)"
            value={collectionInput}
            onChange={(event) => setCollectionInput(event.target.value)}
            fullWidth
          />
          <Button
            variant="contained"
            onClick={() =>
              setContext({
                companyId: companyInput.trim(),
                workspaceId: workspaceInput.trim(),
                collectionId: collectionInput.trim(),
              })
            }
          >
            Save Context
          </Button>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <Button component={RouterLink} to="/knowledge" variant="outlined">
            Go to Knowledge Assets
          </Button>
          <Button component={RouterLink} to="/chat" variant="outlined">
            Go to Assistant Chat
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
