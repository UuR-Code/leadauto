#!/bin/sh
# VPS'teki mevcut PostgreSQL'e yeni 'leadauto' database ve kullanıcısı oluşturur.
# Coolify'daki PostgreSQL container'ına exec ile çalıştır:
#   docker exec -i <postgres_container_name> sh < scripts/create-db.sh

set -e

DB_NAME="leadauto"
DB_USER="leadauto_user"
DB_PASS="$(openssl rand -hex 16)"

psql -U postgres <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;

SELECT 'Database already exists' WHERE EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')
UNION
SELECT 'Created database' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}');

DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
    PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}');
  END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo ""
echo "============================================"
echo "DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@<postgres_host>:5432/${DB_NAME}"
echo "============================================"
echo "Bu bağlantı stringini Coolify env variable'larına ekle."
