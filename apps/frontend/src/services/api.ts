import axios from "axios";
import { useAuthStore } from "../store/authStore";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const apiClient = axios.create({
  baseURL,
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      useAuthStore.getState().clearAuth();
    }
    return Promise.reject(error);
  },
);

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  displayName?: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type AssetItem = {
  id: string;
  title: string;
  filename: string;
  source: string | null;
  status: string;
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
};

export type AssistantChatResponse = {
  answer: string;
  conversationId?: string;
  sources?: AssistantSource[];
};

export async function login(payload: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/login", payload);
  return response.data;
}

export async function register(payload: RegisterRequest): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/auth/register", payload);
  return response.data;
}

export async function fetchKnowledgeAssets(params: {
  companyId: string;
  workspaceId: string;
}) {
  const response = await apiClient.get<KnowledgeAssetsResponse>("/knowledge/assets", {
    headers: {
      "x-company-id": params.companyId,
      "x-workspace-id": params.workspaceId,
    },
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
      "x-company-id": params.companyId,
      "x-workspace-id": params.workspaceId,
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
      headers: {
        "x-company-id": params.companyId,
        "x-workspace-id": params.workspaceId,
      },
    },
  );
  return response.data;
}
