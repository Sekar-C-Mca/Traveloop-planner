import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';
import { config } from 'dotenv';

config();
neonConfig.webSocketConstructor = ws;

async function test() {
  const url = (process.env.DATABASE_URL || '').replace('-pooler', '').replace(/\.c-\d+\./, '.');
  console.log('Testing URL:', url.split('@')[1]); // Log only host for safety
  
  const p = new Pool({ connectionString: url });
  try {
    const res = await p.query('SELECT 1 as result');
    console.log('✅ Connected! Result:', res.rows[0]);
  } catch (e: any) {
    console.error('❌ Failed:', e.message || e);
  } finally {
    await p.end();
  }
}

test();
