-- Query to extract and summarize types from the data_decoded field
-- Analyzes the type distribution in contract events data

WITH
-- Extract types from data_decoded field
data_decoded_types AS (
  SELECT
    -- Extract the type from data_decoded
    JSON_VALUE(data_decoded, '$.type') AS data_type,
    data_decoded
  FROM
    `crypto-stellar.crypto_stellar.history_contract_events`
  WHERE
    data_decoded IS NOT NULL
    AND in_successful_contract_call = TRUE
    AND JSON_VALUE(data_decoded, '$.type') IS NOT NULL
    AND type_string = 'ContractEventTypeContract'
),

-- First, collect type counts
type_counts AS (
  SELECT
    data_type,
    COUNT(*) AS count
  FROM
    data_decoded_types
  GROUP BY
    data_type
),

-- Get sample data_decoded for each type
type_samples AS (
  SELECT
    data_type,
    ARRAY_AGG(data_decoded ORDER BY RAND() LIMIT 1)[OFFSET(0)] AS sample_data_decoded
  FROM
    data_decoded_types
  GROUP BY
    data_type
)

-- Join the results together
SELECT
  c.data_type,
  c.count,
  s.sample_data_decoded
FROM
  type_counts c
JOIN
  type_samples s ON c.data_type = s.data_type
ORDER BY
  c.count DESC;
