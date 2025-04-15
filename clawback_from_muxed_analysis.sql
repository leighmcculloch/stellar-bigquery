-- Query to analyze clawback operations' from and from_muxed fields
-- Grouped by year, showing counts and latest transaction with muxed

WITH clawback_operations AS (
  SELECT
    o.id,
    o.closed_at,
    o.type_string,
    t.transaction_hash,
    details_json.from AS from_account,
    details_json.from_muxed AS from_muxed
  FROM
    `crypto-stellar.crypto_stellar.history_operations` AS o,
    UNNEST([o.details_json]) AS details_json
  LEFT JOIN
    `crypto-stellar.crypto_stellar.history_transactions` AS t
    ON o.transaction_id = t.id
  WHERE
    o.closed_at IS NOT NULL
    AND o.type_string = 'CLAWBACK'
)

-- Get aggregations and latest transaction hash with from_muxed account per group
SELECT
  EXTRACT(YEAR FROM closed_at) AS year,
  COUNTIF(from_muxed IS NOT NULL) AS clawbacks_with_from_muxed,
  COUNTIF(from_muxed IS NULL) AS clawbacks_without_from_muxed,
  COUNT(*) AS total_clawbacks,
  -- Get the transaction_hash from the most recent clawback with a from_muxed account in each year
  ARRAY_AGG(
    IF(from_muxed IS NOT NULL, transaction_hash, NULL) 
    IGNORE NULLS
    ORDER BY closed_at DESC 
    LIMIT 1
  )[OFFSET(0)] AS latest_muxed_clawback_tx_hash
FROM
  clawback_operations
GROUP BY
  year
ORDER BY
  year;