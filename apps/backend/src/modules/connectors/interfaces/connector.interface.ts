import type { KnowledgeSourceType } from '@prisma/client';
import type {
  ConnectorConnectionValidation,
  ConnectorContext,
  ConnectorFetchedItem,
  ConnectorSyncResult,
} from '../types/connector.types';

export interface Connector {
  readonly sourceTypes: KnowledgeSourceType[];
  authenticate(context: ConnectorContext): Promise<void>;
  validateConnection(
    context: ConnectorContext,
  ): Promise<ConnectorConnectionValidation>;
  sync(context: ConnectorContext): Promise<ConnectorSyncResult>;
  fetch(context: ConnectorContext): Promise<ConnectorFetchedItem[]>;
  disconnect(context: ConnectorContext): Promise<void>;
}
