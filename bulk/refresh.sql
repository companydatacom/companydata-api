-- Monthly refresh: load the new file into a table you own, idempotently.
-- Run it twice and nothing changes; that is the point.

CREATE TABLE IF NOT EXISTS company (
  id                  VARCHAR PRIMARY KEY,   -- the provider's record ID
  registration_number VARCHAR,
  country             VARCHAR,
  name                VARCHAR,
  city                VARCHAR,
  employees           BIGINT,
  loaded_at           DATE                   -- keep the date: you need it for retention
);

INSERT OR REPLACE INTO company
SELECT
  CAST("ID" AS VARCHAR),
  CAST("Company Registration Number" AS VARCHAR),
  "Country",
  "Company Name",
  "City",
  "Employees Total",
  CURRENT_DATE
FROM read_csv('sample/companies.csv', header = true,
  -- IDs and codes are text: reading them as numbers drops leading zeros
  types = {'ID': 'VARCHAR', 'Company Registration Number': 'VARCHAR', 'Business Category Code 1': 'VARCHAR'});

-- Join your own customers on registration number + country, never on name.
-- SELECT c.*, k.name, k.employees
-- FROM my_customers c
-- JOIN company k
--   ON k.registration_number = c.registration_number AND k.country = c.country;
