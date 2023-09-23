import { MigrationInterface, QueryRunner } from "typeorm"

export class SeedData1695419162709 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // add one item to the subscription table
        await queryRunner.query(`INSERT INTO subscription (name, description, price) VALUES ('Free', 'Free subscription', 0)`);

        //add five items to the category table with no id
        await queryRunner.query(`INSERT INTO category (name, type) VALUES ('Salary', 0)`);
        await queryRunner.query(`INSERT INTO category (name, type) VALUES ('Interest', 0)`);
        await queryRunner.query(`INSERT INTO category (name, type) VALUES ('Groceries', 1)`);
        await queryRunner.query(`INSERT INTO category (name, type) VALUES ('Rent', 1)`);
        await queryRunner.query(`INSERT INTO category (name, type) VALUES ('Utilities', 1)`);

        // add five items to the budget_period table with no id
        await queryRunner.query(`INSERT INTO budget_period (frequency) VALUES (0)`);
        await queryRunner.query(`INSERT INTO budget_period (frequency) VALUES (1)`);
        await queryRunner.query(`INSERT INTO budget_period (frequency) VALUES (2)`);
        await queryRunner.query(`INSERT INTO budget_period (frequency) VALUES (3)`);
        await queryRunner.query(`INSERT INTO budget_period (frequency) VALUES (4)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
