import { MigrationInterface, QueryRunner } from "typeorm"

export class GroupTransactionProcedure1702929349363 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            
            CREATE OR REPLACE FUNCTION GET_TRANSACTION_GROUP(transactionId uuid)
            RETURNS TABLE (transactionGroup varchar) AS
            $$
            DECLARE
                transactionDate timestamp;
            BEGIN
                -- Get the transaction date
                SELECT "createdAt" INTO transactionDate
                FROM transaction
                WHERE id = transactionId;
            
                -- Categorize the transaction into groups based on the date
                RETURN QUERY
                SELECT
                    CASE
                        WHEN transactionDate::date = CURRENT_DATE THEN 'Today'::varchar
                        WHEN transactionDate::date = CURRENT_DATE - 1 THEN 'Yesterday'::varchar
                        WHEN transactionDate::date >= CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer
                            AND transactionDate::date < CURRENT_DATE THEN 'This Week'::varchar
                        WHEN transactionDate::date >= CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer - 7
                            AND transactionDate::date < CURRENT_DATE - EXTRACT(DOW FROM CURRENT_DATE)::integer THEN 'Last Week'::varchar
                        WHEN transactionDate::date >= DATE_TRUNC('month', CURRENT_DATE)::date
                            AND transactionDate::date < DATE_TRUNC('month', CURRENT_DATE)::date + INTERVAL '1 month' THEN 'This Month'::varchar
                        WHEN transactionDate::date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date
                            AND transactionDate::date < DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month')::date + INTERVAL '1 month' THEN 'Last Month'::varchar
                        ELSE 'Older'::varchar
                    END AS transactionGroup;
            END;
            $$
            LANGUAGE plpgsql;

            -- Function to fetch transactions group for a given page and page size
            CREATE OR REPLACE FUNCTION FETCH_GROUP_TRANSACTION(
                accountId uuid,
                catId uuid,
                catType INT,
                page_size INT,
                page_number INT)
            RETURNS TABLE (
                id uuid,
                description varchar,
                amount double precision,
                "createdAt" timestamp,
                "createdBy" varchar,
                "categoryId" uuid,
                "categoryType" int,
                "categoryName" varchar,
                "categoryIcon" varchar,
                "budgetId" uuid,
                "budgetStartDate" timestamp,
                "budgetEndDate" timestamp,
                "budgetActiveInd" bool,
                "transactionGroup" varchar
            ) AS
            $$
            BEGIN
                RETURN QUERY
                SELECT
                    t.id,
                    t.description,
                    t.amount,
                    t."createdAt" as "createdAt",
                    t."createdBy" as "createdBy",
                    c.id as "categoryId",
                    c.type as "categoryType",
                    c.name as "categoryName",
                    c.icon as "categoryIcon",
                    bu.id as "budgetId",
                    bu."startDate" as "budgetStartDate",
                    bu."endDate" as "budgetEndDate",
                    bu."activeInd" as "budgetActiveInd",
                    get_transaction_group(t.id) AS "transactionGroup"
                FROM transaction t
                LEFT JOIN category c ON t."categoryId" = c.id
                LEFT JOIN budget bu ON t."budgetId" = bu.id
                WHERE
                    t."accountId" = accountId
                    AND (catId is NULL OR c.id = catId)
                    AND (catType IS NULL OR c."type" = catType)
                ORDER BY t."createdAt" DESC
                LIMIT page_size
                OFFSET (page_number - 1) * page_size;
            END;
            $$
            LANGUAGE plpgsql;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
