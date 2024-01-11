CREATE OR REPLACE FUNCTION calculate_budget_summary(budId UUID)
RETURNS TABLE ("remainingBudget" NUMERIC, "totalBudget" NUMERIC, "totalSpent" NUMERIC)
AS
$$
DECLARE
    remainingBudget NUMERIC;
    totalBudget NUMERIC;
    totalSpent NUMERIC;
BEGIN
    -- Calculate Remaining Budget
    SELECT
        SUM(subquery."remainingBudget") AS "totalRemainingBudget"
    INTO remainingBudget
    FROM (
        SELECT DISTINCT ON (c.name)
            ROUND(bc.amount::NUMERIC - COALESCE(SUM(t.amount)::NUMERIC, 0), 2) AS "remainingBudget"
        FROM
            budget_category bc
        JOIN
            category c ON bc."categoryId" = c.id AND c.type = 1
        LEFT JOIN
            "transaction" t ON bc."categoryId" = t."categoryId" AND t."budgetId" = budId
                        AND bc."budgetId" = budId
        WHERE
            bc."budgetId" = budId
        GROUP BY
            c.name,
            bc.amount
    ) AS subquery;

    -- Calculate Total Budget
    SELECT ROUND(SUM(bc.amount)::NUMERIC, 2)
    INTO totalBudget
    FROM budget_category bc
    JOIN category c ON bc."categoryId" = c.id AND c.type = 1
    WHERE bc."budgetId" = budId;

    -- Calculate Total Spent
    SELECT
        SUM(subquery."totalTransactions") AS "totalTransactionSpent"
    INTO totalSpent
    FROM (
        SELECT DISTINCT ON (c.name)
            ROUND(COALESCE(SUM(t.amount)::NUMERIC, 0), 2) as "totalTransactions"
        FROM
            budget_category bc
        JOIN
            category c ON bc."categoryId" = c.id AND c.type = 1
        LEFT JOIN
            "transaction" t ON bc."categoryId" = t."categoryId" AND t."budgetId" = budId
                        AND bc."budgetId" = budId
        WHERE
            bc."budgetId" = budId
        GROUP BY
            c.name,
            bc.amount
    ) AS subquery;

    -- Return the result set
    RETURN QUERY SELECT remainingBudget, totalBudget, totalSpent;
END;
$$
LANGUAGE plpgsql;