import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateCalcincomeExpense1704997677985 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DROP FUNCTION IF EXISTS calculate_income_expense_summary(UUID);`);
        queryRunner.query(`
            CREATE OR REPLACE FUNCTION calculate_income_expense_summary(budId UUID)
            RETURNS TABLE ("totalIncome" NUMERIC, "totalExpense" NUMERIC)
            AS
            $$
            BEGIN
                RETURN QUERY
                SELECT
                    ROUND(COALESCE(SUM(CASE WHEN c.type = 0 THEN t.amount END), 0)::NUMERIC, 2) AS "totalIncome",
                    ROUND(COALESCE(SUM(CASE WHEN c.type = 1 THEN t.amount END), 0)::NUMERIC, 2) AS "totalExpense"
                FROM
                    budget b
                JOIN
                    budget_category bc ON b.id = bc."budgetId"
                JOIN
                    category c ON bc."categoryId" = c.id
                LEFT JOIN
                    "transaction" t ON bc."categoryId" = t."categoryId" AND t."budgetId" = b.id
                WHERE
                    b.id = budId;
            END;
            $$
            LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
