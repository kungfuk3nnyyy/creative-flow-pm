import type { StorageProvider } from "./types";
import { LocalStorageProvider } from "./local";

/**
 * Get the configured storage provider.
 * Defaults to local filesystem for development.
 * Override with STORAGE_PROVIDER env var to use S3/R2.
 */
export function getStorageProvider(): StorageProvider {
  // Future: check env for S3/R2 configuration
  // if (process.env.STORAGE_PROVIDER === 's3') return new S3StorageProvider();
  return new LocalStorageProvider();
}

export type { StorageProvider };
export { MAX_FILE_SIZE, ALLOWED_MIME_TYPES } from "./types";
