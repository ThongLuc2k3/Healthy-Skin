import bcrypt from 'bcrypt'
import { query } from '../db/connection.js'

const SALT_ROUNDS = 10

export const DEFAULT_ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@healthyskin.local'
export const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@2026'

// Seed một tài khoản quản trị cố định — đủ dùng để trình diễn trang Admin. Idempotent: chạy lại
// nhiều lần chỉ cập nhật đúng 1 dòng thay vì tạo trùng, giống seedExpertAccounts.
export async function seedAdminAccount() {
  const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, SALT_ROUNDS)
  await query(
    `INSERT INTO admin_accounts (email, password_hash, name)
     VALUES ($1,$2,$3)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [DEFAULT_ADMIN_EMAIL, passwordHash, 'Quản trị viên HEALTHY SKIN'],
  )
}

export async function authenticateAdmin(email, password) {
  const { rows } = await query('SELECT * FROM admin_accounts WHERE email = $1', [email])
  const account = rows[0]
  if (!account) return null

  const valid = await bcrypt.compare(password, account.password_hash)
  if (!valid) return null

  return account
}
