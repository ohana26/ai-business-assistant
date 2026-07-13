import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { Box, Button, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthSession } from "../../auth/useAuthSession";
import { useWorkspaceStore } from "../../store/workspaceStore";
import { WorkspaceSelector } from "./WorkspaceSelector";

export function TopNavigation() {
  const navigate = useNavigate();
  const { clearAuth, user } = useAuthSession();
  const companyId = useWorkspaceStore((state) => state.companyId);
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);

  const handleLogout = () => {
    clearAuth();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      component="header"
      sx={{
        height: 72,
        borderBottom: "1px solid",
        borderColor: "divider",
        px: 3,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        backgroundColor: "background.paper",
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          AI Business Assistant Console
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}>
          <Chip size="small" label={`User: ${user?.email || "Unknown"}`} />
          <Chip size="small" label={`Company: ${companyId || "Not set"}`} />
          <Chip size="small" label={`Workspace: ${workspaceId || "Not set"}`} />
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <WorkspaceSelector />
        <Button size="small" color="inherit" startIcon={<LogoutOutlinedIcon />} onClick={handleLogout}>
          Logout
        </Button>
      </Box>
    </Box>
  );
}
