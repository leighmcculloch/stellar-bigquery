-- Query to extract and summarize types from the key_decoded field
-- Analyzes the type distribution in contract events data

WITH
-- Extract types from key_decoded field
key_decoded_types AS (
  SELECT
    -- Extract the type from key_decoded, or use value if type is empty
    CASE
      WHEN JSON_VALUE(key_decoded, '$.type') = ''
      THEN REGEXP_EXTRACT(JSON_VALUE(key_decoded, '$.value'), r'\(([^)]+)\)')
      ELSE JSON_VALUE(key_decoded, '$.type')
    END AS key_type,
    key_decoded
  FROM
    `crypto-stellar.crypto_stellar.contract_data`
  WHERE
    key_decoded IS NOT NULL
),

-- First, collect type counts
type_counts AS (
  SELECT
    key_type,
    COUNT(*) AS count
  FROM
    key_decoded_types
  GROUP BY
    key_type
),

-- Get sample key_decoded for each type
type_samples AS (
  SELECT
    key_type,
    ARRAY_AGG(key_decoded ORDER BY RAND() LIMIT 1)[OFFSET(0)] AS sample_key_decoded
  FROM
    key_decoded_types
  GROUP BY
    key_type
)

-- Join the results together
SELECT
  c.key_type,
  c.count,
  s.sample_key_decoded
FROM
  type_counts c
JOIN
  type_samples s ON c.key_type = s.key_type
ORDER BY
  c.count DESC;