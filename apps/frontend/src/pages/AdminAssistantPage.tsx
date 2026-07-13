import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AxiosError } from "axios";
import { fetchAssistantProfiles, updateAssistantProfile } from "../api";
import { useWorkspaceStore } from "../store/workspaceStore";

export function AdminAssistantPage() {
  const queryClient = useQueryClient();
  const companyId = useWorkspaceStore((state) => state.companyId);
  const [selectedProfileId, setSelectedProfileId] = useState("");
  const [name, setName] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [behaviorConfig, setBehaviorConfig] = useState("{}");
  const [jsonError, setJsonError] = useState<string | null>(null);

  const profilesQuery = useQuery({
    queryKey: ["assistant-profiles", companyId],
    queryFn: () => fetchAssistantProfiles(companyId),
    enabled: Boolean(companyId),
  });

  useEffect(() => {
    if (!profilesQuery.data?.items.length) {
      return;
    }
    const selected =
      profilesQuery.data.items.find((item) => item.id === selectedProfileId) ??
      profilesQuery.data.items[0];
    setSelectedProfileId(selected.id);
    setName(selected.name);
    setSystemPrompt(selected.systemPrompt);
    setBehaviorConfig(JSON.stringify(selected.behaviorConfig ?? {}, null, 2));
  }, [profilesQuery.data?.items, selectedProfileId]);

  const updateMutation = useMutation({
    mutationFn: updateAssistantProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["assistant-profiles", companyId],
      });
    },
  });

  const updateError =
    updateMutation.error instanceof AxiosError
      ? updateMutation.error.response?.data?.message || "Failed to update profile."
      : null;

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Typography variant="h5">Admin Assistant</Typography>
        <Typography variant="body2" color="text.secondary">
          Update company assistant profile prompt and behavior config.
        </Typography>
      </Stack>

      {!companyId ? (
        <Alert severity="warning">Select company in workspace selector first.</Alert>
      ) : null}
      {profilesQuery.isLoading ? <LinearProgress /> : null}
      {profilesQuery.error ? (
        <Alert severity="warning">
          Unable to load assistant profiles. Requires company admin + assistant.manage.
        </Alert>
      ) : null}
      {updateError ? <Alert severity="error">{String(updateError)}</Alert> : null}
      {jsonError ? <Alert severity="error">{jsonError}</Alert> : null}

      <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1.25}>
          <TextField
            select
            label="Assistant profile"
            value={selectedProfileId}
            onChange={(event) => {
              const id = event.target.value;
              setSelectedProfileId(id);
              const profile = profilesQuery.data?.items.find((item) => item.id === id);
              if (!profile) {
                return;
              }
              setName(profile.name);
              setSystemPrompt(profile.systemPrompt);
              setBehaviorConfig(JSON.stringify(profile.behaviorConfig ?? {}, null, 2));
            }}
            fullWidth
          >
            {(profilesQuery.data?.items ?? []).map((item) => (
              <MenuItem key={item.id} value={item.id}>
                {item.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            fullWidth
          />
          <TextField
            label="System prompt"
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
            multiline
            minRows={4}
            fullWidth
          />
          <TextField
            label="Behavior config (JSON)"
            value={behaviorConfig}
            onChange={(event) => setBehaviorConfig(event.target.value)}
            multiline
            minRows={6}
            fullWidth
          />

          <Button
            variant="contained"
            disabled={!selectedProfileId || updateMutation.isPending || !companyId}
            onClick={() => {
              if (!companyId || !selectedProfileId) {
                return;
              }
              let parsedConfig: Record<string, unknown> = {};
              try {
                parsedConfig = JSON.parse(behaviorConfig);
                setJsonError(null);
              } catch {
                setJsonError("Behavior config must be valid JSON.");
                return;
              }

              updateMutation.mutate({
                companyId,
                id: selectedProfileId,
                name: name.trim() || undefined,
                systemPrompt: systemPrompt.trim() || undefined,
                behaviorConfig: parsedConfig,
              });
            }}
          >
            {updateMutation.isPending ? "Saving..." : "Save Profile"}
          </Button>
        </Stack>
      </Paper>
    </Stack>
  );
}
