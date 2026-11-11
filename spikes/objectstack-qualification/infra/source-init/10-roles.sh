#!/bin/bash
# TP-02 synthetic external source: schemas + narrow read-only login.
# Runs once, inside the source-db container's entrypoint, as the owner
# superuser login. Credentials arrive via container environment
# (SOURCE_PG_RO_PASSWORD); nothing secret is committed.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<SQL
-- A "spare parts" catalog the maintenance domain reads.
CREATE SCHEMA IF NOT EXISTS inventory;
CREATE TABLE inventory.spare_part (
  part_no     text PRIMARY KEY,
  description text NOT NULL,
  stock_qty   integer NOT NULL CHECK (stock_qty >= 0),
  unit_cost   numeric(12,2) NOT NULL,
  warehouse   text NOT NULL
);
INSERT INTO inventory.spare_part (part_no, description, stock_qty, unit_cost, warehouse) VALUES
  ('PART-008', 'Filter element 10um', 42, 13.50, 'FUJIAN-A'),
  ('PART-011', 'Drive belt B-67', 0, 38.20, 'FUJIAN-A'),
  ('PART-205', 'Seal kit hydraulic', 7, 96.00, 'FUJIAN-B');

-- An EAM-style work-order table carrying a column the narrow role may NOT see.
CREATE SCHEMA IF NOT EXISTS eam;
CREATE TABLE eam.work_order (
  wo_no           text PRIMARY KEY,
  title           text NOT NULL,
  status          text NOT NULL,
  technician_ssn  text NOT NULL
);
INSERT INTO eam.work_order (wo_no, title, status, technician_ssn) VALUES
  ('WO-2026-0001', 'Compressor 40h service', 'open', 'CANARY-SECRET-SSN-7421'),
  ('WO-2026-0002', 'Conveyor belt alignment', 'in_progress', 'CANARY-SECRET-SSN-1938');

-- Narrow read-only login: no create, read-only transactions, explicit grants.
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${SOURCE_PG_RO_USER}') THEN
    EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L',
                   '${SOURCE_PG_RO_USER}', '${SOURCE_PG_RO_PASSWORD}');
  END IF;
END
\$\$;

ALTER ROLE "${SOURCE_PG_RO_USER}" SET default_transaction_read_only = on;
REVOKE ALL ON SCHEMA public FROM "${SOURCE_PG_RO_USER}";
GRANT USAGE ON SCHEMA inventory, eam TO "${SOURCE_PG_RO_USER}";
GRANT SELECT ON inventory.spare_part TO "${SOURCE_PG_RO_USER}";
-- Column-scoped grant: identity columns and state only, never technician_ssn.
GRANT SELECT (wo_no, title, status) ON eam.work_order TO "${SOURCE_PG_RO_USER}";
SQL

echo "source-init: schemas, data and narrow read-only role created"
