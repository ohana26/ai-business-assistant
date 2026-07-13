import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../database/database.module';
import { AuditModule } from '../audit/audit.module';
import { ExternalPlaceholderConnector } from './connectors/external-placeholder.connector';
import { ManualUploadConnector } from './connectors/manual-upload.connector';
import { ConnectorRegistryService } from './connector-registry.service';
import { ConnectorSyncOrchestratorService } from './connector-sync-orchestrator.service';
import { ConnectorSyncService } from './connector-sync.service';

@Module({
  imports: [DatabaseModule, AuditModule],
  providers: [
    ManualUploadConnector,
    ExternalPlaceholderConnector,
    ConnectorRegistryService,
    ConnectorSyncService,
    ConnectorSyncOrchestratorService,
  ],
  exports: [
    ConnectorRegistryService,
    ConnectorSyncService,
    ConnectorSyncOrchestratorService,
  ],
})
export class ConnectorsModule {}
