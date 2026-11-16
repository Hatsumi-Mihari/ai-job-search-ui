import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('telemetry')
export class TelemetryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @CreateDateColumn({ type: 'timestamp', nullable: false })
  date: Date; // Timestamp when record was added

  @Column({ type: 'int', default: 0 })
  total_vacancies: number;

  @Column({ type: 'int', default: 0 })
  success_count: number;

  @Column({ type: 'int', default: 0 })
  failed_count: number;

  @Column({ type: 'int', default: 0 })
  interview_count: number;
}