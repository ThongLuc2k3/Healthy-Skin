import { query } from '../db/connection.js'

export async function recordScan(
  userId,
  { matchedItemId, matchedItemCategory, ocrRawText, productName, result, reason },
) {
  await query(
    `INSERT INTO scan_history
      (user_id, matched_item_id, matched_item_category, ocr_raw_text, product_name, result, reason)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, matchedItemId ?? null, matchedItemCategory ?? null, ocrRawText ?? null,
      productName ?? null, result ?? null, reason ?? null],
  )
}

export async function listScanHistory(userId) {
  const { rows } = await query(
    `SELECT sh.*, COALESCE(si.name_vi, fi.name_vi) AS matched_item_name
     FROM scan_history sh
     LEFT JOIN skincare_ingredients si
       ON sh.matched_item_id = si.id AND sh.matched_item_category = 'skincare'
     LEFT JOIN food_items fi
       ON sh.matched_item_id = fi.id AND sh.matched_item_category = 'food'
     WHERE sh.user_id = $1 ORDER BY sh.created_at DESC`,
    [userId],
  )
  return rows.map((row) => ({
    id: row.id, matchedItemId: row.matched_item_id, matchedItemName: row.matched_item_name,
    matchedItemCategory: row.matched_item_category, productName: row.product_name,
    ocrRawText: row.ocr_raw_text, result: row.result, reason: row.reason, createdAt: row.created_at,
  }))
}
