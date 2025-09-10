#!/bin/bash

set -e
set -u

function create_user_and_database() {
	local database=$1
	echo "  Creating user and database '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	    CREATE USER ${database}_user WITH PASSWORD '${database}_pass_2024';
	    CREATE DATABASE $database OWNER ${database}_user;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO ${database}_user;
	    \connect $database
	    GRANT ALL ON SCHEMA public TO ${database}_user;
	    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	    CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
	    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
	EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
	for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
		create_user_and_database $db
	done
	echo "Multiple databases created"
fi