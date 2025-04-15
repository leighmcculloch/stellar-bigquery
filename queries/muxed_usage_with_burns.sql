-- Query to analyze payment operations to asset issuers with and without muxed senders
-- Only includes payments where the asset_issuer equals the to field
-- Counts operations with and without from_muxed, grouped by year

WITH burn_operations AS (
  SELECT
    o.id,
    o.closed_at,
    o.type_string,
    t.transaction_hash,
    JSON_VALUE(details_json.from) AS from_account,
    JSON_VALUE(details_json.from_muxed) AS from_muxed,
    JSON_VALUE(details_json.to) AS to_account,
    JSON_VALUE(details_json.asset_issuer) AS asset_issuer,
  FROM
    `crypto-stellar.crypto_stellar.history_operations` AS o,
    UNNEST([o.details_json]) AS details_json
  LEFT JOIN
    `crypto-stellar.crypto_stellar.history_transactions` AS t
    ON o.transaction_id = t.id
  WHERE
    o.closed_at IS NOT NULL
    AND o.type_string = 'payment'
    AND JSON_VALUE(details_json.asset_issuer) IS NOT NULL
    AND JSON_VALUE(details_json.to) IS NOT NULL
    AND JSON_VALUE(details_json.asset_issuer) = JSON_VALUE(details_json.to)
)

-- Count payments to asset issuers with and without muxed senders by year
SELECT
  EXTRACT(YEAR FROM closed_at) AS year,
  COUNTIF(from_muxed IS NOT NULL) AS burns_with_muxed_sender,
  COUNTIF(from_muxed IS NULL) AS burns_without_muxed_sender,
  COUNT(*) AS total_burns,
  -- Get the transaction_hash from the most recent burn
  ARRAY_AGG(
    IF(from_muxed IS NOT NULL, transaction_hash, NULL) 
    IGNORE NULLS
    ORDER BY closed_at DESC 
    LIMIT 1
  )[OFFSET(0)] AS sample_muxed_burn_tx_hash
FROM
  burn_operations
GROUP BY
  year
ORDER BY
  year;
