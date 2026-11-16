import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { StorageFileService } from './sf.service.js';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateStorageFileDto } from './dto/create-storage-file.dto.js';
import { StorageFileIdDto } from './dto/storage-file-id.dto.js';
import { StorageFileNameDto } from './dto/storage-file-name.dto.js';
import { UpdateStorageFileDto } from './dto/update-storage-file.dto.js';

/**
 * All identifiers and field values are sent in the request body, never in the
 * URL, so no route below declares a `:param` segment.
 */
@Controller('storage-files')
export class StorageFileController {
  constructor(private readonly storageFileService: StorageFileService) {}

  // ------------------------------------------------------------------ read

  @Get()
  async getAll() {
    return await this.storageFileService.findAll();
  }

  @Post('find')
  async getOne(@Body() dto: StorageFileIdDto) {
    Logger.log('POST', '/storage-files/find');
    return await this.storageFileService.findOneById(dto.id);
  }

  /** Returns the download link for the file selected by name. */
  @Post('download-link')
  async getDownloadLink(@Body() dto: StorageFileNameDto) {
    Logger.log('POST', '/storage-files/download-link');
    return await this.storageFileService.getDownloadLinkByName(dto.file_name);
  }

  // ---------------------------------------------------------------- create

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @UploadedFile() file: Express.Multer.File,
  ) {
    Logger.log('POST', '/storage-files');
    return await this.storageFileService.createStorageFile(
      file
    );
  }

  // ---------------------------------------------------------------- update

  /** Partial update: `id` selects the row, only the columns sent are changed. */
  @Patch('update')
  async update(@Body() updateStorageFileDto: UpdateStorageFileDto) {
    Logger.log('PATCH', '/storage-files/update');
    return await this.storageFileService.updateStorageFile(
      updateStorageFileDto.id,
      updateStorageFileDto,
    );
  }

  // ---------------------------------------------------------------- delete

  /** Deletes every stored-file record selected by the name in the body. */
  @Delete('delete')
  async remove(@Body() dto: StorageFileNameDto) {
    Logger.log('DELETE', '/storage-files/delete');
    return await this.storageFileService.deleteStorageFilesByName(
      dto.file_name,
    );
  }
}
