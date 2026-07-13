import { useState } from "react";
import { Alert, Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { login } from "../services/api";
import { useAuthStore } from "../store/authStore";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      const nextPath =
        typeof location.state === "object" &&
        location.state &&
        "from" in location.state &&
        typeof location.state.from === "string"
          ? location.state.from
          : "/dashboard";
      navigate(nextPath, { replace: true });
    },
  });

  const loginError =
    loginMutation.error instanceof AxiosError
      ? loginMutation.error.response?.data?.message || "Login failed. Check credentials."
      : null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

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
              AI Business Assistant
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
              Internal admin console login
            </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {loginError ? <Alert severity="error">{String(loginError)}</Alert> : null}
              <TextField
                label="Email"
                type="email"
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
