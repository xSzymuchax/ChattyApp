#!/bin/sh
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<EOSQL
CREATE USER auth_service WITH PASSWORD '${AUTH_DB_PASSWORD}';
CREATE DATABASE auth_db OWNER auth_service;

CREATE USER user_service WITH PASSWORD '${USER_DB_PASSWORD}';
CREATE DATABASE user_db OWNER user_service;

CREATE USER chat_service WITH PASSWORD '${CHAT_DB_PASSWORD}';
CREATE DATABASE chat_db OWNER chat_service;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname auth_db -c "GRANT USAGE, CREATE ON SCHEMA public TO auth_service;"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname user_db -c "GRANT USAGE, CREATE ON SCHEMA public TO user_service;"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname chat_db -c "GRANT USAGE, CREATE ON SCHEMA public TO chat_service;"
