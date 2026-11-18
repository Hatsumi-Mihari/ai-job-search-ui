import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageFileEntity } from './sf.entity.js';
import { CreateStorageFileDto } from './dto/create-storage-file.dto.js';
import { UpdateStorageFileDto as UpdateStorageFilePayload } from './dto/update-storage-file.dto.js';
import { Measure } from '@/common/services/index.js';
import { StorageService } from '@/common/services/index.js'

/** Result returned by every mutating operation of this service. */
export type StorageFileMutationResult = {
    success: boolean;
    message: string;
    id?: string;
};

/** Result returned when a download link is requested for a stored file. */
export type StorageFileDownloadLink = {
    success: boolean;
    file_name: string;
    size_bytes: number;
    download_url: string;
};

@Injectable()
export class StorageFileService {
  /** Columns that a client is allowed to write to. */
  private static readonly EDITABLE_FIELDS: ReadonlyArray<
    keyof CreateStorageFileDto
  > = ['file_name', 'sources3'];

  constructor(
    @InjectRepository(StorageFileEntity)
    private readonly storageFileRepository: Repository<StorageFileEntity>,
    private readonly storageService: StorageService,
    private readonly configService: ConfigService,
  ) {}

  // ---------------------------------------------------------------- create

  @Measure('StorageFileService')
  async createStorageFile(
    file: Express.Multer.File,
  ): Promise<StorageFileMutationResult> {
    const s3Result = await this.storageService.uploadFile(file);

    const newFileEntity = this.storageFileRepository.create({
      file_name: s3Result.fileName,
      size: s3Result.size,
      sources3: s3Result.path,
    });

    Logger.log('createStorageFile', 'StorageFileService');
    const savedFile = await this.storageFileRepository.save(newFileEntity);

    return {
      success: true,
      message: 'Storage file successfully created',
      id: savedFile.id,
    };
  }

  @Measure('StorageFileService')
  async createStorageFileEmpty(
    fileName: string,
  ): Promise<StorageFileMutationResult> {
    const newFileEntity = this.storageFileRepository.create({
      file_name: fileName,
      size: 0,
      sources3: '*',
    });

    Logger.log('createStorageFile', 'StorageFileService');
    const savedFile = await this.storageFileRepository.save(newFileEntity);

    return {
      success: true,
      message: 'Index empty file successfully added',
      id: savedFile.id,
    };
  }

  // ------------------------------------------------------------------ read

  async findAll(): Promise<StorageFileEntity[]> {
    return await this.storageFileRepository.find();
  }

  @Measure('StorageFileService')
  async findOneById(id: string): Promise<StorageFileEntity> {

    const file = await this.storageFileRepository.findOneBy({ id });

    if (!file) {
      throw new NotFoundException(`Storage file with id ${id} not found`);
    }

    return file;
  }

  /**
   * Builds the download link for the most recent record that matches the
   * requested file name.
   */
  @Measure('StorageFileService')
  async getDownloadLinkByName(
    fileName: string,
  ): Promise<StorageFileDownloadLink> {
    this.assertNonEmptyString(fileName, 'file_name');
    this.assertMaxLength(fileName, 256, 'file_name');

    const file = await this.storageFileRepository.findOne({
      where: { file_name: fileName },
      order: { date_add: 'DESC' },
    });

    if (!file) {
      throw new NotFoundException(
        `Storage file with name "${fileName}" not found`,
      );
    }

    Logger.log(
      `getDownloadLinkByName file_name=${fileName}`,
      'StorageFileService',
    );

    return {
      success: true,
      file_name: file.file_name,
      size_bytes: file.size,
      download_url: this.buildDownloadUrl(file.sources3),
    };
  }

  // ---------------------------------------------------------------- update

  /**
   * Applies only the fields that are present in the payload, leaving every
   * other column untouched.
   */
  @Measure('StorageFileService')
  async updateStorageFile(
    id: string,
    fileDTO: UpdateStorageFilePayload,
  ): Promise<StorageFileMutationResult> {

    const file = await this.storageFileRepository.findOneBy({ id });

    if (!file) {
      throw new NotFoundException(`Storage file with id ${id} not found`);
    }

    const changes: Partial<StorageFileEntity> = {};
    const writableChanges = changes as Record<string, unknown>;

    for (const field of StorageFileService.EDITABLE_FIELDS) {
      const value = fileDTO[field];

      // `undefined` keeps the current value, so partial updates stay safe.
      if (value === undefined) {
        continue;
      }

      writableChanges[field] = value;
    }

    if (Object.keys(changes).length === 0) {
      throw new BadRequestException('No editable fields were provided');
    }

    const merged = this.storageFileRepository.merge(file, changes);

    await this.storageFileRepository.save(merged);

    Logger.log(`updateStorageFile id=${id}`, 'StorageFileService');

    return {
      success: true,
      message: 'Storage file successfully updated',
      id,
    };
  }

  // ---------------------------------------------------------------- delete

  /**
   * Deletes every record whose `file_name` matches the requested name.
   * The column is indexed but not unique, so the number of removed rows is
   * reported back to the caller.
   */
  @Measure('StorageFileService')
  async deleteStorageFilesByName(fileName: string): Promise<{
    success: boolean;
    message: string;
    file_name: string;
    deleted: number;
  }> {
    this.assertNonEmptyString(fileName, 'file_name');
    this.assertMaxLength(fileName, 256, 'file_name');

    const result = await this.storageFileRepository.delete({
      file_name: fileName,
    });
    const deleted = result.affected ?? 0;

    if (deleted === 0) {
      throw new NotFoundException(
        `Storage file with name "${fileName}" not found`,
      );
    }

    Logger.log(
      `deleteStorageFilesByName file_name=${fileName} deleted=${deleted}`,
      'StorageFileService',
    );
    await this.storageService.deleteFile(fileName);
    return {
      success: true,
      message: 'Storage file successfully deleted',
      file_name: fileName,
      deleted,
    };
  }

  // --------------------------------------------------------------- helpers

  /**
   * Resolves an S3 key/path into an absolute download URL. A value that is
   * already an absolute URL is returned unchanged. Otherwise the path is
   * appended to the configured storage base URL.
   */
  private buildDownloadUrl(sources3: string): string {
    if (/^https?:\/\//i.test(sources3)) {
      return sources3;
    }

    const baseUrl =
      this.configService.get<string>('STORAGE_DOWNLOAD_BASE_URL') ??
      this.configService.get<string>('STORAGE_BASE_URL');

    if (!baseUrl) {
      throw new InternalServerErrorException(
        'Storage download base URL is not configured (STORAGE_DOWNLOAD_BASE_URL)',
      );
    }

    const normalizedBase = baseUrl.replace(/\/+$/, '');
    const normalizedPath = sources3.replace(/^\/+/, '');

    return `${normalizedBase}/${encodeURI(normalizedPath)}`;
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
