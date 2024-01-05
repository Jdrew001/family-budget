CREATE OR REPLACE FUNCTION GET_TRANSACTIONS_BUDGET_CATEGORY(
    budgetId UUID,
    categoryId UUID
)
RETURNS TABLE (
    "description" varchar,
    amount DOUBLE PRECISION,
    "createdAt" timestamp
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        t.description,
        t.amount,
        t."createdAt"
    FROM
        transaction t
    JOIN
        category c ON t."categoryId" = c.id
    WHERE
        c.id = categoryId
        AND t."budgetId" = budgetId;
END;
$$
LANGUAGE plpgsql;