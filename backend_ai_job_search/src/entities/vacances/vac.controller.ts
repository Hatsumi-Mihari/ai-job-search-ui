import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Logger,
    BadRequestException,
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
    UseInterceptors,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { TestService } from './vac.service.js';
import { CreateVacancyDto } from './dto/create-vac.dto.js';
import { VacancyIdDto } from './dto/vacancy-id.dto.js';
import { UpdateVacancyDto } from './dto/update-vac.dto.js';
import {
    UpdateChannelDto,
    UpdateCompanyDto,
    UpdateCoverLetterDto,
    UpdateDatePubDto,
    UpdateFitRatingDto,
    UpdateNoteDto,
    UpdateResumeDto,
    UpdateRoleDto,
    UpdateSourceDto,
    UpdateStatusDto,
} from './dto/update-vac-field.dto.js';

/**
 * Converts the client's request body into a JSON object before it reaches any
 * `@Body()` parameter or validation pipe.
 *
 * Express already parses `application/json` requests, but a client may also
 * send the payload as a raw JSON string (double-encoded JSON, a Buffer, ...).
 * In that case the body is parsed here so the controller always works with a
 * JSON object. Malformed payloads are rejected with a 400.
 */
@Injectable()
export class JsonBodyInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        try {
            const request = context.switchToHttp().getRequest<{ body?: unknown }>();
            request.body = JsonBodyInterceptor.toJsonObject(request.body);

            return next.handle();
        } catch (error) {
            // Surface parsing errors through the Nest exception filters (HTTP 400).
            return throwError(() => error);
        }
    }

    private static toJsonObject(body: unknown): Record<string, unknown> {
        if (body === undefined || body === null) {
            return {};
        }

        let value: unknown = body;

        if (typeof value === 'string') {
            value = JsonBodyInterceptor.parseJson(value);
        } else if (Buffer.isBuffer(value)) {
            value = JsonBodyInterceptor.parseJson(value.toString('utf8'));
        }

        if (typeof value !== 'object' || value === null || Array.isArray(value)) {
            throw new BadRequestException('Request body must be a JSON object');
        }

        return value as Record<string, unknown>;
    }

    private static parseJson(raw: string): unknown {
        const trimmed = raw.trim();

        // An empty body is treated as "no fields provided".
        if (trimmed.length === 0) {
            return {};
        }

        try {
            return JSON.parse(trimmed);
        } catch {
            throw new BadRequestException('Request body must be valid JSON');
        }
    }
}

/**
 * All identifiers and field values are sent in the request body, never in the
 * URL, so no route below declares a `:param` segment.
 */
@Controller('vacances')
@UseInterceptors(JsonBodyInterceptor)
export class VacController {
    constructor(private readonly vacService: TestService) { }

    // ------------------------------------------------------------------ read

    @Get()
    async getAll() {
        return await this.vacService.findAll();
    }

    @Post('find')
    async getOne(
        @Body() dto: VacancyIdDto,
    ) {
        Logger.log('POST', '/vacances/find');
        return await this.vacService.findOneById(dto.id);
    }

    // ---------------------------------------------------------------- create

    @Post()
    async create(
        @Body() createVacDto: CreateVacancyDto,
    ) {
        Logger.log('POST', '/vacances');
        return await this.vacService.createVac(createVacDto);
    }

    // ---------------------------------------------------------------- update

    /** Partial update: `id` selects the row, only the columns sent are changed. */
    @Patch('update')
    async update(
        @Body() updateVacDto: UpdateVacancyDto,
    ) {
        Logger.log('PATCH', '/vacances/update');
        return await this.vacService.updateVac(updateVacDto.id, updateVacDto);
    }

    @Patch('date-pub')
    async updateDatePub(
        @Body() updateVacDto: UpdateDatePubDto,
    ) {
        Logger.log('PATCH', '/vacances/date-pub');
        return await this.vacService.updateVacDatePub(updateVacDto.id, updateVacDto.date_pub);
    }

    @Patch('company')
    async updateCompany(
        @Body() updateVacDto: UpdateCompanyDto,
    ) {
        Logger.log('PATCH', '/vacances/company');
        return await this.vacService.updateVacCompany(updateVacDto.id, updateVacDto.company);
    }

    @Patch('status')
    async updateStatus(
        @Body() updateVacDto: UpdateStatusDto,
    ) {
        Logger.log('PATCH', '/vacances/status');
        return await this.vacService.updateVacStatus(updateVacDto.id, updateVacDto.status);
    }

    @Patch('role')
    async updateRole(
        @Body() updateVacDto: UpdateRoleDto,
    ) {
        Logger.log('PATCH', '/vacances/role');
        return await this.vacService.updateVacRole(updateVacDto.id, updateVacDto.role);
    }

    @Patch('fit-rating')
    async updateFitRating(
        @Body() updateVacDto: UpdateFitRatingDto,
    ) {
        Logger.log('PATCH', '/vacances/fit-rating');
        return await this.vacService.updateVacFitRating(updateVacDto.id, updateVacDto.fit_rating);
    }

    @Patch('source')
    async updateSource(
        @Body() updateVacDto: UpdateSourceDto,
    ) {
        Logger.log('PATCH', '/vacances/source');
        return await this.vacService.updateVacSource(updateVacDto.id, updateVacDto.source);
    }

    @Patch('note')
    async updateNote(
        @Body() updateVacDto: UpdateNoteDto,
    ) {
        Logger.log('PATCH', '/vacances/note');
        return await this.vacService.updateVacNote(updateVacDto.id, updateVacDto.note);
    }

    @Patch('channel')
    async updateChannel(
        @Body() updateVacDto: UpdateChannelDto,
    ) {
        Logger.log('PATCH', '/vacances/channel');
        return await this.vacService.updateVacChannel(updateVacDto.id, updateVacDto.chanel);
    }

    @Patch('cover-letter')
    async updateCoverLetter(
        @Body() updateVacDto: UpdateCoverLetterDto,
    ) {
        Logger.log('PATCH', '/vacances/cover-letter');
        return await this.vacService.updateVacCoverLetterPath(
            updateVacDto.id,
            updateVacDto.source_cover_latter_s3,
        );
    }

    @Patch('resume')
    async updateResume(
        @Body() updateVacDto: UpdateResumeDto,
    ) {
        Logger.log('PATCH', '/vacances/resume');
        return await this.vacService.updateVacResumePath(
            updateVacDto.id,
            updateVacDto.source_resume_s3,
        );
    }

    // ---------------------------------------------------------------- delete

    /** Deletes a vacancy selected by the id sent in the request body. */
    @Delete('delete')
    async remove(
        @Body() dto: VacancyIdDto,
    ) {
        Logger.log('DELETE', '/vacances/delete');
        return await this.vacService.deleteVacById(dto.id);
    }
}
