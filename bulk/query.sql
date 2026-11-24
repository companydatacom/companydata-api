-- Query a company file with DuckDB, straight from disk or from S3.
-- Runs on sample/companies.csv (547 Dutch software companies). For your own
-- delivery, change the path; the column names are the same as in the API.

-- 1. Point a view at this month's file (CSV or Parquet both work).
CREATE OR REPLACE VIEW companies AS
SELECT * FROM read_csv('sample/companies.csv', header = true,
  -- IDs and codes are text: reading them as numbers drops leading zeros
  types = {'ID': 'VARCHAR', 'Company Registration Number': 'VARCHAR', 'Business Category Code 1': 'VARCHAR'});
-- From S3 instead:
-- SELECT * FROM read_parquet('s3://your-bucket/companydata/2026-11/*.parquet');

-- 2. A selection: software companies in the Netherlands with 50+ staff.
SELECT "Company Name", "Company Registration Number", "City", "Employees Total"
FROM companies
WHERE "Country" = 'Netherlands'
  AND "Business Category Code 1" LIKE '737%'
  AND "Employees Total" >= 50
ORDER BY "Employees Total" DESC
LIMIT 25;

-- 3. Market size per size band (the start of a bottom-up TAM).
SELECT
  CASE
    WHEN "Employees Total" < 10  THEN '1-9'
    WHEN "Employees Total" < 50  THEN '10-49'
    WHEN "Employees Total" < 250 THEN '50-249'
    ELSE '250+'
  END AS size_band,
  COUNT(*) AS companies
FROM companies
GROUP BY 1
ORDER BY 2 DESC;
