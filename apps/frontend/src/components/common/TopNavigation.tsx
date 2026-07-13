import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { Box, Button, Chip, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useWorkspaceStore } from "../../store/workspaceStore";

export function TopNavigation() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const { companyId, workspaceId } = useWorkspaceStore((state) => ({
    companyId: state.companyId,
    workspaceId: state.workspaceId,
  }));

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
          <Chip size="small" label={`Company: ${companyId || "Not set"}`} />
          <Chip size="small" label={`Workspace: ${workspaceId || "Not set"}`} />
        </Box>
      </Box>

      <Button size="small" color="inherit" startIcon={<LogoutOutlinedIcon />} onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
}
