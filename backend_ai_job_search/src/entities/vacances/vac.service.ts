import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VacancyEntity } from './vac.entity.js';
import { CreateVacancyDto } from './dto/create-vac.dto.js';
import { UserDataEntity } from '../user_data/ud.entity.js';
import { Measure } from '@/common/services/index.js';
import { assertValidUuid } from './utils/vac-validation.util.js';

/**
 * Fields that are allowed to be changed after a vacancy has been created.
 * `id`, `date_add` and `uid` are managed by the server and must never be
 * edited.
 */
export type UpdateVacancyDto = Partial<CreateVacancyDto>;

/** Result returned by every mutating operation of this service. */
export type VacancyMutationResult = {
  success: boolean;
  message: string;
  id?: number;
};

@Injectable()
export class TestService {
  /** Columns that a client is allowed to write to. */
  private static readonly EDITABLE_FIELDS: ReadonlyArray<
    keyof UpdateVacancyDto
  > = [
    'date_pub',
    'company',
    'status',
    'role',
    'fit_rating',
    'source',
    'note',
    'source_cover_latter_id',
    'source_resume_id',
    'chanel',
  ];

  constructor(
    @InjectRepository(VacancyEntity)
    private readonly vacRepository: Repository<VacancyEntity>,
    @InjectRepository(UserDataEntity)
    private readonly userDataRepository: Repository<UserDataEntity>,
  ) {}

  // ---------------------------------------------------------------- create

  @Measure('TestService')
  async createVac(
    vacDTO: CreateVacancyDto,
  ): Promise<{ success: boolean; message: string; id?: number }> {
    assertValidUuid(vacDTO.uid, 'uid');

    const uid = vacDTO.uid.trim();

    // No foreign key exists on `uid`, so the owner is verified here.
    await this.assertUserExists(uid);

    // Create a new vacancy entity from the provided DTO
    const newVac = this.vacRepository.create({ ...vacDTO, uid });

    Logger.log(`createVac uid=${uid}`, 'TestService');

    // Save the entity into the database
    const savedVac = await this.vacRepository.save(newVac);

    // Return a JSON response indicating success along with the new record ID
    return {
      success: true,
      message: 'Vacancy successfully created',
      id: savedVac.id,
    };
  }

  // ------------------------------------------------------------------ read

  async findAll(uid: string): Promise<VacancyEntity[]> {
    assertValidUuid(uid, 'uid');

    return await this.vacRepository.find({
      where: { uid: uid.trim() },
    });
  }

  @Measure('TestService')
  async findOneById(id: number, uid: string): Promise<VacancyEntity> {
    this.assertValidId(id);
    assertValidUuid(uid, 'uid');

    const vacancy = await this.vacRepository.findOneBy({
      id,
      uid: uid.trim(),
    });

    if (!vacancy) {
      throw new NotFoundException(
        `Vacancy with id ${id} not found for user ${uid}`,
      );
    }

    return vacancy;
  }

  // ---------------------------------------------------------------- update

  /**
   * Main update entry point: applies only the fields that are present in the
   * payload, leaving every other column untouched.
   */
  @Measure('TestService')
  async updateVac(
    id: number,
    uid: string,
    vacDTO: UpdateVacancyDto,
  ): Promise<VacancyMutationResult> {
    return this.applyUpdate(id, uid, vacDTO);
  }

  @Measure('TestService')
  async updateVacDatePub(
    id: number,
    uid: string,
    datePub: string,
  ): Promise<VacancyMutationResult> {
    this.assertNonEmptyString(datePub, 'date_pub');

    return this.applyUpdate(id, uid, { date_pub: datePub });
  }

  @Measure('TestService')
  async updateVacCompany(
    id: number,
    uid: string,
    company: string,
  ): Promise<VacancyMutationResult> {
    this.assertNonEmptyString(company, 'company');
    this.assertMaxLength(company, 255, 'company');

    return this.applyUpdate(id, uid, { company });
  }

  @Measure('TestService')
  async updateVacStatus(
    id: number,
    uid: string,
    status: string,
  ): Promise<VacancyMutationResult> {
    this.assertNonEmptyString(status, 'status');
    this.assertMaxLength(status, 100, 'status');

    return this.applyUpdate(id, uid, { status });
  }

  @Measure('TestService')
  async updateVacRole(
    id: number,
    uid: string,
    role: string,
  ): Promise<VacancyMutationResult> {
    this.assertNonEmptyString(role, 'role');

    return this.applyUpdate(id, uid, { role });
  }

  @Measure('TestService')
  async updateVacFitRating(
    id: number,
    uid: string,
    fitRating: number,
  ): Promise<VacancyMutationResult> {
    if (!Number.isInteger(fitRating)) {
      throw new BadRequestException('fit_rating must be an integer');
    }

    return this.applyUpdate(id, uid, { fit_rating: fitRating });
  }

  @Measure('TestService')
  async updateVacSource(
    id: number,
    uid: string,
    source: string,
  ): Promise<VacancyMutationResult> {
    this.assertNonEmptyString(source, 'source');

    return this.applyUpdate(id, uid, { source });
  }

  @Measure('TestService')
  async updateVacNote(
    id: number,
    uid: string,
    note: string,
  ): Promise<VacancyMutationResult> {
    this.assertNonEmptyString(note, 'note');

    return this.applyUpdate(id, uid, { note });
  }

  @Measure('TestService')
  async updateVacChannel(
    id: number,
    uid: string,
    chanel: string,
  ): Promise<VacancyMutationResult> {
    this.assertNonEmptyString(chanel, 'chanel');
    this.assertMaxLength(chanel, 50, 'chanel');

    return this.applyUpdate(id, uid, { chanel });
  }

  @Measure('TestService')
  async updateVacCoverLetterPath(
    id: number,
    uid: string,
    path: string,
  ): Promise<VacancyMutationResult> {
    this.assertMaxLength(path, 500, 'source_cover_latter_s3');

    return this.applyUpdate(id, uid, { source_cover_latter_id: path });
  }

  @Measure('TestService')
  async updateVacResumePath(
    id: number,
    uid: string,
    path: string,
  ): Promise<VacancyMutationResult> {
    this.assertMaxLength(path, 500, 'source_resume_s3');

    return this.applyUpdate(id, uid, { source_resume_id: path });
  }

  // ---------------------------------------------------------------- delete

  /**
   * Deletes a vacancy by its primary key, scoped to its owner. A record can
   * only be removed when both `id` and `uid` match, and the owner is never
   * cascaded to `user_data`.
   */
  @Measure('TestService')
  async deleteVacById(
    id: number,
    uid: string,
  ): Promise<{ success: boolean; message: string; id: number }> {
    this.assertValidId(id);
    assertValidUuid(uid, 'uid');

    const owner = uid.trim();

    const vacancy = await this.vacRepository.findOneBy({ id, uid: owner });

    if (!vacancy) {
      throw new NotFoundException(
        `Vacancy with id ${id} not found for user ${uid}`,
      );
    }

    await this.vacRepository.delete({ id, uid: owner });

    Logger.log(`deleteVacById id=${id} uid=${owner}`, 'TestService');

    return {
      success: true,
      message: 'Vacancy successfully deleted',
      id,
    };
  }

  /** Alias kept short for callers that already use `deleteVac`. */
  async deleteVac(
    id: number,
    uid: string,
  ): Promise<{ success: boolean; message: string; id: number }> {
    return this.deleteVacById(id, uid);
  }

  // --------------------------------------------------------------- helpers

  /**
   * Shared update routine: validates `id` + `uid`, ensures the record exists
   * and belongs to that user, filters out unknown/undefined fields and
   * persists the merged entity.
   */
  private async applyUpdate(
    id: number,
    uid: string,
    patch: UpdateVacancyDto,
  ): Promise<VacancyMutationResult> {
    this.assertValidId(id);
    assertValidUuid(uid, 'uid');

    const owner = uid.trim();

    // Ownership check: the row must exist AND belong to the given user.
    const vacancy = await this.vacRepository.findOneBy({ id, uid: owner });

    if (!vacancy) {
      throw new NotFoundException(
        `Vacancy with id ${id} not found for user ${uid}`,
      );
    }

    const changes: Partial<VacancyEntity> = {};
    const writableChanges = changes as Record<string, unknown>;

    for (const field of TestService.EDITABLE_FIELDS) {
      const value = patch[field];

      // `undefined` keeps the current value, so partial updates stay safe.
      if (value === undefined) {
        continue;
      }

      writableChanges[field] = value;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('No editable fields were provided');
    }

    const merged = this.vacRepository.merge(vacancy, changes);

    await this.vacRepository.save(merged);

    Logger.log(`updateVac id=${id} uid=${owner}`, 'TestService');

    return {
      success: true,
      message: 'Vacancy successfully updated',
      id,
    };
  }

  /**
   * Verifies that `uid` references an existing `user_data` row. The column
   * has no foreign key, so this is the only guard against dangling owners.
   */
  private async assertUserExists(uid: string): Promise<void> {
    const user = await this.userDataRepository.findOneBy({ id: uid });

    if (!user) {
      throw new BadRequestException(
        `uid ${uid} does not reference an existing user`,
      );
    }
  }

  private assertValidId(id: number): void {
    if (!Number.isInteger(id) || id <= 0) {
      throw new BadRequestException('Vacancy id must be a positive integer');
    }
  }

  private assertNonEmptyString(value: string, field: string): void {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`${field} must be a non-empty string`);
    }
  }

  private assertMaxLength(value: string, max: number, field: string): void {
    if (typeof value === 'string' && value.length > max) {
      throw new BadRequestException(
        `${field} must be at most ${max} characters long`,
      );
    }
  }
}
