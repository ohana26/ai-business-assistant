import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { StorageProvider } from './interfaces/storage-provider.interface';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { STORAGE_PROVIDER_TOKEN } from './storage.constants';

@Module({
  providers: [
    LocalStorageProvider,
    {
      provide: STORAGE_PROVIDER_TOKEN,
      inject: [ConfigService, LocalStorageProvider],
      useFactory: (
        configService: ConfigService,
        localStorageProvider: LocalStorageProvider,
      ): StorageProvider => {
        const provider = configService.get<string>(
          'app.storageProvider',
          'local',
        );
        switch (provider) {
          case 'local':
            return localStorageProvider;
          case 's3':
          case 'azure-blob':
          case 'private-cloud':
            throw new Error(
              `Storage provider "${provider}" is not implemented yet`,
            );
          default:
            throw new Error(`Unsupported storage provider: ${provider}`);
        }
      },
    },
  ],
  exports: [STORAGE_PROVIDER_TOKEN],
})
export class StorageModule {}
