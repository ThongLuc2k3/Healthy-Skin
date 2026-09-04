import bcrypt from 'bcrypt'
import { query } from '../db/connection.js'
import { getExpertById } from './expertService.js'

const SALT_ROUNDS = 10

// Mật khẩu demo cố định cho toàn bộ tài khoản chuyên gia mẫu — chỉ dùng để trình diễn Expert
// Dashboard, KHÔNG phải cơ chế bảo mật thật (xem ghi chú DEMO trong experts.routes.js).
export const DEMO_EXPERT_PASSWORD = 'demo1234'

export function expertDemoEmail(expertId) {
  return `${expertId}@demo-expert.local`
}

export async function seedExpertAccounts(expertIds) {
  const passwordHash = await bcrypt.hash(DEMO_EXPERT_PASSWORD, SALT_ROUNDS)
  for (const expertId of expertIds) {
    await query(
      `INSERT INTO expert_accounts (expert_id, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET expert_id = EXCLUDED.expert_id`,
      [expertId, expertDemoEmail(expertId), passwordHash],
    )
  }
}

export async function authenticateExpert(email, password) {
  const { rows } = await query('SELECT * FROM expert_accounts WHERE email = $1', [email])
  const account = rows[0]
  if (!account) return null

  const valid = await bcrypt.compare(password, account.password_hash)
  if (!valid) return null

  const expert = await getExpertById(account.expert_id)
  return { account, expert }
}

export async function getExpertAccountById(id) {
  const { rows } = await query('SELECT * FROM expert_accounts WHERE id = $1', [id])
  return rows[0]
}
