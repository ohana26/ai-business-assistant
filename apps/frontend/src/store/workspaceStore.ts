import { create } from "zustand";

const APP_CONTEXT_STORAGE_KEY = "ai-assistant-app-context";

type StoredContext = {
  companyId: string;
  workspaceId: string;
  collectionId: string;
};

function getStoredContext(): StoredContext {
  const defaults: StoredContext = {
    companyId: import.meta.env.VITE_DEFAULT_COMPANY_ID || "",
    workspaceId: import.meta.env.VITE_DEFAULT_WORKSPACE_ID || "",
    collectionId: import.meta.env.VITE_DEFAULT_COLLECTION_ID || "",
  };

  const raw = localStorage.getItem(APP_CONTEXT_STORAGE_KEY);
  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoredContext>;
    return {
      companyId: parsed.companyId ?? defaults.companyId,
      workspaceId: parsed.workspaceId ?? defaults.workspaceId,
      collectionId: parsed.collectionId ?? defaults.collectionId,
    };
  } catch {
    return defaults;
  }
}

type WorkspaceState = {
  companyId: string;
  workspaceId: string;
  collectionId: string;
};

type WorkspaceActions = {
  setContext: (context: Partial<WorkspaceState>) => void;
  clearContext: () => void;
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>((set) => {
  const initialState = getStoredContext();

  return {
    companyId: initialState.companyId,
    workspaceId: initialState.workspaceId,
    collectionId: initialState.collectionId,
    setContext: (context) =>
      set((state) => {
        const nextState = { ...state, ...context };
        localStorage.setItem(
          APP_CONTEXT_STORAGE_KEY,
          JSON.stringify({
            companyId: nextState.companyId,
            workspaceId: nextState.workspaceId,
            collectionId: nextState.collectionId,
          }),
        );
        return nextState;
      }),
    clearContext: () => {
      localStorage.removeItem(APP_CONTEXT_STORAGE_KEY);
      set({
        companyId: "",
        workspaceId: "",
        collectionId: "",
      });
    },
  };
});
