#!/bin/sh
# Coolify deploy hook olarak ekle — her deploy'da DB migration çalışır.
set -e
echo "Running database migrations..."
npx prisma migrate deploy
echo "Migrations complete."
