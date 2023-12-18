import { MigrationInterface, QueryRunner } from "typeorm"

export class CalcCategoryBudget1702940689640 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        queryRunner.query(`
            CREATE OR REPLACE FUNCTION CALCULATE_CATEGORY_BUDGET(
                catId UUID,
                budId UUID)
            RETURNS TABLE (
                categoryId UUID,
                budgetId UUID,
                amount DOUBLE PRECISION
            ) AS
            $$
            BEGIN
                RETURN QUERY
                SELECT
                    t."categoryId" AS categoryId,
                    t."budgetId" AS budgetId,
                    SUM(t.amount) AS amount
                FROM
                    transaction t
                WHERE
                    t."categoryId" = catId
                    AND t."budgetId" = budId
                GROUP BY
                    t."categoryId", t."budgetId";
            END;
            $$
            LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
