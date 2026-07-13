import { Injectable, NotFoundException } from '@nestjs/common';
import { KnowledgeSourceType } from '@prisma/client';
import type { Connector } from './interfaces/connector.interface';
import { ExternalPlaceholderConnector } from './connectors/external-placeholder.connector';
import { ManualUploadConnector } from './connectors/manual-upload.connector';

@Injectable()
export class ConnectorRegistryService {
  private readonly connectorsBySourceType = new Map<
    KnowledgeSourceType,
    Connector
  >();

  constructor(
    manualUploadConnector: ManualUploadConnector,
    externalPlaceholderConnector: ExternalPlaceholderConnector,
  ) {
    this.register(manualUploadConnector);
    this.register(externalPlaceholderConnector);
  }

  resolve(sourceType: KnowledgeSourceType): Connector {
    const connector = this.connectorsBySourceType.get(sourceType);
    if (!connector) {
      throw new NotFoundException(
        `No connector registered for source type: ${sourceType}`,
      );
    }

    return connector;
  }

  private register(connector: Connector) {
    for (const sourceType of connector.sourceTypes) {
      this.connectorsBySourceType.set(sourceType, connector);
    }
  }
}
