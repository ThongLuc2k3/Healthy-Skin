import { createHmac, timingSafeEqual } from 'node:crypto'
import config from '../config/env.js'
import { executeChatTool } from './chatTools.js'

const MAX_AGE_MS = 15 * 60 * 1000
const consumedTokens = new Map()

function normalizeVietnamese(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').trim()
}

export function isNaturalConfirmation(value) {
  const text = normalizeVietnamese(value)
  return /^(xac (nhan|nhat)( dat)?|dong y|dung( roi)?|dum (oi|roi)( na)?|chot|ok|oke|okela|uh|u|yes|chuan|lam luon|trien khai)( nhe| nha| na)?[.!? ]*$/.test(text)
}

function signature(value) {
  return createHmac('sha256', config.jwtSecret).update(value).digest('base64url')
}

export function signPendingChatAction(action, userId) {
  if (!action?.name || !userId) return null
  const body = Buffer.from(JSON.stringify({ ...action, userId: String(userId), expiresAt: Date.now() + MAX_AGE_MS })).toString('base64url')
  return `${body}.${signature(body)}`
}

export function verifyPendingChatAction(token, userId) {
  if (!token || !userId) return null
  const [body, supplied] = String(token).split('.')
  if (!body || !supplied) return null
  const expected = signature(body)
  const left = Buffer.from(supplied)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (payload.userId !== String(userId) || Number(payload.expiresAt) < Date.now()) return null
    return payload
  } catch { return null }
}

export async function executeConfirmedPendingAction(token, userId, context = {}) {
  const pending = verifyPendingChatAction(token, userId)
  if (!pending) return null
  const now = Date.now()
  for (const [usedToken, expiresAt] of consumedTokens) if (expiresAt < now) consumedTokens.delete(usedToken)
  if (consumedTokens.has(token)) return null
  consumedTokens.set(token, Number(pending.expiresAt) || now + MAX_AGE_MS)
  const result = await executeChatTool(pending.name, { ...pending.args, confirmed: true }, {
    ...context,
    userId,
    latestUserText: 'xác nhận',
  })
  return {
    reply: result?.success ? `Đã hoàn tất: ${pending.summary}.` : (result?.error || 'Không thể hoàn tất thao tác đang chờ.'),
    toolsUsed: [pending.name],
    responseMode: 'confirmed_action',
    navigateTo: result?.navigateTo,
    wallet: result?.wallet,
  }
}
