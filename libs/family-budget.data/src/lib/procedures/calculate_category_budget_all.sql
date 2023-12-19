CREATE OR REPLACE FUNCTION CALCULATE_CATEGORY_BUDGET_ALL(
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
        t."budgetId" = budId
    GROUP BY
        t."categoryId", t."budgetId";
END;
$$
LANGUAGE plpgsql;

select * from CALCULATE_CATEGORY_BUDGET_ALL('ac619194-173c-4605-b050-e85b1068b093');