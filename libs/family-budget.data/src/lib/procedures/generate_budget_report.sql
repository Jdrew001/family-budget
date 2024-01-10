/**
 * Function: GENERATE_BUDGET_REPORT
 * Description: This function generates a budget report for a given budget ID.
 * Parameters:
 *   - budId: The UUID of the budget for which the report is generated.
 * Returns: 
 *   - A table with the following columns:
*     - "Category ID": The UUID of the category.
*     - "Category Name": The name of the category.
*     - "Amount Spent": The total amount spent in the category.
*     - "Amount Budgeted": The budgeted amount for the category.
*     - "Difference": The difference between the budgeted amount and the amount spent.
 */
create function GENERATE_BUDGET_REPORT(budid uuid)
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
