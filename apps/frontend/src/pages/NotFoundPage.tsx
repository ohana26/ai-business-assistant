import { Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export function NotFoundPage() {
  return (
    <Stack sx={{ minHeight: "100vh", alignItems: "center", justifyContent: "center", p: 2 }}>
      <Paper
        elevation={0}
        sx={{ p: 4, border: "1px solid", borderColor: "divider", textAlign: "center", maxWidth: 460 }}
      >
        <Typography variant="h5" sx={{ mb: 1 }}>
          Page not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The route does not exist in the current frontend foundation.
        </Typography>
        <Button component={RouterLink} to="/dashboard" variant="contained">
          Go to Dashboard
        </Button>
      </Paper>
    </Stack>
  );
}
