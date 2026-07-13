import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "../components/common/AppSidebar";
import { TopNavigation } from "../components/common/TopNavigation";

export function DashboardLayout() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "background.default" }}>
      <AppSidebar />

      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopNavigation />
        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
