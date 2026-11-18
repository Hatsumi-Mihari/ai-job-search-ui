import { BadRequestException } from '@nestjs/common';

/**
 * Normalises a value that must be stored in a text column.
 * Narrows `unknown` (values coming from an MCP tool call) to `string`.
 */
export function asNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException(`${field} must be a non-empty string`);
  }

  return value;
}

/**
 * Normalises a value that must be stored in an integer column.
 * Rejects numeric strings so MCP callers fail fast instead of silently coercing.
 */
export function asInteger(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new BadRequestException(`${field} must be an integer`);
  }

  return value;
}

/** Normalises an entity primary key (vacancy id or storage file uuid). */
export function asPositiveInteger(id: unknown, field = 'id'): number {
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    throw new BadRequestException(`${field} must be a positive integer`);
  }

  return id;
}
