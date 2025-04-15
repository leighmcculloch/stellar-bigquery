-- Query to analyze payment operations to asset issuers with and without muxed senders
-- Only includes payments where the asset_issuer equals the to field
-- Counts operations with and without from_muxed, grouped by year

WITH payment_operations AS (
  SELECT
    o.id,
    o.closed_at,
    o.type_string,
    details_json.from AS from_account,
    details_json.from_muxed AS from_muxed,
    details_json.to AS to_account,
    details_json.asset_issuer AS asset_issuer
  FROM
    `crypto-stellar.crypto_stellar.history_operations` AS o,
    UNNEST([o.details_json]) AS details_json
  WHERE
    o.closed_at IS NOT NULL
    AND o.type_string = 'PAYMENT'
    AND details_json.asset_issuer IS NOT NULL
    AND details_json.to IS NOT NULL
    AND details_json.asset_issuer = details_json.to
)

-- Count payments to asset issuers with and without muxed senders by year
SELECT
  EXTRACT(YEAR FROM closed_at) AS year,
  COUNTIF(from_muxed IS NOT NULL) AS payments_with_muxed_sender,
  COUNTIF(from_muxed IS NULL) AS payments_without_muxed_sender,
  COUNT(*) AS total_payments_to_issuers
FROM
  payment_operations
GROUP BY
  year
ORDER BY
  year;