import { MigrationInterface, QueryRunner } from "typeorm"

export class InitData1701992321047 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO account_type (name) VALUES ('Checking')`);
        await queryRunner.query(`INSERT INTO account_type (name) VALUES ('Savings')`);
        await queryRunner.query(`INSERT INTO account_type (name) VALUES ('Credit Card')`);

        await queryRunner.query(`INSERT INTO subscription (name, description, price) VALUES ('Free', 'Free Subscription', 0);`);

        await queryRunner.query(`
            INSERT INTO budget_period (frequency) VALUES (0);
            INSERT INTO budget_period (frequency) VALUES (1);
            INSERT INTO budget_period (frequency) VALUES (2);
            INSERT INTO budget_period (frequency) VALUES (3);
            INSERT INTO budget_period (frequency) VALUES (4);
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
