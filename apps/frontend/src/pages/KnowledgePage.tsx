import { useState } from "react";
import {
  Alert,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { fetchKnowledgeAssets, uploadKnowledgeAsset } from "../api";
import { useWorkspaceStore } from "../store/workspaceStore";

function formatBytes(bytesAsString: string): string {
  const bytes = Number(bytesAsString);
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 ** 2) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 ** 2)).toFixed(1)} MB`;
}

export function KnowledgePage() {
  const queryClient = useQueryClient();
  const companyId = useWorkspaceStore((state) => state.companyId);
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const collectionId = useWorkspaceStore((state) => state.collectionId);
  const setContext = useWorkspaceStore((state) => state.setContext);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [collectionInput, setCollectionInput] = useState(collectionId);

  const assetsQuery = useQuery({
    queryKey: ["knowledge-assets", companyId, workspaceId],
    queryFn: () => fetchKnowledgeAssets({ companyId, workspaceId }),
    enabled: Boolean(companyId && workspaceId),
  });

  const uploadMutation = useMutation({
    mutationFn: uploadKnowledgeAsset,
    onSuccess: () => {
      setSelectedFile(null);
      setUploadProgress(0);
      void queryClient.invalidateQueries({ queryKey: ["knowledge-assets"] });
    },
  });

  const uploadError =
    uploadMutation.error instanceof AxiosError
      ? uploadMutation.error.response?.data?.message || "Upload failed."
      : null;

  const handleUpload = () => {
    if (!selectedFile || !companyId || !workspaceId || !collectionInput.trim()) {
      return;
    }
    setContext({ collectionId: collectionInput.trim() });
    uploadMutation.mutate({
      file: selectedFile,
      companyId,
      workspaceId,
      collectionId: collectionInput.trim(),
      onUploadProgress: setUploadProgress,
    });
  };

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2}>
          <Typography variant="h5">Knowledge Assets</Typography>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            <Typography variant="body2">Upload company documents to train your assistant</Typography>
            <Chip size="small" label={(assetsQuery.data?.items?.length ?? 0) > 0 ? "Assets ready" : "No assets yet"} />
          </Stack>
          {companyId && workspaceId ? null : (
            <Alert severity="warning">Organization context missing. Complete onboarding first.</Alert>
          )}
          {uploadError ? <Alert severity="error">{String(uploadError)}</Alert> : null}
          <TextField
            label="Collection ID"
            value={collectionInput}
            onChange={(event) => setCollectionInput(event.target.value)}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <Button variant="outlined" component="label">
              Select file
              <input
                hidden
                type="file"
                onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
              />
            </Button>
            <Typography variant="body2" sx={{ alignSelf: "center" }}>
              {selectedFile ? selectedFile.name : "No file selected"}
            </Typography>
            <Button
              variant="contained"
              disabled={
                !selectedFile ||
                !companyId ||
                !workspaceId ||
                !collectionInput.trim() ||
                uploadMutation.isPending
              }
              onClick={handleUpload}
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload"}
            </Button>
          </Stack>
          {uploadMutation.isPending ? (
            <Stack spacing={1}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography variant="caption" color="text.secondary">
                Upload progress: {uploadProgress}%
              </Typography>
            </Stack>
          ) : null}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider", overflowX: "auto" }}>
        <Stack spacing={2}>
          <Typography variant="h6">Assets</Typography>
          <Button variant="outlined" component={RouterLink} to="/assistant">
            Next: Open Assistant Chat
          </Button>
          {assetsQuery.isLoading ? <LinearProgress /> : null}
          {assetsQuery.error ? (
            <Alert severity="error">Failed to load assets. Check auth and context headers.</Alert>
          ) : null}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Filename</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Uploaded Date</TableCell>
                <TableCell>Size</TableCell>
                <TableCell>Chunks</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(assetsQuery.data?.items ?? []).map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell>{asset.filename}</TableCell>
                  <TableCell>{asset.status}</TableCell>
                  <TableCell>{new Date(asset.uploadedAt).toLocaleString()}</TableCell>
                  <TableCell>{formatBytes(asset.sizeBytes)}</TableCell>
                  <TableCell>{asset.chunksCount}</TableCell>
                </TableRow>
              ))}
              {(assetsQuery.data?.items ?? []).length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      No assets found for the current workspace.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
}
