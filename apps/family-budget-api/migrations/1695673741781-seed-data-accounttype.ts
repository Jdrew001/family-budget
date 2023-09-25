import { MigrationInterface, QueryRunner } from "typeorm"

export class SeedDataAccounttype1695673741781 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO account_type (name) VALUES ('Checking')`);
        await queryRunner.query(`INSERT INTO account_type (name) VALUES ('Savings')`);
        await queryRunner.query(`INSERT INTO account_type (name) VALUES ('Credit Card')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
