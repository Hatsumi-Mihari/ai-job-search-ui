import type { StorageFileEntity } from '@/entities/storage_files/sf.entity.js';

/** Default page size of `storage_file_list`. */
export const DEFAULT_STORAGE_FILE_LIMIT = 50;

/** Upper bound accepted by `storage_file_list`. */
export const MAX_STORAGE_FILE_LIMIT = 200;

/** One saved file, as returned to an MCP caller. */
export type StorageFileView = {
  id: string;
  file_name: string;
  size_bytes: number;
  sources3: string;
  date_add: string;
};

/** One page of saved files plus the total number of stored records. */
export type StorageFilePage = {
  total: number;
  limit: number;
  offset: number;
  items: StorageFileView[];
};

/**
 * Maps the entity to a response object. `size` is renamed to `size_bytes`
 * because the value is a byte count, matching the download-link response of
 * `StorageFileService`.
 */
export function toStorageFileView(file: StorageFileEntity): StorageFileView {
  return {
    id: file.id,
    file_name: file.file_name,
    size_bytes: file.size,
    sources3: file.sources3,
    date_add:
      file.date_add instanceof Date
        ? file.date_add.toISOString()
        : String(file.date_add),
  };
}

/**
 * Sorts the records newest first and slices one page out of them.
 *
 * `StorageFileService.findAll` returns every row without ordering, so the
 * sort happens here to keep paging stable for the caller. The total is the
 * number of stored records, not the number of returned items.
 */
export function paginateStorageFiles(
  files: readonly StorageFileEntity[],
  limit: number = DEFAULT_STORAGE_FILE_LIMIT,
  offset = 0,
): StorageFilePage {
  const sorted = [...files].sort(compareNewestFirst);

  return {
    total: sorted.length,
    limit,
    offset,
    items: sorted.slice(offset, offset + limit).map(toStorageFileView),
  };
}

function compareNewestFirst(
  left: StorageFileEntity,
  right: StorageFileEntity,
): number {
  const dateDifference = toTime(right.date_add) - toTime(left.date_add);

  if (dateDifference !== 0) {
    return dateDifference;
  }

  const nameDifference = left.file_name.localeCompare(right.file_name);

  return nameDifference !== 0
    ? nameDifference
    : left.id.localeCompare(right.id);
}

function toTime(value: Date | string): number {
  const time = value instanceof Date ? value.getTime() : Date.parse(value);

  return Number.isNaN(time) ? 0 : time;
}
