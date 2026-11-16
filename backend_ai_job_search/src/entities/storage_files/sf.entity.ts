import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('storage_files')
export class StorageFileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Index('IDX_STORAGE_FILE_NAME_HASH', ['file_name'], { type: 'hash' })
  @Column({ type: 'varchar', length: 256, nullable: false })
  file_name: string; // Name of the stored file

  @Column({ type: 'int', nullable: false })
  size: number; // size of the stored file

  @Column({ type: 'varchar', length: 256, nullable: false })
  sources3: string; // S3 key/path of the stored file

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  date_add: Date; // Timestamp when record was added
}
