import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "Knowledge", path: "/knowledge", icon: <HubOutlinedIcon fontSize="small" /> },
  { label: "Assistants", path: "/assistants", icon: <SmartToyOutlinedIcon fontSize="small" /> },
  { label: "Chat", path: "/chat", icon: <ChatBubbleOutlineOutlinedIcon fontSize="small" /> },
  { label: "Settings", path: "/settings", icon: <SettingsOutlinedIcon fontSize="small" /> },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Box
      component="aside"
      sx={{
        width: 260,
        borderRight: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        px: 2,
        py: 2.5,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
        Enterprise AI Platform
      </Typography>

      <List sx={{ py: 0 }}>
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={isActive}
              sx={{
                borderRadius: 2,
                mb: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 34 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
