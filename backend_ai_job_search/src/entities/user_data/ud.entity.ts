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
}
