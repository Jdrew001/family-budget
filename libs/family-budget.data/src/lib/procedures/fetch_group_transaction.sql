-- Creating a Stored Procedure in PostgreSQL
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