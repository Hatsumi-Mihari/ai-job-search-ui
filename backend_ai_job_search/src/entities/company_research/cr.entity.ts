import {
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/** A single source entry stored inside the `sources` jsonb column. */
export interface CompanySourceEntry {
  url: string | null; // Source URL, null when unknown
  notes: string | null; // Free-form notes about the source
}

/** Nested source object stored for every company research record. */
export interface CompanySources {
  website: CompanySourceEntry; // Official company website
  about: CompanySourceEntry; // About / company profile page
  linkedin: CompanySourceEntry; // LinkedIn company page
  reviews: CompanySourceEntry; // Employee / customer reviews
}

@Entity('company_research')
export class CompanyResearchEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('IDX_COMPANY_RESEARCH_COMPANY_HASH', ['company'], { type: 'hash' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  company: string; // Company name

  @Index('IDX_COMPANY_RESEARCH_FETCHED_DATE')
  @Column({ type: 'date', nullable: false })
  fetched_date: string; // Date the research was fetched

  @Column({ type: 'jsonb', nullable: false })
  sources: CompanySources; // Research sources with url and notes per channel

  @Column({ type: 'text', nullable: true })
  network_contacts_note: string | null; // Notes about network contacts

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  created_at: Date; // Timestamp when record was added

  @UpdateDateColumn({ type: 'timestamp', nullable: false })
  updated_at: Date; // Timestamp when record was last updated
}
