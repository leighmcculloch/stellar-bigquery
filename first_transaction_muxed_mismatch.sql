-- Query to find the most recent transaction (desc order) where history_operations.source_account_muxed is null
-- but history_transactions.account_muxed is set
SELECT
  t.id AS transaction_id,
  t.transaction_hash,
  t.ledger_sequence,
  t.account,
  t.account_muxed,
  o.id AS operation_id,
  o.source_account,
  o.source_account_muxed,
  t.closed_at
FROM
  `crypto-stellar.crypto_stellar.history_transactions` AS t
JOIN
  `crypto-stellar.crypto_stellar.history_operations` AS o
  ON t.id = o.transaction_id
WHERE
  t.account_muxed IS NOT NULL
  AND o.source_account_muxed IS NULL
ORDER BY
  t.closed_at DESC
LIMIT 1;