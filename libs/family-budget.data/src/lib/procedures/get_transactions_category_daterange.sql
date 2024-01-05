CREATE OR REPLACE FUNCTION GET_TRANSACTIONS_CATEGORY_DATE_RANGE(
    categoryId UUID,
    startDate DATE,
    endDate DATE
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
        AND t."createdAt" BETWEEN startDate AND endDate;
END;
$$
LANGUAGE plpgsql;