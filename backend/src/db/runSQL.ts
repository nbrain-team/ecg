import pool from '../config/database';
import fs from 'fs';
import path from 'path';

async function runSQL() {
  const sqlFile = process.argv[2];
  if (!sqlFile) {
    console.error('Please provide a SQL file to run');
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    const sql = fs.readFileSync(path.resolve(sqlFile), 'utf8');
    await client.query(sql);
    console.log('SQL executed successfully');
  } catch (err) {
    console.error('Error executing SQL:', err);
    process.exit(1);
  } finally {
    client.release();
    process.exit(0);
  }
}

runSQL();
