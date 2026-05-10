/**
 * db/index.ts — Custom Neon HTTP query engine
 *
 * Uses Node's native https module with forced IPv4 to bypass IPv6/port-5432
 * blocking on restricted networks (college WiFi, hackathon venues, etc.).
 * The Neon HTTP SQL API is hit over port 443.
 */
import https from 'https';
import dns from 'dns';
import dotenv from 'dotenv';

dotenv.config();

// Force IPv4 globally so Node never tries the unreachable IPv6 addresses
dns.setDefaultResultOrder('ipv4first');

const DATABASE_URL = process.env.DATABASE_URL!;
// Strip channel_binding param – not supported by HTTP endpoint
const NEON_CONN_STRING = DATABASE_URL
  .replace('&channel_binding=require', '')
  .replace('channel_binding=require&', '')
  .replace('channel_binding=require', '');

// Parse host from connection string
const parsed = new URL(NEON_CONN_STRING);
const NEON_HOST = parsed.hostname; // e.g. ep-bitter-pond-aqa8ghdp-pooler.c-8.us-east-1.aws.neon.tech

interface NeonHttpResponse {
  rows: Record<string, unknown>[];
  rowCount: number;
  command: string;
  fields: { name: string }[];
}

/**
 * Execute a SQL query via the Neon HTTP API (/sql endpoint) over port 443.
 * Returns a pg-Pool compatible { rows, rowCount } object.
 */
export const query = async (
  text: string,
  params?: unknown[]
): Promise<{ rows: any[]; rowCount: number }> => {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: text, params: params ?? [] });

    const options: https.RequestOptions = {
      hostname: NEON_HOST,
      port: 443,
      path: '/sql',
      method: 'POST',
      family: 4, // ← Force IPv4, skip unreachable IPv6
      headers: {
        'Content-Type': 'application/json',
        'Neon-Connection-String': NEON_CONN_STRING,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        const duration = Date.now() - start;

        try {
          const json: NeonHttpResponse = JSON.parse(raw);

          if (res.statusCode !== 200) {
            const msg = (json as any).message || raw;
            console.error(`[DB] HTTP ${res.statusCode}: ${msg}`);
            return reject(new Error(msg));
          }

          if (process.env.NODE_ENV !== 'production') {
            console.log('Query executed', {
              text: text.substring(0, 80),
              duration,
              rows: json.rowCount ?? json.rows?.length ?? 0,
            });
          }

          resolve({
            rows: json.rows ?? [],
            rowCount: json.rowCount ?? json.rows?.length ?? 0,
          });
        } catch (parseErr) {
          reject(new Error(`Failed to parse DB response: ${raw.substring(0, 200)}`));
        }
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error('DB query timed out after 15s'));
    });

    req.on('error', (err) => {
      console.error(`[DB] Request error (${Date.now() - start}ms):`, err.message);
      reject(err);
    });

    req.write(body);
    req.end();
  });
};

// Stub pool.end() so migration scripts don't break
export const pool = {
  end: () => Promise.resolve(),
  on: (_: string, __: unknown) => {},
  query: query,
};
