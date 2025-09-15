#!/bin/bash

# Database connection parameters
DB_HOST=${DB_HOST:-postgres}
DB_PORT=${DB_PORT:-5432}
DB_USER=${POSTGRES_USER:-ai_finance_user}
DB_PASSWORD=${POSTGRES_PASSWORD:-securepassword123}

echo "Starting database migrations..."

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -c '\q' 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping"
  sleep 2
done

echo "PostgreSQL is ready!"

# Run SQL migrations
for sql_file in /app/postgres/*.sql; do
  if [ -f "$sql_file" ]; then
    echo "Running migration: $(basename $sql_file)"
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -f "$sql_file"
    if [ $? -eq 0 ]; then
      echo "✓ Successfully ran: $(basename $sql_file)"
    else
      echo "✗ Failed to run: $(basename $sql_file)"
      exit 1
    fi
  fi
done

echo "All migrations completed successfully!"