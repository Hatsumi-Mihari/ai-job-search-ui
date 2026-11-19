import { BadRequestException } from '@nestjs/common';
import { Readable } from 'node:stream';
import 'multer';

/**
 * Maximum number of decoded bytes accepted by `storage_file_upload`.
 *
 * The MCP HTTP endpoint reads at most 4 MiB per request
 * (`DEFAULT_MAX_REQUEST_BODY_SIZE` in `@nestjs/mcp`), and base64 inflates the
 * payload by about a third. 2 MiB decoded leaves headroom for the JSON
 * envelope. Larger files must be sent to `POST /storage-files` as multipart
 * form data.
 */
export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;

/**
 * Maximum length of the caller-provided file name.
 *
 * `StorageService` prefixes the stored key with `${Date.now()}-`, and the
 * `storage_files.file_name` column is 256 characters, so the original name
 * must stay well below that.
 */
export const MAX_UPLOAD_FILE_NAME_LENGTH = 200;

/** Content type used when the caller does not provide one. */
export const DEFAULT_UPLOAD_CONTENT_TYPE = 'application/octet-stream';

/** Accepted shape of a MIME type: `type/subtype`, without parameters. */
export const UPLOAD_CONTENT_TYPE_PATTERN =
  /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i;

const BASE64_PATTERN = /^[A-Za-z0-9+/_-]+={0,2}$/;

/** A file decoded from an MCP payload, ready to be uploaded. */
export type DecodedUpload = {
  fileName: string;
  mimeType: string;
  buffer: Buffer;
};

export type DecodeUploadInput = {
  fileName: string;
  contentBase64: string;
  contentType?: string;
};

/**
 * Validates the textual input of `storage_file_upload` and turns it into the
 * buffer that `StorageService` expects.
 *
 * The file name is reduced to its last path segment so a caller cannot smuggle
 * directories into the stored key, control characters are removed, and the
 * decoded size is capped before anything is sent to S3.
 */
export function decodeUploadInput({
  fileName,
  contentBase64,
  contentType,
}: DecodeUploadInput): DecodedUpload {
  const buffer = decodeBase64Content(contentBase64);

  return {
    fileName: sanitizeFileName(fileName),
    mimeType: resolveContentType(contentType),
    buffer,
  };
}

/**
 * Accepts standard and URL-safe base64, with or without padding, and tolerates
 * a `data:<mime>;base64,` prefix. Empty or malformed content and content above
 * `MAX_UPLOAD_BYTES` are rejected before an upload is attempted.
 */
export function decodeBase64Content(contentBase64: string): Buffer {
  const withoutDataUrl = contentBase64.startsWith('data:')
    ? contentBase64.slice(contentBase64.indexOf(',') + 1)
    : contentBase64;
  const compact = withoutDataUrl.replace(/\s+/g, '');

  if (compact.length === 0 || !BASE64_PATTERN.test(compact)) {
    throw new BadRequestException(
      'content_base64 must be a non-empty, valid base64 string',
    );
  }

  const normalized = compact.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    '=',
  );
  const buffer = Buffer.from(padded, 'base64');

  if (buffer.length === 0) {
    throw new BadRequestException(
      'content_base64 must decode to at least one byte',
    );
  }

  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new BadRequestException(
      `content_base64 decodes to ${buffer.length} bytes; the limit is ${MAX_UPLOAD_BYTES} bytes (use POST /storage-files for larger files)`,
    );
  }

  const canonical = buffer
    .toString('base64')
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  const requested = compact.replace(/=+$/, '');

  if (canonical !== requested) {
    throw new BadRequestException('content_base64 is not canonical base64');
  }

  return buffer;
}

/**
 * Keeps the last path segment of the name, strips control characters and
 * rejects names that would be empty, `.` / `..`, or too long for the column.
 */
export function sanitizeFileName(fileName: string): string {
  const lastSegment = fileName.split(/[\\/]/).pop() ?? '';
  const cleaned = Array.from(lastSegment)
    .filter((character) => {
      const code = character.codePointAt(0) ?? 0;

      return code > 0x1f && code !== 0x7f;
    })
    .join('')
    .trim();

  if (cleaned.length === 0 || cleaned === '.' || cleaned === '..') {
    throw new BadRequestException(
      'file_name must contain a usable file name without control characters',
    );
  }

  if (cleaned.length > MAX_UPLOAD_FILE_NAME_LENGTH) {
    throw new BadRequestException(
      `file_name must be at most ${MAX_UPLOAD_FILE_NAME_LENGTH} characters long`,
    );
  }

  return cleaned;
}

/** Returns the provided MIME type, or the binary fallback when it is absent. */
export function resolveContentType(contentType?: string): string {
  if (contentType === undefined) {
    return DEFAULT_UPLOAD_CONTENT_TYPE;
  }

  const trimmed = contentType.trim();

  if (!UPLOAD_CONTENT_TYPE_PATTERN.test(trimmed)) {
    throw new BadRequestException(
      'content_type must be a MIME type such as "application/pdf"',
    );
  }

  return trimmed.toLowerCase();
}

/**
 * Builds the `Express.Multer.File` shape that `StorageFileService` and
 * `StorageService` read. No temporary file is written: the content stays in
 * the buffer and is sent to S3 directly.
 */
export function toMulterFile(upload: DecodedUpload): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: upload.fileName,
    encoding: '7bit',
    mimetype: upload.mimeType,
    size: upload.buffer.length,
    buffer: upload.buffer,
    destination: '',
    filename: upload.fileName,
    path: '',
    stream: Readable.from(upload.buffer),
  } as Express.Multer.File;
}
