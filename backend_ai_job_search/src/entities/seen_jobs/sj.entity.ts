import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { UserDataEntity } from '../user_data/ud.entity.js';

/**
 * A job vacancy that has already been seen by the scraper.
 *
 * Every record belongs to exactly one `user_data` row through `uID`, and the
 * natural key `job_key` (for example `portal:external_id`) is unique per user,
 * so the same offer can never be stored twice for the same user.
 */
@Entity('seen_jobs')
@Unique('UQ_SEEN_JOBS_USER_JOB_KEY', ['u_id', 'job_key'])
export class SeenJobEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'ID' })
  id: string; // Generated primary key

  @Column({ type: 'uuid', name: 'uID', nullable: false })
  u_id: string; // Owner of the record (user_data.id)

  @ManyToOne(() => UserDataEntity, { nullable: false, onDelete: 'NO ACTION' })
  @JoinColumn({ name: 'uID', referencedColumnName: 'id' })
  user: UserDataEntity; // Foreign key to user_data; never cascaded

  @Column({ type: 'varchar', length: 255, nullable: false })
  job_key: string; // Stable unique key of the offer

  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string; // Job title

  @Index('IDX_SEEN_JOBS_COMPANY_HASH', ['company'], { type: 'hash' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  company: string; // Hiring company

  @Column({ type: 'text', nullable: false })
  url: string; // Original offer URL

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string | null; // Offer location, null when unknown

  @Index('IDX_SEEN_JOBS_FIRST_SEEN')
  @Column({ type: 'date', nullable: false })
  first_seen: string; // Date the offer was first discovered

  @Column({ type: 'date', nullable: true })
  posted_date: string | null; // Date the offer was published

  @Column({ type: 'date', nullable: true })
  deadline: string | null; // Application deadline

  @Column({ type: 'varchar', length: 100, nullable: true })
  fit: string | null; // Fit label assigned to the offer

  @Index('IDX_SEEN_JOBS_STATUS_HASH', ['status'], { type: 'hash' })
  @Column({ type: 'varchar', length: 100, nullable: false })
  status: string; // Processing / application status

  @Index('IDX_SEEN_JOBS_PORTAL_HASH', ['portal'], { type: 'hash' })
  @Column({ type: 'varchar', length: 100, nullable: false })
  portal: string; // Portal the offer was found on

  @Column({ type: 'varchar', length: 255, nullable: false })
  source: string; // Source channel / feed of the offer

  @Column({ type: 'int', nullable: true })
  rank_score: number | null; // Numeric ranking score

  @Column({ type: 'varchar', length: 255, nullable: true })
  rank_verdict: string | null; // Ranking verdict text

  @Column({ type: 'date', nullable: true })
  rank_date: string | null; // Date the offer was ranked

  @Column({ type: 'varchar', length: 255, nullable: true })
  location_verdict: string | null; // Verdict about the offer location

  @Column({ type: 'varchar', length: 100, nullable: true })
  language_gate: string | null; // Language gate result

  @Column({ type: 'text', nullable: true })
  language_note: string | null; // Free-form language notes

  @Column({ type: 'text', array: true, nullable: true })
  strengths: string[] | null; // Strengths found in the offer

  @Column({ type: 'text', array: true, nullable: true })
  gaps: string[] | null; // Gaps / missing requirements found in the offer
}
