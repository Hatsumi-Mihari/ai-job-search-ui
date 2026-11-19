import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDataEntity, type SocialMedia } from './ud.entity.js';
import { CreateUserDataDto } from './dto/create-user-data.dto.js';
import { withDefaultDocuments } from './utils/default-documents.util.js';
import { Measure } from '@/common/services/index.js';

/**
 * Fields that are allowed to be changed after a user data record has been
 * created. `id` is managed by the database and must never be edited.
 */
export type UpdateUserDataPayload = Partial<CreateUserDataDto>;

/** Result returned by every mutating operation of this service. */
export type UserDataMutationResult = {
  success: boolean;
  message: string;
  id?: string;
};

/** Columns that hold the content of a markdown document of the user profile. */
export type MarkdownField =
  | 'claude_md'
  | 'candidate_profile_md'
  | 'behavioral_profile_md'
  | 'writing_style_md'
  | 'job_evaluation_md'
  | 'cv_templates_md'
  | 'cover_letter_templates_md'
  | 'interview_prep_md'
  | 'application_forms_md'
  | 'web_research_md'
  | 'search_queries_md';

@Injectable()
export class UserDataService {
  /** Columns that a client is allowed to write to. */
  private static readonly EDITABLE_FIELDS: ReadonlyArray<
    keyof UpdateUserDataPayload
  > = [
    'user_name',
    'sources_research',
    'resume_template_url',
    'cover_template_url',
    'email',
    'phone',
    'address',
    'social_media',
    'img_url',
    'claude_md',
    'candidate_profile_md',
    'behavioral_profile_md',
    'writing_style_md',
    'job_evaluation_md',
    'cv_templates_md',
    'cover_letter_templates_md',
    'interview_prep_md',
    'application_forms_md',
    'web_research_md',
    'search_queries_md',
  ];

  /** Markdown document columns. They are stored as plain text and may be empty. */
  private static readonly MARKDOWN_FIELDS: ReadonlyArray<MarkdownField> = [
    'claude_md',
    'candidate_profile_md',
    'behavioral_profile_md',
    'writing_style_md',
    'job_evaluation_md',
    'cv_templates_md',
    'cover_letter_templates_md',
    'interview_prep_md',
    'application_forms_md',
    'web_research_md',
    'search_queries_md',
  ];

  constructor(
    @InjectRepository(UserDataEntity)
    private readonly userDataRepository: Repository<UserDataEntity>,
  ) {}

  // ---------------------------------------------------------------- create

  @Measure('UserDataService')
  async createUserData(
    userDataDTO: CreateUserDataDto,
  ): Promise<UserDataMutationResult> {
    // Omitted markdown documents start with the framework defaults from
    // `src/common/ai/defSkills/` instead of null.
    const newUserData = this.userDataRepository.create(
      withDefaultDocuments(userDataDTO),
    );

    Logger.log('createUserData', 'UserDataService');

    const savedUserData = await this.userDataRepository.save(newUserData);

    return {
      success: true,
      message: 'User data successfully created',
      id: savedUserData.id,
    };
  }

  // ------------------------------------------------------------------ read

  async findAll(): Promise<UserDataEntity[]> {
    return await this.userDataRepository.find();
  }

  @Measure('UserDataService')
  async findOneById(id: string): Promise<UserDataEntity> {
    this.assertValidId(id);

    const userData = await this.userDataRepository.findOneBy({ id });

    if (!userData) {
      throw new NotFoundException(`User data with id ${id} not found`);
    }

    return userData;
  }

  // ---------------------------------------------------------------- update

  /**
   * Main update entry point: applies only the fields that are present in the
   * payload, leaving every other column untouched.
   */
  @Measure('UserDataService')
  async updateUserData(
    id: string,
    userDataDTO: UpdateUserDataPayload,
  ): Promise<UserDataMutationResult> {
    return this.applyUpdate(id, userDataDTO);
  }

  @Measure('UserDataService')
  async updateUserDataUserName(
    id: string,
    userName: string,
  ): Promise<UserDataMutationResult> {
    this.assertNonEmptyString(userName, 'user_name');
    this.assertMaxLength(userName, 128, 'user_name');

    return this.applyUpdate(id, { user_name: userName });
  }

  @Measure('UserDataService')
  async updateUserDataResumeTemplateUrl(
    id: string,
    url: string,
  ): Promise<UserDataMutationResult> {
    this.assertNonEmptyString(url, 'resume_template_url');
    this.assertMaxLength(url, 512, 'resume_template_url');

    return this.applyUpdate(id, { resume_template_url: url });
  }

  @Measure('UserDataService')
  async updateUserDataCoverTemplateUrl(
    id: string,
    url: string,
  ): Promise<UserDataMutationResult> {
    this.assertNonEmptyString(url, 'cover_template_url');
    this.assertMaxLength(url, 512, 'cover_template_url');

    return this.applyUpdate(id, { cover_template_url: url });
  }

  @Measure('UserDataService')
  async updateUserDataSourcesResearch(
    id: string,
    sources: string[] | undefined,
  ): Promise<UserDataMutationResult> {
    return this.applyUpdate(id, { sources_research: sources });
  }

  @Measure('UserDataService')
  async updateUserDataEmail(
    id: string,
    email: string,
  ): Promise<UserDataMutationResult> {
    this.assertNonEmptyString(email, 'email');
    this.assertMaxLength(email, 256, 'email');

    return this.applyUpdate(id, { email });
  }

  @Measure('UserDataService')
  async updateUserDataPhone(
    id: string,
    phone: string,
  ): Promise<UserDataMutationResult> {
    this.assertNonEmptyString(phone, 'phone');
    this.assertMaxLength(phone, 32, 'phone');

    return this.applyUpdate(id, { phone });
  }

  @Measure('UserDataService')
  async updateUserDataAddress(
    id: string,
    address: string,
  ): Promise<UserDataMutationResult> {
    this.assertNonEmptyString(address, 'address');
    this.assertMaxLength(address, 512, 'address');

    return this.applyUpdate(id, { address });
  }

  @Measure('UserDataService')
  async updateUserDataSocialMedia(
    id: string,
    socialMedia: SocialMedia[],
  ): Promise<UserDataMutationResult> {
    this.assertSocialMedia(socialMedia);

    return this.applyUpdate(id, { social_media: socialMedia });
  }

  @Measure('UserDataService')
  async updateUserDataImgUrl(
    id: string,
    url: string,
  ): Promise<UserDataMutationResult> {
    this.assertNonEmptyString(url, 'img_url');
    this.assertMaxLength(url, 512, 'img_url');

    return this.applyUpdate(id, { img_url: url });
  }

  // ------------------------------------------------- markdown document fields

  @Measure('UserDataService')
  async updateUserDataClaudeMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'claude_md');

    return this.applyUpdate(id, { claude_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataCandidateProfileMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'candidate_profile_md');

    return this.applyUpdate(id, { candidate_profile_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataBehavioralProfileMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'behavioral_profile_md');

    return this.applyUpdate(id, { behavioral_profile_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataWritingStyleMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'writing_style_md');

    return this.applyUpdate(id, { writing_style_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataJobEvaluationMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'job_evaluation_md');

    return this.applyUpdate(id, { job_evaluation_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataCvTemplatesMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'cv_templates_md');

    return this.applyUpdate(id, { cv_templates_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataCoverLetterTemplatesMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'cover_letter_templates_md');

    return this.applyUpdate(id, { cover_letter_templates_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataInterviewPrepMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'interview_prep_md');

    return this.applyUpdate(id, { interview_prep_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataApplicationFormsMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'application_forms_md');

    return this.applyUpdate(id, { application_forms_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataWebResearchMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'web_research_md');

    return this.applyUpdate(id, { web_research_md: markdown });
  }

  @Measure('UserDataService')
  async updateUserDataSearchQueriesMd(
    id: string,
    markdown: string,
  ): Promise<UserDataMutationResult> {
    this.assertMarkdown(markdown, 'search_queries_md');

    return this.applyUpdate(id, { search_queries_md: markdown });
  }

  // ---------------------------------------------------------------- delete

  /**
   * Deletes a user data record by its primary key. Records can only be removed
   * by id, so no other criteria (user_name, ...) is accepted here.
   */
  @Measure('UserDataService')
  async deleteUserDataById(
    id: string,
  ): Promise<{ success: boolean; message: string; id: string }> {
    this.assertValidId(id);

    const userData = await this.userDataRepository.findOneBy({ id });

    if (!userData) {
      throw new NotFoundException(`User data with id ${id} not found`);
    }

    await this.userDataRepository.delete({ id });

    Logger.log(`deleteUserDataById id=${id}`, 'UserDataService');

    return {
      success: true,
      message: 'User data successfully deleted',
      id,
    };
  }

  /** Alias kept short for callers that already use `deleteUserData`. */
  async deleteUserData(
    id: string,
  ): Promise<{ success: boolean; message: string; id: string }> {
    return this.deleteUserDataById(id);
  }

  // --------------------------------------------------------------- helpers

  /**
   * Shared update routine: validates the id, ensures the record exists,
   * filters out unknown/undefined fields and persists the merged entity.
   */
  private async applyUpdate(
    id: string,
    patch: UpdateUserDataPayload,
  ): Promise<UserDataMutationResult> {
    this.assertValidId(id);

    const userData = await this.userDataRepository.findOneBy({ id });

    if (!userData) {
      throw new NotFoundException(`User data with id ${id} not found`);
    }

    const changes: Partial<UserDataEntity> = {};
    const writableChanges = changes as Record<string, unknown>;

    for (const field of UserDataService.EDITABLE_FIELDS) {
      const value = patch[field];

      // `undefined` keeps the current value, so partial updates stay safe.
      if (value === undefined) {
        continue;
      }

      writableChanges[field] = value;
    }

    if (changes.social_media !== undefined) {
      this.assertSocialMedia(changes.social_media);
    }

    for (const field of UserDataService.MARKDOWN_FIELDS) {
      const value = changes[field];

      if (value !== undefined) {
        this.assertMarkdown(value, field);
      }
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('No editable fields were provided');
    }

    const merged = this.userDataRepository.merge(userData, changes);

    await this.userDataRepository.save(merged);

    Logger.log(`updateUserData id=${id}`, 'UserDataService');

    return {
      success: true,
      message: 'User data successfully updated',
      id,
    };
  }

  private assertValidId(id: string): void {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!id || typeof id !== 'string' || !uuidRegex.test(id)) {
      throw new BadRequestException('User data id must be a valid UUID');
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

  /**
   * Markdown documents are free-form text, so only the type is enforced.
   * An empty string is accepted and clears the stored document.
   */
  private assertMarkdown(
    value: unknown,
    field: string,
  ): asserts value is string {
    if (typeof value !== 'string') {
      throw new BadRequestException(`${field} must be a string`);
    }
  }

  private assertSocialMedia(value: unknown): asserts value is SocialMedia[] {
    if (!Array.isArray(value)) {
      throw new BadRequestException('social_media must be an array');
    }

    value.forEach((item: unknown, index: number) => {
      if (typeof item !== 'object' || item === null || Array.isArray(item)) {
        throw new BadRequestException(
          `social_media[${index}] must be an object`,
        );
      }

      for (const field of ['platform', 'url'] as const) {
        const fieldValue = (item as Record<string, unknown>)[field];

        if (typeof fieldValue !== 'string' || fieldValue.trim().length === 0) {
          throw new BadRequestException(
            `social_media[${index}].${field} must be a non-empty string`,
          );
        }
      }
    });
  }
}
