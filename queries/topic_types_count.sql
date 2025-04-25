-- Query to extract topic types from topics_decoded field and count their occurrences
-- Groups by the combined type signature (e.g., "Sym,Address,Address")
-- Limited to ContractEventTypeContract events

WITH
-- Extract topics_decoded and create a string of all types in each event
events_with_type_signature AS (
  SELECT
    contract_id,
    topics_decoded,
    -- Extract each type from the topics_decoded array and join them with commas
    (
      SELECT STRING_AGG(
        JSON_VALUE(topic, '$.type'),
        ','
        ORDER BY OFFSET
      )
      FROM UNNEST(JSON_EXTRACT_ARRAY(topics_decoded, '$.topics_decoded')) AS topic WITH OFFSET
      WHERE JSON_VALUE(topic, '$.type') IS NOT NULL
    ) AS type_signature
  FROM
    `crypto-stellar.crypto_stellar.history_contract_events`
  WHERE
    topics_decoded IS NOT NULL
    AND in_successful_contract_call = TRUE
    AND type_string = 'ContractEventTypeContract'
)

-- Group by type signature, get counts and a sample topics_decoded
SELECT
  type_signature,
  COUNT(*) AS count,
  -- Get a sample of topics_decoded for each type signature
  ARRAY_AGG(topics_decoded ORDER BY RAND() LIMIT 1)[OFFSET(0)] AS sample_topics_decoded
FROM
  events_with_type_signature
WHERE
  type_signature IS NOT NULL
GROUP BY
  type_signature
ORDER BY
  count DESC;