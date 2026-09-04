export const RESULT = {
  SUITABLE: 'phù hợp',
  CAUTION: 'cần cân nhắc',
}

// Cờ hiệu áp dụng cảnh báo "cần cân nhắc" cho MỌI người dùng, bất kể hồ sơ cá nhân
// (ví dụ: photosensitizing cần lưu ý chống nắng dù da loại nào; high_sugar nên dùng điều độ dù không tiểu đường)
const UNIVERSAL_CAUTION_FLAGS = new Set([
  'photosensitizing',
  'unstable',
  'allergen_potential',
  'high_sugar',
  'high_sodium',
  'high_purine',
  'high_fat',
  'high_gi',
  'caffeine',
  'processed',
  'high_cholesterol',
])

function findAvoidReason(profile, item) {
  if (item.category === 'skincare') {
    if (item.conflicts_with_skin_type?.includes(profile.skinType)) {
      return item.explanation_vi
    }
    return null
  }

  if (item.category === 'food') {
    const allergyHit = item.conflicts_with_allergy?.some((a) => profile.allergies?.includes(a))
    const conditionHit = item.conflicts_with_condition?.some((c) => profile.conditions?.includes(c))
    if (allergyHit || conditionHit) {
      return item.explanation_vi
    }
    return null
  }

  return null
}

function findCautionReason(item) {
  const hit = item.flags?.some((flag) => UNIVERSAL_CAUTION_FLAGS.has(flag))
  return hit ? item.explanation_vi : null
}

export function matchProfile(profile, item) {
  // Xung đột trực tiếp (dị ứng/loại da/bệnh lý) trước đây kết luận "nên tránh", giờ chỉ còn
  // đưa ra 2 mức advice nhẹ nhàng, nên hạ xuống "cần cân nhắc" thay vì phán quyết tuyệt đối.
  const avoidReason = findAvoidReason(profile, item)
  if (avoidReason) {
    return { result: RESULT.CAUTION, reason: `Nếu là bạn thì nên cân nhắc kỹ: ${avoidReason}` }
  }

  const cautionReason = findCautionReason(item)
  if (cautionReason) {
    return { result: RESULT.CAUTION, reason: cautionReason }
  }

  return {
    result: RESULT.SUITABLE,
    reason: 'Không phát hiện xung đột với hồ sơ cá nhân của bạn.',
  }
}

export function getRecommendations(profile, database) {
  const grouped = { [RESULT.SUITABLE]: [], [RESULT.CAUTION]: [] }

  for (const item of database) {
    const { result, reason } = matchProfile(profile, item)
    grouped[result].push({ ...item, reason })
  }

  return grouped
}
