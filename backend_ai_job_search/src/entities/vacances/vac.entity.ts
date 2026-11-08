import { Entity, Index, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToOne } from 'typeorm';


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

    @Column({ type: 'text', nullable: false })
    source: string; // Source URL or link

    @Column({ type: 'text', nullable: true })
    note: string; // Additional notes (required)

    @Column({ type: 'varchar', length: 500, nullable: true })
    source_cover_latter_s3: string; // S3 path for cover letter (optional)

    @Column({ type: 'varchar', length: 500, nullable: true })
    source_resume_s3: string; // S3 path for resume (optional)

    @Column({ type: 'varchar', length: 50, nullable: true })
    chanel: string; // Communication or application channel (required)
}