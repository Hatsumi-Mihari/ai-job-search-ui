import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeenJobEntity } from './sj.entity.js';
import { UserDataEntity } from '../user_data/ud.entity.js';
import { CreateSeenJobDto } from './dto/create-seen-job.dto.js';
import { Measure } from '@/common/services/index.js';
import {
  assertMaxLength,
  assertNonEmptyString,
  assertOptionalStringArray,
  assertValidUuid,
} from './utils/seen-job-validation.util.js';
import {
  normalizeOptionalStringArray,
  normalizeOptionalText,
} from './utils/seen-job-normalizer.util.js';

/**
 * Fields that are allowed to be changed after a seen job has been created.
 * `job_key` is the UUID primary key and `u_id` is the owner, so neither can be
 * edited through an update.
 */
export type UpdateSeenJobPayload = Partial<
  Omit<CreateSeenJobDto, 'job_key' | 'u_id'>
>;

/** Result returned by every mutating operation of this service. */
export type SeenJobsMutationResult = {
  success: boolean;
  message: string;
  job_key?: string;
};

@Injectable()
export class SeenJobsService {
  constructor(
    @InjectRepository(SeenJobEntity)
    private readonly seenJobRepository: Repository<SeenJobEntity>,
    @InjectRepository(UserDataEntity)
    private readonly userDataRepository: Repository<UserDataEntity>,
  ) {}

  // ---------------------------------------------------------------- create

  @Measure('SeenJobsService')
  async createSeenJob(
    seenJobDTO: CreateSeenJobDto,
  ): Promise<SeenJobsMutationResult> {
    assertValidUuid(seenJobDTO.u_id, 'u_id');
    assertValidUuid(seenJobDTO.job_key, 'job_key');
    assertNonEmptyString(seenJobDTO.title, 'title');
    assertMaxLength(seenJobDTO.title, 255, 'title');
    assertNonEmptyString(seenJobDTO.company, 'company');
    assertMaxLength(seenJobDTO.company, 255, 'company');
    assertNonEmptyString(seenJobDTO.url, 'url');
    assertNonEmptyString(seenJobDTO.status, 'status');
    assertMaxLength(seenJobDTO.status, 100, 'status');
    assertNonEmptyString(seenJobDTO.portal, 'portal');
    assertMaxLength(seenJobDTO.portal, 100, 'portal');
    assertNonEmptyString(seenJobDTO.source, 'source');
    assertMaxLength(seenJobDTO.source, 255, 'source');
    assertOptionalStringArray(seenJobDTO.strengths, 'strengths');
    assertOptionalStringArray(seenJobDTO.gaps, 'gaps');

    const jobKey = seenJobDTO.job_key.trim();
    const userId = seenJobDTO.u_id.trim();

    await this.assertUserExists(userId);

    const existing = await this.seenJobRepository.findOneBy({
      job_key: jobKey,
    });

    if (existing) {
      throw new ConflictException(
        `Seen job with job_key ${jobKey} already exists`,
      );
    }

    const newSeenJob = this.seenJobRepository.create({
      u_id: userId,
      job_key: jobKey,
      title: seenJobDTO.title.trim(),
      company: seenJobDTO.company.trim(),
      url: seenJobDTO.url.trim(),
      location: normalizeOptionalText(seenJobDTO.location),
      first_seen: seenJobDTO.first_seen,
      posted_date: seenJobDTO.posted_date ?? null,
      deadline: seenJobDTO.deadline ?? null,
      fit: normalizeOptionalText(seenJobDTO.fit),
      status: seenJobDTO.status.trim(),
      portal: seenJobDTO.portal.trim(),
      source: seenJobDTO.source.trim(),
      rank_score: seenJobDTO.rank_score ?? null,
      rank_verdict: normalizeOptionalText(seenJobDTO.rank_verdict),
      rank_date: seenJobDTO.rank_date ?? null,
      location_verdict: normalizeOptionalText(seenJobDTO.location_verdict),
      language_gate: normalizeOptionalText(seenJobDTO.language_gate),
      language_note: normalizeOptionalText(seenJobDTO.language_note),
      strengths: normalizeOptionalStringArray(seenJobDTO.strengths),
      gaps: normalizeOptionalStringArray(seenJobDTO.gaps),
    });

    Logger.log(
      `createSeenJob job_key=${jobKey} u_id=${userId}`,
      'SeenJobsService',
    );

    const savedSeenJob = await this.seenJobRepository.save(newSeenJob);

    return {
      success: true,
      message: 'Seen job successfully created',
      job_key: savedSeenJob.job_key,
    };
  }

  // ------------------------------------------------------------------ read

  async findAll(): Promise<SeenJobEntity[]> {
    return await this.seenJobRepository.find({
      order: { first_seen: 'DESC' },
    });
  }

  @Measure('SeenJobsService')
  async findOneById(jobKey: string): Promise<SeenJobEntity> {
    assertValidUuid(jobKey, 'job_key');

    const seenJob = await this.seenJobRepository.findOneBy({
      job_key: jobKey.trim(),
    });

    if (!seenJob) {
      throw new NotFoundException(`Seen job with job_key ${jobKey} not found`);
    }

    return seenJob;
  }

  // ---------------------------------------------------------------- update

  /**
   * Main update entry point: applies only the fields that are present in the
   * payload, leaving every other column untouched.
   */
  @Measure('SeenJobsService')
  async updateSeenJob(
    jobKey: string,
    userId: string,
    seenJobDTO: UpdateSeenJobPayload,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, seenJobDTO);
  }

  @Measure('SeenJobsService')
  async updateSeenJobTitle(
    jobKey: string,
    userId: string,
    title: string,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { title });
  }

  @Measure('SeenJobsService')
  async updateSeenJobCompany(
    jobKey: string,
    userId: string,
    company: string,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { company });
  }

  @Measure('SeenJobsService')
  async updateSeenJobUrl(
    jobKey: string,
    userId: string,
    url: string,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { url });
  }

  @Measure('SeenJobsService')
  async updateSeenJobLocation(
    jobKey: string,
    userId: string,
    location: string | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { location });
  }

  @Measure('SeenJobsService')
  async updateSeenJobFirstSeen(
    jobKey: string,
    userId: string,
    firstSeen: string,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { first_seen: firstSeen });
  }

  @Measure('SeenJobsService')
  async updateSeenJobPostedDate(
    jobKey: string,
    userId: string,
    postedDate: string | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { posted_date: postedDate });
  }

  @Measure('SeenJobsService')
  async updateSeenJobDeadline(
    jobKey: string,
    userId: string,
    deadline: string | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { deadline });
  }

  @Measure('SeenJobsService')
  async updateSeenJobFit(
    jobKey: string,
    userId: string,
    fit: string | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { fit });
  }

  @Measure('SeenJobsService')
  async updateSeenJobStatus(
    jobKey: string,
    userId: string,
    status: string,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { status });
  }

  @Measure('SeenJobsService')
  async updateSeenJobPortal(
    jobKey: string,
    userId: string,
    portal: string,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { portal });
  }

  @Measure('SeenJobsService')
  async updateSeenJobSource(
    jobKey: string,
    userId: string,
    source: string,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { source });
  }

  @Measure('SeenJobsService')
  async updateSeenJobRankScore(
    jobKey: string,
    userId: string,
    rankScore: number | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { rank_score: rankScore });
  }

  @Measure('SeenJobsService')
  async updateSeenJobRankVerdict(
    jobKey: string,
    userId: string,
    rankVerdict: string | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { rank_verdict: rankVerdict });
  }

  @Measure('SeenJobsService')
  async updateSeenJobRankDate(
    jobKey: string,
    userId: string,
    rankDate: string | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { rank_date: rankDate });
  }

  @Measure('SeenJobsService')
  async updateSeenJobLocationVerdict(
    jobKey: string,
    userId: string,
    locationVerdict: string | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, {
      location_verdict: locationVerdict,
    });
  }

  @Measure('SeenJobsService')
  async updateSeenJobLanguageGate(
    jobKey: string,
    userId: string,
    languageGate: string | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { language_gate: languageGate });
  }

  @Measure('SeenJobsService')
  async updateSeenJobLanguageNote(
    jobKey: string,
    userId: string,
    languageNote: string | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { language_note: languageNote });
  }

  @Measure('SeenJobsService')
  async updateSeenJobStrengths(
    jobKey: string,
    userId: string,
    strengths: string[] | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { strengths });
  }

  @Measure('SeenJobsService')
  async updateSeenJobGaps(
    jobKey: string,
    userId: string,
    gaps: string[] | null,
  ): Promise<SeenJobsMutationResult> {
    return this.applyUpdate(jobKey, userId, { gaps });
  }

  // ---------------------------------------------------------------- delete

  /**
   * Deletes a seen job by its UUID primary key. Only `job_key` is required:
   * the owning `user_data` row is never touched and is never cascaded.
   */
  @Measure('SeenJobsService')
  async deleteSeenJobById(
    jobKey: string,
  ): Promise<{ success: boolean; message: string; job_key: string }> {
    assertValidUuid(jobKey, 'job_key');

    const trimmedKey = jobKey.trim();

    const seenJob = await this.seenJobRepository.findOneBy({
      job_key: trimmedKey,
    });

    if (!seenJob) {
      throw new NotFoundException(`Seen job with job_key ${jobKey} not found`);
    }

    await this.seenJobRepository.delete({ job_key: trimmedKey });

    Logger.log(`deleteSeenJobById job_key=${trimmedKey}`, 'SeenJobsService');

    return {
      success: true,
      message: 'Seen job successfully deleted',
      job_key: trimmedKey,
    };
  }

  /** Alias kept short for callers that already use `deleteSeenJob`. */
  async deleteSeenJob(
    jobKey: string,
  ): Promise<{ success: boolean; message: string; job_key: string }> {
    return this.deleteSeenJobById(jobKey);
  }

  // --------------------------------------------------------------- helpers

  /**
   * Verifies that the owner UUID references an existing `user_data` row. The
   * database foreign key enforces the same rule; this check turns the raw
   * constraint failure into a clear 400 response.
   */
  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.userDataRepository.findOneBy({ id: userId });

    if (!user) {
      throw new BadRequestException(
        `u_id ${userId} does not reference an existing user`,
      );
    }
  }

  /**
   * Shared update routine: validates `job_key` + `u_id`, ensures the record
   * exists and belongs to that user, filters out unknown/undefined fields and
   * persists the merged entity.
   */
  private async applyUpdate(
    jobKey: string,
    userId: string,
    patch: UpdateSeenJobPayload,
  ): Promise<SeenJobsMutationResult> {
    assertValidUuid(jobKey, 'job_key');
    assertValidUuid(userId, 'u_id');

    const trimmedKey = jobKey.trim();

    // Ownership check: the row must exist AND belong to the given user.
    const seenJob = await this.seenJobRepository.findOneBy({
      job_key: trimmedKey,
      u_id: userId,
    });

    if (!seenJob) {
      throw new NotFoundException(
        `Seen job with job_key ${jobKey} not found for user ${userId}`,
      );
    }

    const changes: Partial<SeenJobEntity> = {};

    if (patch.title !== undefined) {
      assertNonEmptyString(patch.title, 'title');
      assertMaxLength(patch.title, 255, 'title');
      changes.title = patch.title.trim();
    }

    if (patch.company !== undefined) {
      assertNonEmptyString(patch.company, 'company');
      assertMaxLength(patch.company, 255, 'company');
      changes.company = patch.company.trim();
    }

    if (patch.url !== undefined) {
      assertNonEmptyString(patch.url, 'url');
      changes.url = patch.url.trim();
    }

    if (patch.location !== undefined) {
      changes.location = normalizeOptionalText(patch.location);
    }

    if (patch.first_seen !== undefined) {
      assertNonEmptyString(patch.first_seen, 'first_seen');
      changes.first_seen = patch.first_seen;
    }

    if (patch.posted_date !== undefined) {
      changes.posted_date = patch.posted_date ?? null;
    }

    if (patch.deadline !== undefined) {
      changes.deadline = patch.deadline ?? null;
    }

    if (patch.fit !== undefined) {
      changes.fit = normalizeOptionalText(patch.fit);
    }

    if (patch.status !== undefined) {
      assertNonEmptyString(patch.status, 'status');
      assertMaxLength(patch.status, 100, 'status');
      changes.status = patch.status.trim();
    }

    if (patch.portal !== undefined) {
      assertNonEmptyString(patch.portal, 'portal');
      assertMaxLength(patch.portal, 100, 'portal');
      changes.portal = patch.portal.trim();
    }

    if (patch.source !== undefined) {
      assertNonEmptyString(patch.source, 'source');
      assertMaxLength(patch.source, 255, 'source');
      changes.source = patch.source.trim();
    }

    if (patch.rank_score !== undefined) {
      changes.rank_score = patch.rank_score ?? null;
    }

    if (patch.rank_verdict !== undefined) {
      changes.rank_verdict = normalizeOptionalText(patch.rank_verdict);
    }

    if (patch.rank_date !== undefined) {
      changes.rank_date = patch.rank_date ?? null;
    }

    if (patch.location_verdict !== undefined) {
      changes.location_verdict = normalizeOptionalText(patch.location_verdict);
    }

    if (patch.language_gate !== undefined) {
      changes.language_gate = normalizeOptionalText(patch.language_gate);
    }

    if (patch.language_note !== undefined) {
      changes.language_note = normalizeOptionalText(patch.language_note);
    }

    if (patch.strengths !== undefined) {
      assertOptionalStringArray(patch.strengths, 'strengths');
      changes.strengths = normalizeOptionalStringArray(patch.strengths);
    }

    if (patch.gaps !== undefined) {
      assertOptionalStringArray(patch.gaps, 'gaps');
      changes.gaps = normalizeOptionalStringArray(patch.gaps);
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('No editable fields were provided');
    }

    const merged = this.seenJobRepository.merge(seenJob, changes);

    await this.seenJobRepository.save(merged);

    Logger.log(
      `updateSeenJob job_key=${trimmedKey} u_id=${userId}`,
      'SeenJobsService',
    );

    return {
      success: true,
      message: 'Seen job successfully updated',
      job_key: trimmedKey,
    };
  }
}
