import fs from 'fs';
import path from 'path';
import pool from '../config/database';

export async function applySchema(): Promise<void> {
  const schemaPaths = [
    path.join(__dirname, 'schema.sql'),
    path.join(__dirname, 'schema_extra.sql')
  ].filter(fs.existsSync);

  for (const sp of schemaPaths) {
    const sql = fs.readFileSync(sp, 'utf8');
    if (sql && sql.trim().length > 0) {
      await pool.query(sql);
    }
  }
  console.log('Database schema applied successfully');
}



