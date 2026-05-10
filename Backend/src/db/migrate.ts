import { query, pool } from './index';

async function migrate() {
  console.log('🔧 Running migrations...');

  try {
    // Add icon column to activity_categories if missing
    await query(`
      ALTER TABLE activity_categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50)
    `);
    console.log('✅ activity_categories.icon column ensured');

    // Add created_at to cities if missing
    await query(`
      ALTER TABLE cities ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()
    `);
    console.log('✅ cities.created_at column ensured');

    // Ensure shared_trip_views has viewer_ip
    await query(`
      ALTER TABLE shared_trip_views ADD COLUMN IF NOT EXISTS viewer_ip VARCHAR(64)
    `);
    console.log('✅ shared_trip_views.viewer_ip column ensured');

    // Enable pg_trgm and add indexes for city search
    console.log('⚡ Optimizing cities table...');
    await query('CREATE EXTENSION IF NOT EXISTS pg_trgm');
    await query('ALTER TABLE cities ADD COLUMN IF NOT EXISTS state VARCHAR(255)');
    await query('ALTER TABLE cities ADD COLUMN IF NOT EXISTS country_code VARCHAR(10)');
    await query('ALTER TABLE cities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false');
    
    await query('CREATE INDEX IF NOT EXISTS idx_cities_name_trgm ON cities USING gin (name gin_trgm_ops)');
    await query('CREATE INDEX IF NOT EXISTS idx_cities_country_trgm ON cities USING gin (country gin_trgm_ops)');
    await query('CREATE INDEX IF NOT EXISTS idx_cities_state_trgm ON cities USING gin (state gin_trgm_ops)');
    await query('CREATE INDEX IF NOT EXISTS idx_cities_region ON cities(region)');
    await query('CREATE INDEX IF NOT EXISTS idx_cities_featured ON cities(is_featured) WHERE is_featured = true');
    await query('CREATE INDEX IF NOT EXISTS idx_cities_popularity ON cities(popularity_score DESC NULLS LAST)');
    
    // Optimize Trips
    console.log('⚡ Optimizing trips table...');
    await query('CREATE INDEX IF NOT EXISTS idx_trips_user_id_deleted ON trips(user_id) WHERE is_deleted = false');
    await query('CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id_order ON trip_stops(trip_id, order_index)');

    console.log('\n✅ All migrations complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch(e => { console.error(e.message); process.exit(1); });
