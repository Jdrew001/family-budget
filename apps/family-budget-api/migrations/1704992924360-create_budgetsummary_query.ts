import { MigrationInterface, QueryRunner } from "typeorm"

export class CreateBudgetsummaryQuery1704992924360 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DROP FUNCTION IF EXISTS calculate_budget_summary(uuid);`);
        queryRunner.query(`
            CREATE OR REPLACE FUNCTION calculate_budget_summary(budId UUID)
            RETURNS TABLE ("remainingBudget" NUMERIC, "totalBudget" NUMERIC, "totalSpent" NUMERIC)
            AS
            $$
            BEGIN
                RETURN QUERY
                SELECT
                    ROUND((SUM(bc.amount) - COALESCE(SUM(t.amount), 0))::NUMERIC, 2) AS "remainingBudget",
                    ROUND(SUM(bc.amount)::NUMERIC, 2) AS "totalBudget",
                    ROUND(COALESCE(SUM(t.amount), 0)::NUMERIC, 2) AS "totalSpent"
                FROM
                    budget_category bc
                JOIN
                    category c ON bc."categoryId" = c.id
                LEFT JOIN
                    "transaction" t ON bc."categoryId" = t."categoryId"
                                AND t."budgetId" = budId
                WHERE
                    bc."budgetId" = budId
                    AND c.type = 1;
            END;
            $$
            LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
