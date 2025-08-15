-- Query to find the 100 millionth contract invocation.

SELECT transaction_hash
FROM `crypto-stellar.crypto_stellar.history_transactions`
WHERE operation_count = 1
AND soroban_resources_instructions > 0
AND successful = true
LIMIT 1
OFFSET 100000000
