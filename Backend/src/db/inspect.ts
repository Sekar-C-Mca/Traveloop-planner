import { query, pool } from './index';

async function inspect() {
  const tables = await query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
  );
  console.log('\n📋 Tables:', tables.rows.map((r: any) => r.table_name));

  const cats = await query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'activity_categories' ORDER BY ordinal_position`
  );
  console.log('\n📂 activity_categories columns:', cats.rows);

  const cities = await query(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'cities' ORDER BY ordinal_position`
  );
  console.log('\n🏙️  cities columns:', cities.rows.map((r: any) => r.column_name));

  await pool.end();
}

inspect().catch(e => { console.error(e.message); process.exit(1); });
