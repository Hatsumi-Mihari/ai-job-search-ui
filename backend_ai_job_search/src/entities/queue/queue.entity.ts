import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** Lifecycle states of a background job. */
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * A single background task (or step of a task chain).
 *
 * `status` + `available_at` are indexed together because the worker lock query
 * always filters on both columns, and orders by `available_at`.
 */
@Entity('queue')
@Index('IDX_JOBS_STATUS_AVAILABLE_AT', ['status', 'available_at'])
export class JobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_JOBS_TYPE_HASH', ['type'], { type: 'hash' })
  @Column({ type: 'varchar', length: 100, nullable: false })
  type: string; // Task / chain type, e.g. 'vacancy_processing_chain'

  @Column({ type: 'varchar', length: 20, nullable: false, default: JobStatus.PENDING })
  status: JobStatus; // pending | processing | completed | failed

  @Column({ type: 'varchar', length: 100, nullable: true })
  step: string | null; // Current step in the chain, e.g. 'PREPARE_INDEX', 'WAIT_AI', 'SAVE'

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, unknown> | null; // Input data / metadata for the task

  @Column({ type: 'jsonb', nullable: true })
  result: Record<string, unknown> | null; // Output data or file links

  @Column({ type: 'text', nullable: true })
  error: string | null; // Error message when the task failed

  @Column({ type: 'int', nullable: false, default: 0 })
  attempts: number; // How many times a worker already claimed this job

  @Column({ type: 'int', nullable: false, default: 3 })
  max_attempts: number; // Retry budget before the job is marked as failed

  @Column({ type: 'timestamp', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  available_at: Date; // Earliest timestamp at which a worker may claim the job

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date; // Timestamp when the job was enqueued

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updated_at: Date; // Timestamp of the last change
}
