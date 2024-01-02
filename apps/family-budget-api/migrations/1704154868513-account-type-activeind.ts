import { MigrationInterface, QueryRunner } from "typeorm"

export class AccountTypeActiveind1704154868513 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE account_type
            ADD COLUMN active_ind boolean NOT NULL DEFAULT true;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
