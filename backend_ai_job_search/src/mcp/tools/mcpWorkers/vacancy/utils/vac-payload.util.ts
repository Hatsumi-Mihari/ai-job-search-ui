import { CreateVacancyDto } from '@/entities/vacances/dto/create-vac.dto.js';

/**
 * Document links accepted by the vacancy tools.
 *
 * `source_resume_id` / `source_cover_latter_id` are UUIDs of rows in
 * `storage_files` (not S3 paths), which is why they are optional and nullable.
 */
export type VacancyDocumentLinks = {
  source_resume_id?: string | null;
  source_cover_latter_id?: string | null;
};

/** Input accepted by the `vacancy_create` tool. */
export type CreateVacancyInput = {
  uid: string;
  date_pub: string;
  company: string;
  status: string;
  role: string;
  fit_rating: number;
  source: string;
  note: string;
  chanel: string;
} & VacancyDocumentLinks;

/** Input accepted by the `vacancy_update` tool (partial by design). */
export type UpdateVacancyInput = Partial<CreateVacancyInput>;

/**
 * Maps tool input to the DTO expected by `TestService.createVac`.
 *
 * Only `undefined` document ids are dropped; `null` is kept on purpose so a
 * caller can create a vacancy without linked documents.
 */
export function toCreateVacancyDto(
  input: CreateVacancyInput,
): CreateVacancyDto {
  const dto: CreateVacancyDto = {
    uid: input.uid,
    date_pub: input.date_pub,
    company: input.company,
    status: input.status,
    role: input.role,
    fit_rating: input.fit_rating,
    source: input.source,
    note: input.note,
    chanel: input.chanel,
  };

  if (input.source_resume_id !== undefined) {
    dto.source_resume_id = input.source_resume_id;
  }

  if (input.source_cover_latter_id !== undefined) {
    dto.source_cover_latter_id = input.source_cover_latter_id;
  }

  return dto;
}

/**
 * Maps tool input to the patch accepted by `TestService.updateVac`.
 *
 * The field list is intentionally not filtered here: `TestService` drops
 * unknown keys and raises `BadRequestException` when no editable field is
 * present, so validation stays in a single place.
 */
export function toUpdateVacancyDto(
  input: UpdateVacancyInput,
): Partial<CreateVacancyDto> {
  return { ...input };
}
