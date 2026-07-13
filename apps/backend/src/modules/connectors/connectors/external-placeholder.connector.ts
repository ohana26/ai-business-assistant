import { BadRequestException, Injectable } from '@nestjs/common';
import { KnowledgeSourceType } from '@prisma/client';
import type { Connector } from '../interfaces/connector.interface';
import type {
  ConnectorConfig,
  ConnectorConnectionValidation,
  ConnectorContext,
  ConnectorFetchedItem,
  ConnectorSyncResult,
} from '../types/connector.types';

@Injectable()
export class ExternalPlaceholderConnector implements Connector {
  readonly sourceTypes = [
    KnowledgeSourceType.GOOGLE_DRIVE,
    KnowledgeSourceType.ONEDRIVE,
    KnowledgeSourceType.EMAIL,
    KnowledgeSourceType.SLACK,
    KnowledgeSourceType.DATABASE,
    KnowledgeSourceType.API,
    KnowledgeSourceType.WEB,
  ];

  authenticate(context: ConnectorContext): Promise<void> {
    this.assertCredentialReference(context);
    return Promise.resolve();
  }

  validateConnection(
    context: ConnectorContext,
  ): Promise<ConnectorConnectionValidation> {
    this.assertCredentialReference(context);
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

  private assertCredentialReference(context: ConnectorContext) {
    const config = (context.source.connectorConfig ?? {}) as ConnectorConfig;
    const auth = config.auth;
    if (!auth) {
      throw new BadRequestException(
        'Connector auth configuration is required for external connectors',
      );
    }
    if (!auth.credentialReference) {
      throw new BadRequestException(
        'Connector auth must use credentialReference',
      );
    }

    // Guardrail: raw credentials must not be stored in source config.
    const unsafeKeys = [
      'accessToken',
      'refreshToken',
      'clientSecret',
      'password',
      'apiKey',
    ];
    for (const key of unsafeKeys) {
      if (key in (auth as Record<string, unknown>)) {
        throw new BadRequestException(
          'Raw credentials are not allowed in connector configuration',
        );
      }
    }
  }
}
