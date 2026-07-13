import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Alert, Button, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { AxiosError } from "axios";
import { deleteMemory, fetchMemories } from "../api";
import { useWorkspaceStore } from "../store/workspaceStore";

export function MemoryPage() {
  const queryClient = useQueryClient();
  const companyId = useWorkspaceStore((state) => state.companyId);

  const memoriesQuery = useQuery({
    queryKey: ["assistant-memory", companyId],
    queryFn: () => fetchMemories(companyId),
    enabled: Boolean(companyId),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMemory({ companyId, id }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["assistant-memory", companyId],
      });
    },
  });

  const deleteError =
    deleteMutation.error instanceof AxiosError
      ? deleteMutation.error.response?.data?.message || "Failed to delete memory."
      : null;

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Typography variant="h5">Memory</Typography>
        <Typography variant="body2" color="text.secondary">
          Personal memory records used to personalize assistant responses.
        </Typography>
      </Stack>

      {!companyId ? (
        <Alert severity="warning">Select company in workspace selector first.</Alert>
      ) : null}
      {deleteError ? <Alert severity="error">{String(deleteError)}</Alert> : null}
      {memoriesQuery.isLoading ? <LinearProgress /> : null}

      {(memoriesQuery.data?.items ?? []).map((memory) => (
        <Paper
          key={memory.id}
          elevation={0}
          sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
        >
          <Stack spacing={1}>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
              <Chip size="small" label={memory.type} />
              <Chip size="small" label={`Importance ${memory.importance}`} />
              <Typography variant="caption" color="text.secondary">
                {new Date(memory.updatedAt).toLocaleString()}
              </Typography>
            </Stack>
            <Typography variant="body2">{memory.content}</Typography>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                color="error"
                onClick={() => deleteMutation.mutate(memory.id)}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        </Paper>
      ))}

      {!memoriesQuery.isLoading && (memoriesQuery.data?.items.length ?? 0) === 0 ? (
        <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary">
            No memories found yet. Start chatting to let the system capture preferences.
          </Typography>
        </Paper>
      ) : null}
    </Stack>
  );
}
