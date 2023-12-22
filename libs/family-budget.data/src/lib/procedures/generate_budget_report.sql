/**
 * Function: GENERATE_BUDGET_REPORT
 * Description: This function generates a budget report for a given budget ID.
 * Parameters:
 *   - budId: The UUID of the budget for which the report is generated.
 * Returns: 
 *   - A table with the following columns:
 *     - "Category Name": The name of the category.
 *     - "Amount Spent": The total amount spent in the category.
 *     - "Amount Budgeted": The budgeted amount for the category.
 *     - "Difference": The difference between the budgeted amount and the amount spent.
 */
CREATE OR REPLACE FUNCTION GENERATE_BUDGET_REPORT(budId UUID)
RETURNS TABLE (
    "Category Name" VARCHAR,
    "Amount Spent" NUMERIC,
    "Amount Budgeted" NUMERIC,
    "Difference" NUMERIC
) AS
$$
BEGIN
    RETURN QUERY
    SELECT
        c.name as "Category Name",
        ROUND(COALESCE(SUM(t.amount)::NUMERIC, 0), 2) AS "Amount Spent",
        ROUND(bc.amount::NUMERIC, 2) as "Amount Budgeted",
        ROUND((bc.amount - COALESCE(SUM(t.amount)::NUMERIC, 0))::NUMERIC, 2) AS "Difference"
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
        bc."budgetId", c.name, bc.amount
    ORDER BY bc.amount DESC;

END;
$$
LANGUAGE plpgsql;
