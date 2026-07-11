import { create } from "zustand";

type WorkspaceState = {
  activeWorkspaceId: string | null;
  activeWorkspaceName: string | null;
};

type WorkspaceActions = {
  setActiveWorkspace: (workspaceId: string | null, workspaceName?: string | null) => void;
  clearWorkspace: () => void;
};

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>((set) => ({
  activeWorkspaceId: null,
  activeWorkspaceName: null,
  setActiveWorkspace: (workspaceId, workspaceName = null) =>
    set({
      activeWorkspaceId: workspaceId,
      activeWorkspaceName: workspaceName,
    }),
  clearWorkspace: () =>
    set({
      activeWorkspaceId: null,
      activeWorkspaceName: null,
    }),
}));
