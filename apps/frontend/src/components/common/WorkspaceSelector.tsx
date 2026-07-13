import { useQuery } from "@tanstack/react-query";
import { Button, MenuItem, Stack, TextField } from "@mui/material";
import { fetchUserContext } from "../../api";
import { useWorkspaceStore } from "../../store/workspaceStore";

export function WorkspaceSelector() {
  const companyId = useWorkspaceStore((state) => state.companyId);
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const setContext = useWorkspaceStore((state) => state.setContext);

  const contextQuery = useQuery({
    queryKey: ["workspace-selector-context"],
    queryFn: fetchUserContext,
  });

  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ alignItems: "center" }}>
      <TextField
        select
        label="Company"
        size="small"
        value={companyId}
        sx={{ minWidth: 220 }}
        onChange={(event) =>
          setContext({
            companyId: event.target.value,
          })
        }
      >
        {(contextQuery.data?.companies ?? []).map((item) => (
          <MenuItem key={item.companyId} value={item.companyId}>
            {item.companyId} ({item.role})
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Workspace"
        size="small"
        value={workspaceId}
        sx={{ minWidth: 180 }}
        onChange={(event) =>
          setContext({
            workspaceId: event.target.value,
          })
        }
      />
      <Button
        variant="outlined"
        size="small"
        onClick={() =>
          setContext({
            companyId: companyId.trim(),
            workspaceId: workspaceId.trim(),
          })
        }
      >
        Apply
      </Button>
    </Stack>
  );
}
