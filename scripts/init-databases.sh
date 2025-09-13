#!/bin/bash
set -e

echo "Starting database initialization..."

# Create multiple databases for microservices
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Create databases for each microservice
    CREATE DATABASE synapse_users;
    CREATE DATABASE synapse_graph;  
    CREATE DATABASE synapse_search;
    CREATE DATABASE synapse_ingestion;

    -- Grant permissions to postgres user
    GRANT ALL PRIVILEGES ON DATABASE synapse_users TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE synapse_graph TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE synapse_search TO postgres;
    GRANT ALL PRIVILEGES ON DATABASE synapse_ingestion TO postgres;
EOSQL

echo "Databases created successfully!"

echo "Databases created successfully! TypeORM will handle table creation."