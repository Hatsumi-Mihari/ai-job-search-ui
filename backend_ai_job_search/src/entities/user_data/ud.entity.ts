import { Entity, Index, PrimaryGeneratedColumn, Column } from 'typeorm';

export interface SocialMedia {
  platform: string;
  url: string;
}

@Entity('user_data')
export class UserDataEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 256, nullable: false })
  email: string; // Contact email address

  @Column({ type: 'varchar', length: 32, nullable: false })
  phone: string; // Contact phone number

  @Column({ type: 'varchar', length: 512, nullable: false })
  address: string; // Contact address

  @Column({ type: 'jsonb', nullable: false, default: [] })
  social_media: SocialMedia[]; // Social media profiles

  @Column({ type: 'varchar', length: 512, nullable: false })
  img_url: string; // URL of the user's image

  @Index('IDX_USER_DATA_USER_NAME_HASH', ['user_name'], { type: 'hash' })
  @Column({ type: 'varchar', length: 128, nullable: false })
  user_name: string; // Name of the user the data belongs to

  @Column({ type: 'text', array: true, default: '{}' })
  sources_research: string[];

  @Column({ type: 'varchar', length: 512, nullable: false })
  resume_template_url: string; // URL of the resume template

  @Column({ type: 'varchar', length: 512, nullable: false })
  cover_template_url: string; // URL of the cover letter template

  @Column({ type: 'text', nullable: true, name: 'CLAUDE_md' })
  claude_md: string | null; // Markdown content of CLAUDE.md

  @Column({ type: 'text', nullable: true, name: '01-candidate-profile_md' })
  candidate_profile_md: string | null; // Markdown content of 01-candidate-profile.md

  @Column({ type: 'text', nullable: true, name: '02-behavioral-profile_md' })
  behavioral_profile_md: string | null; // Markdown content of 02-behavioral-profile.md

  @Column({ type: 'text', nullable: true, name: '03-writing-style_md' })
  writing_style_md: string | null; // Markdown content of 03-writing-style.md

  @Column({ type: 'text', nullable: true, name: '04-job-evaluation_md' })
  job_evaluation_md: string | null; // Markdown content of 04-job-evaluation.md

  @Column({ type: 'text', nullable: true, name: '07-interview-prep_md' })
  interview_prep_md: string | null; // Markdown content of 07-interview-prep.md

  @Column({ type: 'text', nullable: true, name: 'search-queries_md' })
  search_queries_md: string | null; // Markdown content of search-queries.md
}
