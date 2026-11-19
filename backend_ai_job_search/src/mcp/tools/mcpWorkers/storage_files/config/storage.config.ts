import { ConfigService } from '@nestjs/config';

/**
 * Configuration definition for the object storage behind `storage_files`.
 *
 * The values themselves live in the environment (`.env`, loaded by
 * `ConfigModule.forRoot` in `AppModule`). This file only declares which keys
 * the storage tools are allowed to read and how they are normalised, so no
 * tool reads `process.env` or the `.env` file directly.
 */

export const STORAGE_CONFIG_KEYS = {
  /** Absolute base URL of the S3-compatible object store. */
  endpoint: 'S3_ENDPOINT',
  /** Bucket that receives uploaded files. */
  bucket: 'S3_BUCKET_NAME',
} as const;

export type StorageConfigKey =
  (typeof STORAGE_CONFIG_KEYS)[keyof typeof STORAGE_CONFIG_KEYS];

export type StorageConfig = {
  /**
   * Target link of the object store, exposed under the same name as the
   * environment key so callers of the MCP tools get `S3_ENDPOINT` back.
   */
  S3_ENDPOINT: string | null;
  S3_BUCKET_NAME: string | null;
};

/**
 * Reads the storage configuration for one tool call.
 *
 * A missing or blank value is reported as `null` instead of being replaced by
 * a hardcoded default, so callers can tell that the environment is not
 * configured.
 */
export function getStorageConfig(configService: ConfigService): StorageConfig {
  return {
    S3_ENDPOINT: readConfigString(configService, STORAGE_CONFIG_KEYS.endpoint),
    S3_BUCKET_NAME: readConfigString(configService, STORAGE_CONFIG_KEYS.bucket),
  };
}

function readConfigString(
  configService: ConfigService,
  key: StorageConfigKey,
): string | null {
  const value = configService.get<string>(key);

  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}
