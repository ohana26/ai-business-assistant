import { useEffect, useState } from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useWorkspaceStore } from "../store/workspaceStore";

export function DashboardPage() {
  const { companyId, workspaceId, collectionId, setContext } = useWorkspaceStore(
    (state) => ({
      companyId: state.companyId,
      workspaceId: state.workspaceId,
      collectionId: state.collectionId,
      setContext: state.setContext,
    }),
  );
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
        <Stack spacing={2}>
          <Typography variant="h5">Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">
            Configure the active company/workspace context used for knowledge and assistant API calls.
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
