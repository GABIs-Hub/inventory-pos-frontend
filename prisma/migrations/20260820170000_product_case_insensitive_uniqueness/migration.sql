-- Enable PostgreSQL's case-insensitive text type.
CREATE EXTENSION IF NOT EXISTS citext;

-- Convert the existing business-scoped Product uniqueness columns.
-- The existing unique indexes remain in place and will now compare values
-- using citext semantics.
ALTER TABLE "Product"
  ALTER COLUMN "name" SET DATA TYPE CITEXT;

ALTER TABLE "Product"
  ALTER COLUMN "sku" SET DATA TYPE CITEXT;
