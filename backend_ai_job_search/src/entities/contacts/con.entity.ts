import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('contacts')
export class ContactEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index('IDX_CONTACT_NAME_HASH', ['name'], { type: 'hash' })
  @Column({ type: 'varchar', length: 128, nullable: false })
  name: string; // Contact name

  @Column({ type: 'text', nullable: true })
  url: string; // Contact URL or link

  @Index('IDX_CONTACT_SOURCE_HASH', ['source'], { type: 'hash' })
  @Column({ type: 'varchar', length: 128, nullable: false })
  source: string; // Where the contact comes from

  @Column({ type: 'text', nullable: true })
  note: string; // Additional notes

  @CreateDateColumn({ type: 'timestamp', nullable: false })
  date_add: Date; // Timestamp when record was added

  @Index('IDX_CONTACT_STATUS_HASH', ['status'], { type: 'hash' })
  @Column({ type: 'varchar', length: 64, nullable: false })
  status: string; // Contact status
}
