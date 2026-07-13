import { apiClient, withCompanyHeaders, withWorkspaceHeaders } from "./client";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName?: string;
  companyName?: string;
  workspaceName?: string;
};

export type AuthResponse = {
  user?: {
    id: string;
    email: string;
    displayName: string | null;
  };
  accessToken: string;
  refreshToken?: string;
  onboarding?: {
    companyId: string;
    workspaceId: string;
    collectionId: string;
  };
};

export type AssetItem = {
  id: string;
  title: string;
  filename: string;
  source: string | null;
  status: "UPLOADED" | "PROCESSING" | "READY" | "FAILED" | string;
  chunksCount: number;
  uploadedAt: string;
  sizeBytes: string;
};

export type KnowledgeAssetsResponse = {
  items: AssetItem[];
};

export type AssistantSource = {
  chunkId: string;
  assetId: string;
  filename: string;
  title: string;
  similarityScore: number;
  pageNumber?: number;
  section?: string;
};

export type AssistantChatResponse = {
  answer: string;
  conversationId?: string;
  sources?: AssistantSource[];
};

export type ConversationSummary = {
  id: string;
  createdAt: string;
  updatedAt: string;
  lastMessage: {
    id: string;
    role: string;
    content: string;
    createdAt: string;
  } | null;
};

export type ConversationsResponse = {
  items: ConversationSummary[];
};

export type ConversationMessage = {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};

export type ConversationMessagesResponse = {
  conversationId: string;
  items: ConversationMessage[];
};

export type MemoryItem = {
  id: string;
  type: string;
  content: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
};

export type MemoriesResponse = {
  items: MemoryItem[];
};

export type UserContextResponse = {
  userId: string;
  email: string;
  companies: Array<{
    companyId: string;
    membershipId: string;
    role: string;
    permissions: string[];
  }>;
  roles: string[];
  permissions: string[];
};

export type RoleItem = {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  permissions: string[];
};

export type RolesResponse = {
  items: RoleItem[];
};

export type AssistantProfileItem = {
  id: string;
  name: string;
  systemPrompt: string;
  behaviorConfig: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
};

export type AssistantProfilesResponse = {
  items: AssistantProfileItem[];
};

export async function login(payload: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>("/auth/register", payload);
  return response.data;
}

export async function fetchUserContext() {
  const response = await apiClient.get<UserContextResponse>("/users/me/context");
  return response.data;
}

export async function fetchRoles(companyId: string) {
  const response = await apiClient.get<RolesResponse>("/roles", {
    headers: withCompanyHeaders(companyId),
  });
  return response.data;
}

export async function fetchKnowledgeAssets(params: {
  companyId: string;
  workspaceId: string;
}) {
  const response = await apiClient.get<KnowledgeAssetsResponse>("/knowledge/assets", {
    headers: withWorkspaceHeaders(params.companyId, params.workspaceId),
  });
  return response.data;
}

export async function uploadKnowledgeAsset(params: {
  companyId: string;
  workspaceId: string;
  collectionId: string;
  file: File;
  onUploadProgress?: (progress: number) => void;
}) {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("collectionId", params.collectionId);

  const response = await apiClient.post("/knowledge/assets/upload", formData, {
    headers: {
      ...withWorkspaceHeaders(params.companyId, params.workspaceId),
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (!event.total) {
        return;
      }
      const progress = Math.round((event.loaded / event.total) * 100);
      params.onUploadProgress?.(progress);
    },
  });
  return response.data;
}

export async function sendAssistantChat(params: {
  companyId: string;
  workspaceId: string;
  message: string;
  conversationId?: string;
}) {
  const response = await apiClient.post<AssistantChatResponse>(
    "/assistant/chat",
    {
      message: params.message,
      conversationId: params.conversationId,
    },
    {
      headers: withWorkspaceHeaders(params.companyId, params.workspaceId),
    },
  );
  return response.data;
}

export async function fetchAssistantConversations(params: {
  companyId: string;
  workspaceId: string;
}) {
  const response = await apiClient.get<ConversationsResponse>(
    "/assistant/conversations",
    {
      headers: withWorkspaceHeaders(params.companyId, params.workspaceId),
    },
  );
  return response.data;
}

export async function fetchConversationMessages(params: {
  companyId: string;
  workspaceId: string;
  conversationId: string;
}) {
  const response = await apiClient.get<ConversationMessagesResponse>(
    `/assistant/conversations/${params.conversationId}/messages`,
    {
      headers: withWorkspaceHeaders(params.companyId, params.workspaceId),
    },
  );
  return response.data;
}

export async function fetchMemories(companyId: string) {
  const response = await apiClient.get<MemoriesResponse>("/assistant/memory", {
    headers: withCompanyHeaders(companyId),
  });
  return response.data;
}

export async function deleteMemory(params: { companyId: string; id: string }) {
  const response = await apiClient.delete<{ deleted: boolean; id: string }>(
    `/assistant/memory/${params.id}`,
    {
      headers: withCompanyHeaders(params.companyId),
    },
  );
  return response.data;
}

export async function fetchAssistantProfiles(companyId: string) {
  const response = await apiClient.get<AssistantProfilesResponse>("/assistant/profiles", {
    headers: withCompanyHeaders(companyId),
  });
  return response.data;
}

export async function updateAssistantProfile(params: {
  companyId: string;
  id: string;
  name?: string;
  systemPrompt?: string;
  behaviorConfig?: Record<string, unknown>;
}) {
  const response = await apiClient.patch<AssistantProfileItem>(
    `/assistant/profiles/${params.id}`,
    {
      name: params.name,
      systemPrompt: params.systemPrompt,
      behaviorConfig: params.behaviorConfig,
    },
    {
      headers: withCompanyHeaders(params.companyId),
    },
  );
  return response.data;
}
