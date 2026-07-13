import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import ChatBubbleOutlineOutlinedIcon from "@mui/icons-material/ChatBubbleOutlineOutlined";
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";

const navigationItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
  { label: "Knowledge", path: "/knowledge", icon: <HubOutlinedIcon fontSize="small" /> },
  { label: "Chat", path: "/chat", icon: <ChatBubbleOutlineOutlinedIcon fontSize="small" /> },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Box
      component="aside"
      sx={{
        width: { xs: 74, md: 260 },
        borderRight: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        px: 2,
        py: 2.5,
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
        <Box component="span" sx={{ display: { xs: "none", md: "inline" } }}>
          AI Console
        </Box>
        <Box component="span" sx={{ display: { xs: "inline", md: "none" } }}>
          AI
        </Box>
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
              <ListItemText
                primary={item.label}
                sx={{ display: { xs: "none", md: "block" } }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}
