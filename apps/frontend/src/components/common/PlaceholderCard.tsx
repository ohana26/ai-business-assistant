import { Box, Paper, Typography } from "@mui/material";

type PlaceholderCardProps = {
  title: string;
  description: string;
};

export function PlaceholderCard({ title, description }: PlaceholderCardProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="h5" sx={{ mb: 1 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
      <Box sx={{ mt: 2, color: "text.secondary", fontSize: 14 }}>
        Placeholder page for Phase 1 frontend foundation.
      </Box>
    </Paper>
  );
}
