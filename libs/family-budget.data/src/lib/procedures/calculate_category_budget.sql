-- Get the total amount of a category in a budget that has been spent
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