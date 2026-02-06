import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import type { StorageProvider } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Local filesystem storage provider.
 * For development only - use S3/R2 in production.
 */
export class LocalStorageProvider implements StorageProvider {
  async upload(key: string, data: Buffer, _mimeType: string): Promise<string> {
    const filePath = path.join(UPLOAD_DIR, key);
    const dir = path.dirname(filePath);

    await mkdir(dir, { recursive: true });
    await writeFile(filePath, data);

    return key;
  }

  async getUrl(key: string): Promise<string> {
    return `/api/files/${key}`;
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(UPLOAD_DIR, key);
    try {
      await unlink(filePath);
    } catch {
      // File may not exist
    }
  }
}
