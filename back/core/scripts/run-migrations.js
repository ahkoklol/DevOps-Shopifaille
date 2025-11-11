import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import 'dotenv/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const client = new pg.Client({ connectionString: process.env.PG_URL });

async function run() {
  await client.connect();
  const dir = path.join(__dirname, '../migrations/sql');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    console.log('>> running', f);
    const sql = fs.readFileSync(path.join(dir, f), 'utf8');
    await client.query(sql);
  }
  await client.end();
  console.log('Migrations OK');
}
run().catch(e => { console.error(e); process.exit(1); });
