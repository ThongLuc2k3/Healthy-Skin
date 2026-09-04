import { query } from '../db/connection.js'

function parsed(value) {
  return typeof value === 'string' ? JSON.parse(value) : value
}

function toProductShape(row) {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    matchedItemId: row.matched_item_id,
    priceVnd: row.price_vnd,
    affiliateUrl: row.affiliate_url,
    sponsorName: row.sponsor_name,
    placements: parsed(row.placements) ?? [],
  }
}

function byPlacement(products, placement) {
  if (!placement) return products
  return products.filter((p) => p.placements.includes(placement))
}

// `placement` lọc theo vị trí quản trị viên đã bật cho sản phẩm ở trang Admin (xem
// adminService.updateSponsoredPlacement) — 'trang_chu' | 'ket_qua_quet' | 'tu_van_chuyen_gia'.
// Không truyền placement thì trả toàn bộ sản phẩm đang active (dùng nội bộ/route cũ).
export async function listSponsoredProducts(placement) {
  const { rows } = await query('SELECT * FROM sponsored_products WHERE active = TRUE ORDER BY id')
  return byPlacement(rows.map(toProductShape), placement)
}

// Ưu tiên trả sản phẩm liên kết đã đối chiếu được với đúng thành phần/tên đang xem (matchedItemId),
// nếu không có mục nào khớp thì trả một vài sản phẩm tiếp thị liên kết đang hoạt động để vẫn có gợi ý.
export async function findSponsoredAlternatives(matchedItemId, limit = 3, placement = 'ket_qua_quet') {
  if (matchedItemId) {
    const { rows } = await query(
      'SELECT * FROM sponsored_products WHERE active = TRUE AND matched_item_id = $1 ORDER BY id',
      [matchedItemId],
    )
    const matched = byPlacement(rows.map(toProductShape), placement).slice(0, limit)
    if (matched.length > 0) return matched
  }

  const { rows } = await query('SELECT * FROM sponsored_products WHERE active = TRUE ORDER BY id')
  return byPlacement(rows.map(toProductShape), placement).slice(0, limit)
}

export async function listHomepageAds() {
  const { rows } = await query(
    'SELECT * FROM homepage_ads WHERE active = TRUE ORDER BY priority ASC, id ASC',
  )
  return rows.map((row) => ({
    id: row.id,
    sponsorName: row.sponsor_name,
    imageUrl: row.image_url,
    linkUrl: row.link_url,
  }))
}
