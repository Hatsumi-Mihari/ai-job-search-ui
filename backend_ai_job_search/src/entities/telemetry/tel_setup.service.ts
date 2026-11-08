import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class TelSetupService implements OnModuleInit {
    private readonly logger = new Logger(TelSetupService.name);

    constructor(private readonly dataSource: DataSource) {}

    async onModuleInit() {
        try {
            await this.dataSource.query(`
                CREATE OR REPLACE FUNCTION update_daily_vacancy_stats()
                RETURNS TRIGGER AS $$
                DECLARE
                    current_date_val DATE;
                BEGIN
                    IF (TG_OP = 'INSERT') THEN
                        current_date_val := CURRENT_DATE;
                        
                        INSERT INTO statistics (date, total_vacancies, success_count, failed_count)
                        VALUES (current_date_val, 0, 0, 0)
                        ON CONFLICT (date) DO NOTHING;

                        UPDATE statistics 
                        SET total_vacancies = total_vacancies + 1,
                            success_count = CASE WHEN NEW.status = 'success' THEN success_count + 1 ELSE success_count END,
                            failed_count = CASE WHEN NEW.status = 'failed' THEN failed_count + 1 ELSE failed_count END
                        WHERE date = current_date_val;
                        
                        RETURN NEW;
                        
                    ELSIF (TG_OP = 'UPDATE') THEN
                        IF (OLD.status <> NEW.status) THEN
                            UPDATE statistics 
                            SET success_count = success_count + CASE WHEN NEW.status = 'success' THEN 1 WHEN OLD.status = 'success' THEN -1 ELSE 0 END,
                                failed_count = failed_count + CASE WHEN NEW.status = 'failed' THEN 1 WHEN OLD.status = 'failed' THEN -1 ELSE 0 END
                            WHERE date = OLD.date_pub::date;
                        END IF;
                        RETURN NEW;
                        
                    ELSIF (TG_OP = 'DELETE') THEN
                        UPDATE statistics 
                        SET total_vacancies = total_vacancies - 1,
                            success_count = success_count - CASE WHEN OLD.status = 'success' THEN 1 ELSE 0 END,
                            failed_count = failed_count - CASE WHEN OLD.status = 'failed' THEN 1 ELSE 0 END
                        WHERE date = OLD.date_pub::date;
                        
                        RETURN OLD;
                    END IF;
                    
                    RETURN NULL;
                END;
                $$ LANGUAGE plpgsql;
            `);

            await this.dataSource.query(`
                DROP TRIGGER IF EXISTS trg_update_daily_vacancy_stats ON vacancies;
                CREATE TRIGGER trg_update_daily_vacancy_stats
                AFTER INSERT OR UPDATE OR DELETE ON vacancies
                FOR EACH ROW
                EXECUTE FUNCTION update_daily_vacancy_stats();
            `);

            this.logger.log('Database trigger successfully initialized!');
        } catch (error) {
            this.logger.error('Failed to initialize database trigger', error);
        }
    }
}