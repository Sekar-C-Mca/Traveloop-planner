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

    console.log('\n✅ All migrations complete!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

migrate().catch(e => { console.error(e.message); process.exit(1); });
