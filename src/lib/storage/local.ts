import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import type { StorageProvider } from "./types";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

/**
 * Validate that a storage key does not escape the upload directory.
 * Rejects path traversal attempts (e.g. "../", leading "/").
 */
function sanitizeKey(key: string): string {
  if (!key || key.includes("..") || key.startsWith("/")) {
    throw new Error("Invalid storage key.");
  }

  const resolved = path.resolve(UPLOAD_DIR, key);
  if (!resolved.startsWith(UPLOAD_DIR + path.sep) && resolved !== UPLOAD_DIR) {
    throw new Error("Invalid storage key.");
  }

  return key;
}

/**
 * Local filesystem storage provider.
 * For development only - use S3/R2 in production.
 */
export class LocalStorageProvider implements StorageProvider {
  async upload(key: string, data: Buffer, _mimeType: string): Promise<string> {
    const safeKey = sanitizeKey(key);
    const filePath = path.join(UPLOAD_DIR, safeKey);
    const dir = path.dirname(filePath);

    await mkdir(dir, { recursive: true });
    await writeFile(filePath, data);

    return safeKey;
  }

  async getUrl(key: string): Promise<string> {
    sanitizeKey(key);
    return `/api/files/${key}`;
  }

  async delete(key: string): Promise<void> {
    const safeKey = sanitizeKey(key);
    const filePath = path.join(UPLOAD_DIR, safeKey);
    try {
      await unlink(filePath);
    } catch {
      // File may not exist
    }
  }
}
