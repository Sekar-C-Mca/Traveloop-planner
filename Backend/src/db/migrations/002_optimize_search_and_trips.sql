-- Migration: 002_optimize_search_and_trips
-- Optimizes city search with pg_trgm and refactors indexes for better performance.

-- 1. Enable pg_trgm for fuzzy search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Add missing columns to cities (if not already present from seed scripts)
ALTER TABLE cities ADD COLUMN IF NOT EXISTS state VARCHAR(255);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS country_code VARCHAR(10);
ALTER TABLE cities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false;

-- 3. Create GIN indexes for fast ILIKE search on cities
-- We use separate indexes for better performance on individual field searches
CREATE INDEX IF NOT EXISTS idx_cities_name_trgm ON cities USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cities_country_trgm ON cities USING gin (country gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cities_state_trgm ON cities USING gin (state gin_trgm_ops);

-- 4. B-tree indexes for filtering and sorting
CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region);
CREATE INDEX IF NOT EXISTS idx_cities_featured ON cities(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_cities_popularity ON cities(popularity_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_cities_cost ON cities(cost_index ASC NULLS LAST);

-- 5. Optimize Trips and related tables
CREATE INDEX IF NOT EXISTS idx_trips_user_id_deleted ON trips(user_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id_order ON trip_stops(trip_id, order_index);
CREATE INDEX IF NOT EXISTS idx_trip_budgets_trip_id ON trip_budgets(trip_id);
