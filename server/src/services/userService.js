import bcrypt from 'bcrypt'
import crypto from 'node:crypto'
import { query } from '../db/connection.js'

const SALT_ROUNDS = 10

export async function findUserByEmail(email) {
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
  return rows[0]
}

export async function findUserById(id) {
  const { rows } = await query('SELECT id, email, created_at, is_locked, locked_reason FROM users WHERE id = $1', [id])
  return rows[0]
}

export async function createUser(email, password, termsAcceptedAt) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const { rows } = await query(
    'INSERT INTO users (email, password_hash, terms_accepted_at) VALUES ($1, $2, $3) RETURNING id, email, created_at',
    [email, passwordHash, termsAcceptedAt],
  )
  return rows[0]
}

export async function createGoogleUser(email, termsAcceptedAt) {
  const passwordHash = await bcrypt.hash(crypto.randomUUID(), SALT_ROUNDS)
  const { rows } = await query(
    `INSERT INTO users (email, password_hash, terms_accepted_at)
     VALUES ($1, $2, $3) ON CONFLICT (email) DO NOTHING
     RETURNING id, email, created_at`,
    [email, passwordHash, termsAcceptedAt],
  )
  return rows[0] || findUserByEmail(email)
}

export async function setUserPassword(id, password) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  await query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, id])
}

export function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash)
}
