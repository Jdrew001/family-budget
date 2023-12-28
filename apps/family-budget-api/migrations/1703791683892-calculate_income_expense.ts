import { MigrationInterface, QueryRunner } from "typeorm"

export class CalculateIncomeExpense1703791683892 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            CREATE OR REPLACE FUNCTION CALCULATE_INCOME_EXPENSE(
                accId UUID
            )
            RETURNS TABLE (
                "accountId" UUID,
                income DOUBLE PRECISION,
                expense DOUBLE PRECISION
            ) AS
            $$
            BEGIN
                RETURN QUERY
                SELECT
                    accId AS "accountId",
                    COALESCE(SUM(CASE WHEN c.type = 0 THEN t.amount ELSE 0 END), 0) AS income,
                    COALESCE(SUM(CASE WHEN c.type = 1 THEN -t.amount ELSE 0 END), 0) AS expense
                FROM
                    transaction t
                JOIN
                    category c ON t."categoryId" = c.id
                WHERE
                    t."accountId" = accId;
            END;
            $$
            LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
