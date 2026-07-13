import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "../store/workspaceStore";
import { useOnboardingStore } from "../store/onboardingStore";

const steps = ["Organization", "Assistant Setup", "Invite Employees"];

export function OnboardingPage() {
  const navigate = useNavigate();
  const companyId = useWorkspaceStore((state) => state.companyId);
  const workspaceId = useWorkspaceStore((state) => state.workspaceId);
  const setAssistantProfile = useOnboardingStore(
    (state) => state.setAssistantProfile,
  );
  const markCompleted = useOnboardingStore((state) => state.markCompleted);
  const addInvitedEmployee = useOnboardingStore(
    (state) => state.addInvitedEmployee,
  );
  const initialProfile = useOnboardingStore((state) =>
    state.getAssistantProfile(companyId, workspaceId),
  );
  const invitedEmployees = useOnboardingStore((state) =>
    state.getInvitedEmployees(companyId, workspaceId),
  );
  const [activeStep, setActiveStep] = useState(0);
  const [assistantName, setAssistantName] = useState(
    initialProfile?.assistantName || "Company Assistant",
  );
  const [roleDescription, setRoleDescription] = useState(
    initialProfile?.roleDescription || "Company knowledge and policy assistant",
  );
  const [answerStyle, setAnswerStyle] = useState<
    "concise" | "balanced" | "detailed"
  >(initialProfile?.answerStyle ?? "balanced");
  const [inviteEmail, setInviteEmail] = useState("");

  const canProceedOrganization = Boolean(companyId && workspaceId);
  const canProceedAssistant = Boolean(
    assistantName.trim() && roleDescription.trim(),
  );
  const inviteList = useMemo(() => invitedEmployees, [invitedEmployees]);

  const saveAssistantConfig = () => {
    if (!companyId || !workspaceId || !assistantName.trim() || !roleDescription.trim()) {
      return;
    }
    setAssistantProfile(companyId, workspaceId, {
      assistantName: assistantName.trim(),
      roleDescription: roleDescription.trim(),
      answerStyle,
    });
  };

  const handleComplete = () => {
    if (!companyId || !workspaceId) {
      return;
    }
    saveAssistantConfig();
    markCompleted(companyId, workspaceId);
    navigate("/dashboard", { replace: true });
  };

  if (!companyId || !workspaceId) {
    return (
      <Stack spacing={2}>
        <Typography variant="h5">Organization Onboarding</Typography>
        <Alert severity="warning">
          Missing company/workspace context. Please login again so onboarding data
          can be initialized from your account setup.
        </Alert>
        <Button variant="contained" onClick={() => navigate("/login", { replace: true })}>
          Back to Login
        </Button>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1}>
          <Typography variant="h5">Organization Onboarding Wizard</Typography>
          <Typography variant="body2" color="text.secondary">
            First SaaS setup: define assistant behavior, then invite team members.
          </Typography>
          <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
            <Chip size="small" label={`Company: ${companyId}`} />
            <Chip size="small" label={`Workspace: ${workspaceId}`} />
          </Stack>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, border: "1px solid", borderColor: "divider" }}>
        {activeStep === 0 ? (
          <Stack spacing={2}>
            <Typography variant="h6">Organization Context</Typography>
            <Typography variant="body2" color="text.secondary">
              Your organization and workspace were created during registration.
            </Typography>
            <TextField label="Company ID" value={companyId} fullWidth disabled />
            <TextField label="Workspace ID" value={workspaceId} fullWidth disabled />
            <Button
              variant="contained"
              onClick={() => setActiveStep(1)}
              disabled={!canProceedOrganization}
            >
              Continue
            </Button>
          </Stack>
        ) : null}

        {activeStep === 1 ? (
          <Stack spacing={2}>
            <Typography variant="h6">Admin Assistant Configuration</Typography>
            <TextField
              label="Assistant Name"
              value={assistantName}
              onChange={(event) => setAssistantName(event.target.value)}
              fullWidth
            />
            <TextField
              label="Role Description"
              value={roleDescription}
              onChange={(event) => setRoleDescription(event.target.value)}
              helperText="Example: HR policies, onboarding, and operations support"
              fullWidth
            />
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Answer style
              </Typography>
              <Stack direction="row" spacing={1}>
                {(["concise", "balanced", "detailed"] as const).map((style) => (
                  <Chip
                    key={style}
                    label={style}
                    color={answerStyle === style ? "primary" : "default"}
                    onClick={() => setAnswerStyle(style)}
                  />
                ))}
              </Stack>
            </Box>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" onClick={() => setActiveStep(0)}>
                Back
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  saveAssistantConfig();
                  setActiveStep(2);
                }}
                disabled={!canProceedAssistant}
              >
                Continue
              </Button>
            </Stack>
          </Stack>
        ) : null}

        {activeStep === 2 ? (
          <Stack spacing={2}>
            <Typography variant="h6">Invite Employees</Typography>
            <Typography variant="body2" color="text.secondary">
              Invitation workflow is currently frontend-only. Email delivery will be
              connected in the next backend phase.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <TextField
                label="Employee email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                fullWidth
              />
              <Button
                variant="outlined"
                onClick={() => {
                  const email = inviteEmail.trim().toLowerCase();
                  if (!email || !companyId || !workspaceId) {
                    return;
                  }
                  addInvitedEmployee(companyId, workspaceId, email);
                  setInviteEmail("");
                }}
              >
                Add
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
              {inviteList.map((email) => (
                <Chip key={email} label={email} size="small" />
              ))}
              {inviteList.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No employees added yet.
                </Typography>
              ) : null}
            </Stack>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" onClick={() => setActiveStep(1)}>
                Back
              </Button>
              <Button variant="contained" onClick={handleComplete}>
                Finish Onboarding
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Paper>
    </Stack>
  );
}
