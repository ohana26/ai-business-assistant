export type StorageUploadResult = {
  path: string;
  size: number;
  mimeType?: string;
};

export interface StorageProvider {
  upload(
    buffer: Buffer,
    path: string,
    mimeType?: string,
  ): Promise<StorageUploadResult>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
}
