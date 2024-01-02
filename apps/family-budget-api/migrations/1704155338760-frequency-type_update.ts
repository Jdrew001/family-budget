import { MigrationInterface, QueryRunner } from "typeorm"

export class FrequencyTypeUpdate1704155338760 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE frequency_ref 
            ADD COLUMN active_ind boolean NOT NULL DEFAULT true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
