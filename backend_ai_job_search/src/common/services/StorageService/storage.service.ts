import { Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import 'multer';

@Injectable()
export class StorageService {
  private s3Client: S3Client;
  private readonly s3Bucket: string;

  constructor(private readonly configService: ConfigService) {
    this.s3Client = new S3Client({
      region: this.configService.get<string>('AWS_REGION', 'us-east-1'),
      endpoint: this.configService.get<string>('S3_ENDPOINT'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.get<string>(
          'AWS_ACCESS_KEY_ID',
          'test',
        ),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
          'test',
        ),
      },
    });
    this.s3Bucket = this.configService.get<string>(
      'S3_BUCKET_NAME',
      'test-bucket',
    );
  }

  // 1. File upload
  async uploadFile(file: Express.Multer.File) {
    const fileKey = `${Date.now()}-${file.originalname}`;

    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      Logger.log(`Upload file -> ${file.originalname}`, 'StorageService');

      return {
        success: true,
        fileName: fileKey,
        size: file.size,
        path: `${this.configService.get<string>('S3_ENDPOINT')}/${this.s3Bucket}/${fileKey}`,
      };
    } catch (error) {
      Logger.error(`Failed to upload file: ${error}`, 'StorageService');
      return {
        success: false,
        fileName: fileKey,
        error: error,
      };
    }
  }

  // 2. Update (overwrite) file by existing key
  async updateFile(fileKey: string, file: Express.Multer.File) {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.s3Bucket,
          Key: fileKey,
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      );
      Logger.log(`Update file -> ${fileKey}`, 'StorageService');

      return {
        success: true,
        fileName: fileKey,
        size: file.size,
        path: `${this.configService.get<string>('S3_ENDPOINT')}/${this.s3Bucket}/${fileKey}`,
      };
    } catch (error) {
      Logger.error(
        `Failed to update file ${fileKey}: ${error}`,
        'StorageService',
      );
      return {
        success: false,
        fileName: fileKey,
        error: error,
      };
    }
  }

  // 3. Download file (returns Body stream and metadata)
  async downloadFile(fileKey: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: fileKey,
      });

      const response = await this.s3Client.send(command);
      Logger.log(`Download file -> ${fileKey}`, 'StorageService');

      return {
        success: true,
        fileName: fileKey,
        contentType: response.ContentType,
        contentLength: response.ContentLength,
        body: response.Body,
      };
    } catch (error) {
      Logger.error(
        `Failed to download file ${fileKey}: ${error}`,
        'StorageService',
      );
      return {
        success: false,
        fileName: fileKey,
        error: error,
      };
    }
  }

  // 4. Delete file
  async deleteFile(fileKey: string) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.s3Bucket,
        Key: fileKey,
      });

      await this.s3Client.send(command);
      Logger.log(`Deleted file -> ${fileKey} | Status: ok`, 'StorageService');

      return {
        success: true,
        fileName: fileKey,
      };
    } catch (error) {
      Logger.error(
        `Failed to delete file ${fileKey}: ${error}`,
        'StorageService',
      );
      return {
        success: false,
        fileName: fileKey,
        error: error,
      };
    }
  }
}
