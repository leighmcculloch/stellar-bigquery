-- Query to summarize operations with and without source_account_muxed
-- Grouped by year and operation type_string
-- If an operation's source_account is NULL, it falls back to the transaction's account and account_muxed

WITH operations_with_source AS (
  SELECT
    o.id,
    o.closed_at,
    o.type_string,
    -- If operation source_account is NULL, use transaction account instead
    COALESCE(o.source_account, t.account) AS effective_source_account,
    -- If operation source_account_muxed is NULL but source_account is NULL too, 
    -- then use transaction account_muxed
    CASE
      WHEN o.source_account IS NULL THEN t.account_muxed
      ELSE o.source_account_muxed
    END AS effective_source_account_muxed
  FROM
    `crypto-stellar.crypto_stellar.history_operations` AS o
  LEFT JOIN
    `crypto-stellar.crypto_stellar.history_transactions` AS t
    ON o.transaction_id = t.id
  WHERE
    o.closed_at IS NOT NULL
)

SELECT
  EXTRACT(YEAR FROM closed_at) AS year,
  type_string,
  COUNTIF(effective_source_account_muxed IS NOT NULL) AS operations_with_muxed,
  COUNTIF(effective_source_account_muxed IS NULL) AS operations_without_muxed,
  COUNT(*) AS total_operations,
  ROUND(COUNTIF(effective_source_account_muxed IS NOT NULL) * 100.0 / COUNT(*), 2) AS percent_with_muxed
FROM
  operations_with_source
GROUP BY
  year,
  type_string
ORDER BY
  year,
  type_string;