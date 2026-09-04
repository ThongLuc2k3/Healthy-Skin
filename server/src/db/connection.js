import pg from 'pg'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import config from '../config/env.js'

const { Pool } = pg
const __dirname = dirname(fileURLToPath(import.meta.url))

if (!config.databaseUrl) {
  throw new Error(
    'Thiếu DATABASE_URL. Hãy thêm chuỗi kết nối PostgreSQL vào file .env ở thư mục gốc.',
  )
}

const pool = new Pool({
  connectionString: config.databaseUrl,
  max: config.dbPoolMax,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

pool.on('error', (error) => {
  console.error('[db] PostgreSQL pool error:', error)
})

export function query(text, params = []) {
  return pool.query(text, params)
}

export async function transaction(callback) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function initDatabase() {
  const schema = await readFile(join(__dirname, 'schema.sql'), 'utf8')
  await pool.query(schema)
  await pool.query('SELECT 1')
}

export async function closeDatabase() {
  await pool.end()
}

export default pool
