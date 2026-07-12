export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  refreshTokenId: string;
};

export type AuthResponse = {
  user?: {
    id: string;
    email: string;
    displayName: string | null;
  };
  accessToken: string;
  refreshToken: string;
};
