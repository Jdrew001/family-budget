import { MigrationInterface, QueryRunner } from "typeorm"

export class FrequencyRefCreation1698467438524 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE IF EXISTS frequency_ref;
            CREATE TABLE frequency_ref (
                id VARCHAR PRIMARY KEY,
                name VARCHAR NOT NULL,
                type VARCHAR NOT NULL
            );

            INSERT INTO frequency_ref (id, name, type) VALUES
                (1, 'Weekly', 0);
            
            INSERT INTO frequency_ref (id, name, type) VALUES
                (2, 'Bi-Weekly', 1);
                
            INSERT INTO frequency_ref (id, name, type) VALUES
                (3, 'Monthly', 2);

            INSERT INTO frequency_ref (id, name, type) VALUES
                (4, 'Quarterly', 3);

            INSERT INTO frequency_ref (id, name, type) VALUES
                (5, 'Annually', 4);
            
        `);
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
