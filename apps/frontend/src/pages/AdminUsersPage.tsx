import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { fetchRoles, fetchUserContext } from "../api";
import { useWorkspaceStore } from "../store/workspaceStore";

export function AdminUsersPage() {
  const companyId = useWorkspaceStore((state) => state.companyId);

  const contextQuery = useQuery({
    queryKey: ["user-context"],
    queryFn: fetchUserContext,
  });

  const rolesQuery = useQuery({
    queryKey: ["company-roles", companyId],
    queryFn: () => fetchRoles(companyId),
    enabled: Boolean(companyId),
  });

  const context = contextQuery.data;
  const companyAccess = context?.companies.find((item) => item.companyId === companyId);

  return (
    <Stack spacing={2.5}>
      <Stack spacing={0.75}>
        <Typography variant="h5">Admin Users</Typography>
        <Typography variant="body2" color="text.secondary">
          Internal admin view for current user access and company role catalog.
        </Typography>
      </Stack>

      {contextQuery.isLoading ? <LinearProgress /> : null}
      {contextQuery.error ? (
        <Alert severity="error">Failed to load user context.</Alert>
      ) : null}

      <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1">Current user</Typography>
          <Typography variant="body2">User ID: {context?.userId || "-"}</Typography>
          <Typography variant="body2">Email: {context?.email || "-"}</Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
            {(context?.roles ?? []).map((role) => (
              <Chip key={role} size="small" label={role} />
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1}>
          <Typography variant="subtitle1">Selected company access</Typography>
          {!companyId ? (
            <Alert severity="warning">Select company in workspace selector first.</Alert>
          ) : !companyAccess ? (
            <Alert severity="warning">
              You are not an active member of the selected company.
            </Alert>
          ) : (
            <>
              <Typography variant="body2">Role: {companyAccess.role}</Typography>
              <Typography variant="body2">
                Membership: {companyAccess.membershipId}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                {companyAccess.permissions.map((permission) => (
                  <Chip key={permission} size="small" label={permission} />
                ))}
              </Stack>
            </>
          )}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1.25}>
          <Typography variant="subtitle1">Company roles</Typography>
          {rolesQuery.isLoading ? <LinearProgress /> : null}
          {rolesQuery.error ? (
            <Alert severity="warning">
              Unable to load roles. Requires company.manage permission.
            </Alert>
          ) : null}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>System</TableCell>
                <TableCell>Permissions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rolesQuery.data?.items ?? []).map((role) => (
                <TableRow key={role.id}>
                  <TableCell>{role.name}</TableCell>
                  <TableCell>{role.isSystemRole ? "Yes" : "No"}</TableCell>
                  <TableCell>{role.permissions.join(", ") || "-"}</TableCell>
                </TableRow>
              ))}
              {!rolesQuery.isLoading && (rolesQuery.data?.items.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={3}>
                    <Typography variant="body2" color="text.secondary">
                      No roles returned.
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
