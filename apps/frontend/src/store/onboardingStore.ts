import { create } from "zustand";

const ONBOARDING_STORAGE_KEY = "ai-assistant-onboarding";
const EMPTY_EMPLOYEES: string[] = [];

type AssistantProfile = {
  assistantName: string;
  roleDescription: string;
  answerStyle: "concise" | "balanced" | "detailed";
};

type OnboardingData = {
  completedContexts: Record<string, true>;
  assistantProfiles: Record<string, AssistantProfile>;
  invitedEmployees: Record<string, string[]>;
};

type OnboardingActions = {
  setAssistantProfile: (
    companyId: string,
    workspaceId: string,
    profile: AssistantProfile,
  ) => void;
  markCompleted: (companyId: string, workspaceId: string) => void;
  addInvitedEmployee: (
    companyId: string,
    workspaceId: string,
    email: string,
  ) => void;
  isCompleted: (companyId?: string, workspaceId?: string) => boolean;
  getAssistantProfile: (
    companyId?: string,
    workspaceId?: string,
  ) => AssistantProfile | null;
  getInvitedEmployees: (companyId?: string, workspaceId?: string) => string[];
};

function contextKey(companyId?: string, workspaceId?: string): string | null {
  if (!companyId || !workspaceId) {
    return null;
  }
  return `${companyId}:${workspaceId}`;
}

function getInitialState(): OnboardingData {
  const raw = localStorage.getItem(ONBOARDING_STORAGE_KEY);
  if (!raw) {
    return {
      completedContexts: {},
      assistantProfiles: {},
      invitedEmployees: {},
    };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingData>;
    return {
      completedContexts: parsed.completedContexts ?? {},
      assistantProfiles: parsed.assistantProfiles ?? {},
      invitedEmployees: parsed.invitedEmployees ?? {},
    };
  } catch {
    return {
      completedContexts: {},
      assistantProfiles: {},
      invitedEmployees: {},
    };
  }
}

function persist(next: OnboardingData): OnboardingData {
  localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(next));
  return next;
}

export const useOnboardingStore = create<OnboardingData & OnboardingActions>(
  (set, get) => ({
    ...getInitialState(),
    setAssistantProfile: (companyId, workspaceId, profile) =>
      set((state) => {
        const key = contextKey(companyId, workspaceId);
        if (!key) {
          return state;
        }
        return persist({
          ...state,
          assistantProfiles: {
            ...state.assistantProfiles,
            [key]: profile,
          },
        });
      }),
    markCompleted: (companyId, workspaceId) =>
      set((state) => {
        const key = contextKey(companyId, workspaceId);
        if (!key) {
          return state;
        }
        return persist({
          ...state,
          completedContexts: {
            ...state.completedContexts,
            [key]: true,
          },
        });
      }),
    addInvitedEmployee: (companyId, workspaceId, email) =>
      set((state) => {
        const key = contextKey(companyId, workspaceId);
        if (!key) {
          return state;
        }

        const existing = state.invitedEmployees[key] ?? [];
        if (existing.includes(email)) {
          return state;
        }

        return persist({
          ...state,
          invitedEmployees: {
            ...state.invitedEmployees,
            [key]: [...existing, email],
          },
        });
      }),
    isCompleted: (companyId, workspaceId) => {
      const key = contextKey(companyId, workspaceId);
      if (!key) {
        return false;
      }
      return Boolean(get().completedContexts[key]);
    },
    getAssistantProfile: (companyId, workspaceId) => {
      const key = contextKey(companyId, workspaceId);
      if (!key) {
        return null;
      }
      return get().assistantProfiles[key] ?? null;
    },
    getInvitedEmployees: (companyId, workspaceId) => {
      const key = contextKey(companyId, workspaceId);
      if (!key) {
        return EMPTY_EMPLOYEES;
      }
      return get().invitedEmployees[key] ?? EMPTY_EMPLOYEES;
    },
  }),
);
