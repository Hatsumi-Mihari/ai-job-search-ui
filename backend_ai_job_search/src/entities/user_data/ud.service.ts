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
    const newUserData = this.userDataRepository.create(userDataDTO);

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
