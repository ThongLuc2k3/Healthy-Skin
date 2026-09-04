import { query, transaction } from '../db/connection.js'

function toVoucherShape(row) {
  return {
    id: row.id,
    titleVi: row.title_vi,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    venueId: row.venue_id,
    pointsCost: row.points_cost,
    source: row.source,
  }
}

function toUserVoucherShape(row) {
  return {
    id: row.id,
    voucherId: row.voucher_id,
    titleVi: row.title_vi,
    discountType: row.discount_type,
    discountValue: row.discount_value,
    obtainedVia: row.obtained_via,
    usedAt: row.used_at,
    obtainedAt: row.obtained_at,
    pointsSpent: row.points_spent,
    pointsBalanceAfter: row.points_balance_after,
  }
}

export async function listVoucherCatalog() {
  const { rows } = await query('SELECT * FROM vouchers ORDER BY points_cost ASC')
  return rows.map(toVoucherShape)
}

export async function listUserVouchers(userId, { onlyUnused = false } = {}) {
  const { rows } = await query(
    `SELECT uv.*, v.title_vi, v.discount_type, v.discount_value FROM user_vouchers uv
     JOIN vouchers v ON v.id = uv.voucher_id
     WHERE uv.user_id = $1 ${onlyUnused ? 'AND uv.used_at IS NULL' : ''}
     ORDER BY uv.obtained_at DESC`,
    [userId],
  )
  return rows.map(toUserVoucherShape)
}

// Đổi điểm tích luỹ (từ nạp ví, xem chatWalletService) lấy voucher — trừ điểm trong cùng transaction
// để tránh đổi vượt quá số điểm đang có nếu người dùng bấm liên tục.
export async function redeemVoucherWithPoints(userId, voucherId) {
  const { rows: voucherRows } = await query('SELECT * FROM vouchers WHERE id = $1', [voucherId])
  const voucher = voucherRows[0]
  if (!voucher || voucher.points_cost <= 0) {
    throw new Error('Voucher không hợp lệ để đổi bằng điểm.')
  }

  return transaction(async (client) => {
    const { rows: walletRows } = await client.query(
      'SELECT loyalty_points FROM user_wallets WHERE user_id = $1 FOR UPDATE', [userId],
    )
    const points = walletRows[0]?.loyalty_points || 0
    if (points < voucher.points_cost) {
      throw new Error('Bạn không đủ điểm tích luỹ để đổi voucher này.')
    }

    const balanceAfter = points - voucher.points_cost
    await client.query(
      'UPDATE user_wallets SET loyalty_points = loyalty_points - $2, updated_at = NOW() WHERE user_id = $1',
      [userId, voucher.points_cost],
    )
    const { rows } = await client.query(
      `INSERT INTO user_vouchers (user_id, voucher_id, obtained_via, points_spent, points_balance_after)
       VALUES ($1,$2,'points_redeem',$3,$4) RETURNING *`,
      [userId, voucherId, voucher.points_cost, balanceAfter],
    )
    return {
      id: rows[0].id, voucherId, obtainedVia: 'points_redeem',
      pointsSpent: voucher.points_cost, pointsBalanceAfter: balanceAfter,
    }
  })
}

// Cấp voucher trực tiếp (thưởng minigame Skin Lab hoặc tặng kèm khi mua Gói Trợ Lý) — không trừ điểm.
export async function awardVoucher(userId, voucherId, obtainedVia) {
  const { rows: voucherRows } = await query('SELECT id, title_vi FROM vouchers WHERE id = $1', [voucherId])
  if (!voucherRows[0]) {
    throw new Error('Voucher không hợp lệ.')
  }
  const { rows } = await query(
    `INSERT INTO user_vouchers (user_id, voucher_id, obtained_via) VALUES ($1,$2,$3) RETURNING *`,
    [userId, voucherId, obtainedVia],
  )
  return { id: rows[0].id, voucherId, obtainedVia, voucherTitle: voucherRows[0].title_vi }
}
