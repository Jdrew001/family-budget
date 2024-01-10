import { MigrationInterface, QueryRunner } from "typeorm"

export class UpdateBudgetCategoryReport1704927007862 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`DROP FUNCTION IF EXISTS generate_budget_report(uuid);`);
        queryRunner.query(`
            create function generate_budget_report(budid uuid)
            returns TABLE("categoryId" uuid, "categoryName" character varying, "amountSpent" numeric, "amountBudgeted" numeric, difference numeric)
            language plpgsql
            as
            $$
            BEGIN
                RETURN QUERY
                SELECT
                    c.id as "categoryId",
                    c.name as "categoryName",
                    ROUND(COALESCE(SUM(t.amount)::NUMERIC, 0), 2) AS "amountSpent",
                    ROUND(bc.amount::NUMERIC, 2) as "amountBudgeted",
                    ROUND((bc.amount - COALESCE(SUM(t.amount)::NUMERIC, 0))::NUMERIC, 2) AS "difference"
                FROM
                    category c
                JOIN
                    budget_category bc ON c.id = bc."categoryId"
                LEFT JOIN
                    "transaction" t ON c.id = t."categoryId"
                                AND t."budgetId" = budId
                WHERE
                    bc."budgetId" = budId
                GROUP BY
                    c.id, c.name, bc.amount
                ORDER BY bc.amount DESC;
            END;
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
