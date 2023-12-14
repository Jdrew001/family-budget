import { MigrationInterface, QueryRunner } from "typeorm"

export class AccountTypeUpdate1702586193290 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`UPDATE account_type SET "sortOrder" = 1 WHERE name = 'Savings'`);
        await queryRunner.query(`UPDATE account_type SET "sortOrder" = 2 WHERE name = 'Credit Card'`);
        await queryRunner.query(`UPDATE account_type SET "name" = 'Debt' WHERE name = 'Credit Card'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
