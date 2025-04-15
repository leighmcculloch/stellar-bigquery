-- Query to summarize records with and without source_account_muxed grouped by year
SELECT
  EXTRACT(YEAR FROM closed_at) AS year,
  COUNTIF(source_account_muxed IS NOT NULL) AS records_with_muxed,
  COUNTIF(source_account_muxed IS NULL) AS records_without_muxed,
  COUNT(*) AS total_records
FROM
  `crypto-stellar.crypto_stellar.history_operations`
WHERE
  closed_at IS NOT NULL
GROUP BY
  year
ORDER BY
  year