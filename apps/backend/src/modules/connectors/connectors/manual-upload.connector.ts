import { Injectable } from '@nestjs/common';
import { KnowledgeSourceType } from '@prisma/client';
import type { Connector } from '../interfaces/connector.interface';
import type {
  ConnectorConnectionValidation,
  ConnectorContext,
  ConnectorFetchedItem,
  ConnectorSyncResult,
} from '../types/connector.types';

@Injectable()
export class ManualUploadConnector implements Connector {
  readonly sourceTypes = [
    KnowledgeSourceType.FILE_UPLOAD,
    KnowledgeSourceType.MANUAL,
  ];

  authenticate(context: ConnectorContext): Promise<void> {
    void context;
    return Promise.resolve();
  }

  validateConnection(
    context: ConnectorContext,
  ): Promise<ConnectorConnectionValidation> {
    void context;
    return Promise.resolve({ valid: true });
  }

  sync(context: ConnectorContext): Promise<ConnectorSyncResult> {
    void context;
    return Promise.resolve({ fetchedCount: 0 });
  }

  fetch(context: ConnectorContext): Promise<ConnectorFetchedItem[]> {
    void context;
    return Promise.resolve([]);
  }

  disconnect(context: ConnectorContext): Promise<void> {
    void context;
    return Promise.resolve();
  }
}
