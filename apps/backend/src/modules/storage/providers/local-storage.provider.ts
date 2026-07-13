import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, join } from 'node:path';
import type {
  StorageProvider,
  StorageUploadResult,
} from '../interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly basePath: string;

  constructor(private readonly configService: ConfigService) {
    const configuredPath = this.configService.get<string>(
      'app.storagePath',
      './storage',
    );
    this.basePath = isAbsolute(configuredPath)
      ? configuredPath
      : join(process.cwd(), configuredPath);
  }

  async upload(
    buffer: Buffer,
    path: string,
    mimeType?: string,
  ): Promise<StorageUploadResult> {
    const fullPath = this.resolvePath(path);
    await mkdir(dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);

    return {
      path,
      size: buffer.byteLength,
      mimeType,
    };
  }

  async download(path: string): Promise<Buffer> {
    return readFile(this.resolvePath(path));
  }

  async delete(path: string): Promise<void> {
    await rm(this.resolvePath(path), { force: true });
  }

  private resolvePath(path: string): string {
    return join(this.basePath, path);
  }
}
