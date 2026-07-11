import SearchIcon from "@mui/icons-material/Search";
import { Avatar, Box, IconButton, InputAdornment, TextField, Typography } from "@mui/material";

export function TopNavigation() {
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
        backgroundColor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        AI Knowledge Platform
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search"
          sx={{ width: 240 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <IconButton aria-label="profile">
          <Avatar sx={{ width: 32, height: 32 }}>EA</Avatar>
        </IconButton>
      </Box>
    </Box>
  );
}
