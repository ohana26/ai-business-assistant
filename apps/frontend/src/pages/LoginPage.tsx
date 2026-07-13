import { useState } from "react";
import { Alert, Box, Button, Paper, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { login, register } from "../services/api";
import { useAuthStore } from "../store/authStore";
import { useWorkspaceStore } from "../store/workspaceStore";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setContext = useWorkspaceStore((state) => state.setContext);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      if (data.onboarding) {
        setContext(data.onboarding);
      }
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

  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      if (data.onboarding) {
        setContext(data.onboarding);
      }
      navigate("/dashboard", { replace: true });
    },
  });

  const loginError =
    loginMutation.error instanceof AxiosError
      ? loginMutation.error.response?.data?.message || "Login failed. Check credentials."
      : null;
  const registerError =
    registerMutation.error instanceof AxiosError
      ? registerMutation.error.response?.data?.message || "Registration failed."
      : null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === "login") {
      loginMutation.mutate({ email, password });
      return;
    }
    registerMutation.mutate({
      email,
      password,
      displayName: displayName.trim() || undefined,
      companyName: companyName.trim() || undefined,
      workspaceName: workspaceName.trim() || undefined,
    });
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
              Step 1: Register (or login), then continue the RAG test cycle.
            </Typography>
          </Box>
          <Tabs value={mode} onChange={(_e, value) => setMode(value)}>
            <Tab label="Login" value="login" />
            <Tab label="Register" value="register" />
          </Tabs>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {mode === "login" && loginError ? (
                <Alert severity="error">{String(loginError)}</Alert>
              ) : null}
              {mode === "register" && registerError ? (
                <Alert severity="error">{String(registerError)}</Alert>
              ) : null}
              {mode === "register" ? (
                <>
                  <TextField
                    label="Display Name (optional)"
                    fullWidth
                    value={displayName}
                    onChange={(event) => setDisplayName(event.target.value)}
                  />
                  <TextField
                    label="Company Name"
                    fullWidth
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    helperText="Your organization/workspace owner account"
                  />
                  <TextField
                    label="Workspace Name"
                    fullWidth
                    value={workspaceName}
                    onChange={(event) => setWorkspaceName(event.target.value)}
                    helperText="First workspace for your team"
                  />
                </>
              ) : null}
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
                helperText={
                  mode === "register" ? "Use at least 8 characters for registration." : undefined
                }
              />
              <Button
                variant="contained"
                size="large"
                type="submit"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {mode === "login"
                  ? loginMutation.isPending
                    ? "Signing in..."
                    : "Sign In"
                  : registerMutation.isPending
                    ? "Creating account..."
                    : "Create Account"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
