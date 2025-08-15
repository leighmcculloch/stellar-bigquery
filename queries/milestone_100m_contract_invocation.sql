-- Query to find the 100 millionth contract invocation.

WITH txs AS
(
  SELECT
    transaction_hash,
    row_number() over (ORDER BY id) AS row_num
  FROM `crypto-stellar.crypto_stellar.history_transactions`
  WHERE operation_count = 1
  AND soroban_resources_instructions > 0
  AND successful = TRUE
)
SELECT transaction_hash
FROM txs
WHERE row_num = 100000000
