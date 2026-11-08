import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VacancyEntity } from './vac.entity.js'
import { CreateVacancyDto } from './dto/create-vac.dto.js'
import { Measure } from '@/common/global/index.js';

/**
 * Fields that are allowed to be changed after a vacancy has been created.
 * `id` and `date_add` are managed by the database and must never be edited.
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
    private static readonly EDITABLE_FIELDS: ReadonlyArray<keyof UpdateVacancyDto> = [
        'date_pub',
        'company',
        'status',
        'role',
        'fit_rating',
        'source',
        'note',
        'source_cover_latter_s3',
        'source_resume_s3',
        'chanel',
    ];

    constructor(
        @InjectRepository(VacancyEntity)
        private readonly vacRepository: Repository<VacancyEntity>,
    ) { }

    // ---------------------------------------------------------------- create

    @Measure('TestService')
    async createVac(vacDTO: CreateVacancyDto): Promise<{ success: boolean; message: string; id?: number }> {
        // Create a new vacancy entity from the provided DTO
        const newVac = this.vacRepository.create(vacDTO);

        Logger.log('createVac', 'TestService');

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

    async findAll(): Promise<VacancyEntity[]> {
        return await this.vacRepository.find();
    }

    @Measure('TestService')
    async findOneById(id: number): Promise<VacancyEntity> {
        this.assertValidId(id);

        const vacancy = await this.vacRepository.findOneBy({ id });

        if (!vacancy) {
            throw new NotFoundException(`Vacancy with id ${id} not found`);
        }

        return vacancy;
    }

    // ---------------------------------------------------------------- update

    /**
     * Main update entry point: applies only the fields that are present in the
     * payload, leaving every other column untouched.
     */
    @Measure('TestService')
    async updateVac(id: number, vacDTO: UpdateVacancyDto): Promise<VacancyMutationResult> {
        return this.applyUpdate(id, vacDTO);
    }

    @Measure('TestService')
    async updateVacDatePub(id: number, datePub: string): Promise<VacancyMutationResult> {
        this.assertNonEmptyString(datePub, 'date_pub');

        return this.applyUpdate(id, { date_pub: datePub });
    }

    @Measure('TestService')
    async updateVacCompany(id: number, company: string): Promise<VacancyMutationResult> {
        this.assertNonEmptyString(company, 'company');
        this.assertMaxLength(company, 255, 'company');

        return this.applyUpdate(id, { company });
    }

    @Measure('TestService')
    async updateVacStatus(id: number, status: string): Promise<VacancyMutationResult> {
        this.assertNonEmptyString(status, 'status');
        this.assertMaxLength(status, 100, 'status');

        return this.applyUpdate(id, { status });
    }

    @Measure('TestService')
    async updateVacRole(id: number, role: string): Promise<VacancyMutationResult> {
        this.assertNonEmptyString(role, 'role');

        return this.applyUpdate(id, { role });
    }

    @Measure('TestService')
    async updateVacFitRating(id: number, fitRating: number): Promise<VacancyMutationResult> {
        if (!Number.isInteger(fitRating)) {
            throw new BadRequestException('fit_rating must be an integer');
        }

        return this.applyUpdate(id, { fit_rating: fitRating });
    }

    @Measure('TestService')
    async updateVacSource(id: number, source: string): Promise<VacancyMutationResult> {
        this.assertNonEmptyString(source, 'source');

        return this.applyUpdate(id, { source });
    }

    @Measure('TestService')
    async updateVacNote(id: number, note: string): Promise<VacancyMutationResult> {
        this.assertNonEmptyString(note, 'note');

        return this.applyUpdate(id, { note });
    }

    @Measure('TestService')
    async updateVacChannel(id: number, chanel: string): Promise<VacancyMutationResult> {
        this.assertNonEmptyString(chanel, 'chanel');
        this.assertMaxLength(chanel, 50, 'chanel');

        return this.applyUpdate(id, { chanel });
    }

    @Measure('TestService')
    async updateVacCoverLetterPath(id: number, path: string): Promise<VacancyMutationResult> {
        this.assertMaxLength(path, 500, 'source_cover_latter_s3');

        return this.applyUpdate(id, { source_cover_latter_s3: path });
    }

    @Measure('TestService')
    async updateVacResumePath(id: number, path: string): Promise<VacancyMutationResult> {
        this.assertMaxLength(path, 500, 'source_resume_s3');

        return this.applyUpdate(id, { source_resume_s3: path });
    }

    // ---------------------------------------------------------------- delete

    /**
     * Deletes a vacancy by its primary key. Records can only be removed by id,
     * so no other criteria (company, status, ...) is accepted here.
     */
    @Measure('TestService')
    async deleteVacById(id: number): Promise<{ success: boolean; message: string; id: number }> {
        this.assertValidId(id);

        const vacancy = await this.vacRepository.findOneBy({ id });

        if (!vacancy) {
            throw new NotFoundException(`Vacancy with id ${id} not found`);
        }

        await this.vacRepository.delete({ id });

        Logger.log(`deleteVacById id=${id}`, 'TestService');

        return {
            success: true,
            message: 'Vacancy successfully deleted',
            id,
        };
    }

    /** Alias kept short for callers that already use `deleteVac`. */
    async deleteVac(id: number): Promise<{ success: boolean; message: string; id: number }> {
        return this.deleteVacById(id);
    }

    // --------------------------------------------------------------- helpers

    /**
     * Shared update routine: validates the id, ensures the record exists,
     * filters out unknown/undefined fields and persists the merged entity.
     */
    private async applyUpdate(id: number, patch: UpdateVacancyDto): Promise<VacancyMutationResult> {
        this.assertValidId(id);

        const vacancy = await this.vacRepository.findOneBy({ id });

        if (!vacancy) {
            throw new NotFoundException(`Vacancy with id ${id} not found`);
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

        Logger.log(`updateVac id=${id}`, 'TestService');

        return {
            success: true,
            message: 'Vacancy successfully updated',
            id,
        };
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
            throw new BadRequestException(`${field} must be at most ${max} characters long`);
        }
    }
}
