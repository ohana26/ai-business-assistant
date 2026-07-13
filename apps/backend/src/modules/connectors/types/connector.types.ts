import type { AssetContentType, KnowledgeSource } from '@prisma/client';

export type ConnectorAuthMethod =
  'oauth2' | 'api-key' | 'basic-auth' | 'service-account';

export type ConnectorAuthConfig = {
  method: ConnectorAuthMethod;
  credentialReference: string;
  scopes?: string[];
  tenantHint?: string;
  endpointHint?: string;
};

export type ConnectorConfig = {
  auth?: ConnectorAuthConfig;
  targetCollectionId?: string;
  syncCursor?: string;
  [key: string]: unknown;
};

export type ConnectorFetchedItem = {
  externalId?: string;
  filename: string;
  title?: string;
  contentType?: AssetContentType;
  mimeType?: string;
  checksum?: string;
  sizeBytes?: number;
  sourceUpdatedAt?: Date;
  storagePath?: string;
  metadata?: Record<string, unknown>;
};

export type ConnectorSyncResult = {
  fetchedCount: number;
  nextCursor?: string;
};

export type ConnectorConnectionValidation = {
  valid: boolean;
  reason?: string;
};

export type ConnectorContext = {
  source: KnowledgeSource;
};
