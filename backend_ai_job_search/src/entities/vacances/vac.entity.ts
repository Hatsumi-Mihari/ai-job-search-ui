import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToOne,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import {StorageFileEntity} from '../storage_files/sf.entity.js'

@Entity('vacancies')
export class VacancyEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date', nullable: false })
  date_pub: string; // Publication date

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  date_add: Date; // Timestamp when record was added

  @Column({ type: 'varchar', length: 255, nullable: false })
  @Index('IDX_COMPANY_HASH', ['company'], { type: 'hash' })
  company: string; // Company name

  @Index('IDX_STATUS_HASH', ['status'], { type: 'hash' })
  @Column({ type: 'varchar', length: 100, nullable: false })
  status: string; // Application status

  @Column({ type: 'text', nullable: false })
  role: string; // Role title

  @Column({ type: 'int', nullable: false })
  fit_rating: number; // Fit rating score

  @Column({ type: 'varchar', length: 500, nullable: true })
  source: string; // Source URL or link

  @Column({ type: 'text', nullable: true })
  note: string; // Additional notes (required)

  @Column({ type: 'uuid', nullable: true })
  source_cover_latter_id: string | null; // S3 path for cover letter (optional)

  @Column({ type: 'uuid', nullable: true })
  source_resume_id: string | null; // S3 path for resume (optional)

  @Index('IDX_CHANNEL_HASH', ['chanel'], { type: 'hash' })
  @Column({ type: 'varchar', length: 50, nullable: true })
  chanel: string; // Communication or application channel (required)

  @ManyToOne(() => StorageFileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_resume_id' })
  resumeFile: StorageFileEntity;

  @ManyToOne(() => StorageFileEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'source_cover_latter_id' })
  coverLetterFile: StorageFileEntity;
}