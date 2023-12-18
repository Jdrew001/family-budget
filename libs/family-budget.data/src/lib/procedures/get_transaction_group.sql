-- get the group name for a given transaction by date
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