import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";

export function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Enterprise AI Platform
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Login placeholder. Authentication flow will be implemented in a later phase.
            </Typography>
          </Box>
          <TextField label="Email" type="email" fullWidth disabled />
          <TextField label="Password" type="password" fullWidth disabled />
          <Button variant="contained" size="large" disabled>
            Sign In (Placeholder)
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
