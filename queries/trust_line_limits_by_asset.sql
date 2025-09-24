SELECT
  asset_code,
  asset_issuer,
  COUNT(asset_code) AS cnt
FROM
  `crypto-stellar.crypto_stellar.trust_lines`
WHERE
  trust_line_limit < 9223372036854775807
GROUP BY
  asset_code,
  asset_issuer
ORDER BY
  cnt DESC
LIMIT 1000;
