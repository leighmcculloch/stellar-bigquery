-- Query to extract and summarize types from the val_decoded field
-- Analyzes the type distribution in contract events data

WITH
-- Extract types from val_decoded field
val_decoded_types AS (
  SELECT
    -- Extract the type from val_decoded, or use value if type is empty
    CASE
      WHEN JSON_VALUE(val_decoded, '$.type') = ''
      THEN REGEXP_EXTRACT(JSON_VALUE(val_decoded, '$.value'), r'\(([^)]+)\)')
      ELSE JSON_VALUE(val_decoded, '$.type')
    END AS val_type,
    val_decoded
  FROM
    `crypto-stellar.crypto_stellar.contract_data`
  WHERE
    val_decoded IS NOT NULL
),

-- First, collect type counts
type_counts AS (
  SELECT
    val_type,
    COUNT(*) AS count
  FROM
    val_decoded_types
  GROUP BY
    val_type
),

-- Get sample val_decoded for each type
type_samples AS (
  SELECT
    val_type,
    ARRAY_AGG(val_decoded ORDER BY RAND() LIMIT 1)[OFFSET(0)] AS sample_val_decoded
  FROM
    val_decoded_types
  GROUP BY
    val_type
)

-- Join the results together
SELECT
  c.val_type,
  c.count,
  s.sample_val_decoded
FROM
  type_counts c
JOIN
  type_samples s ON c.val_type = s.val_type
ORDER BY
  c.count DESC;
