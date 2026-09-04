function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
}

const NUMBERED_DISTRICT_COORDS = {
  1: [10.7769, 106.7009],
  2: [10.7873, 106.7498],
  3: [10.7843, 106.6871],
  4: [10.7579, 106.7040],
  5: [10.7550, 106.6672],
  6: [10.7459, 106.6349],
  7: [10.7340, 106.7217],
  8: [10.7235, 106.6288],
  9: [10.8412, 106.8095],
  10: [10.7726, 106.6674],
  11: [10.7631, 106.6500],
  12: [10.8671, 106.6413],
}

const NAMED_AREA_COORDS = [
  { keywords: ['phu nhuan'], coords: [10.7991, 106.6803] },
  { keywords: ['binh thanh'], coords: [10.8106, 106.7091] },
  { keywords: ['tan binh'], coords: [10.8014, 106.6528] },
  { keywords: ['go vap'], coords: [10.8386, 106.6652] },
  { keywords: ['thu duc'], coords: [10.8494, 106.7537] },
  { keywords: ['binh tan'], coords: [10.7652, 106.6034] },
  { keywords: ['tan phu'], coords: [10.7907, 106.6285] },
  { keywords: ['hoc mon'], coords: [10.8862, 106.5931] },
  { keywords: ['cu chi'], coords: [10.9738, 106.4930] },
  { keywords: ['nha be'], coords: [10.6958, 106.7409] },
  { keywords: ['binh chanh'], coords: [10.6917, 106.5936] },
  { keywords: ['can gio'], coords: [10.4130, 106.9560] },
]

// Toạ độ trung tâm quận/huyện TP.HCM (demo, KHÔNG phải geocoding thật) — dùng làm phương án dự
// phòng tính khoảng cách cho "Dịch Vụ Quanh Bạn" khi trình duyệt không cấp quyền vị trí, dựa vào
// địa chỉ tự khai của người dùng (xem accountService/users.address_vi). Khớp quận đánh số (rõ ràng
// nhất qua regex) trước, rồi mới tới tên quận/huyện riêng.
export function resolveApproxCoords(addressText) {
  if (!addressText) return null
  const normalized = normalize(addressText)

  const numberedMatch = normalized.match(/(?:quan|q\.?)\s*(\d{1,2})\b/)
  if (numberedMatch) {
    const coords = NUMBERED_DISTRICT_COORDS[Number(numberedMatch[1])]
    if (coords) return { lat: coords[0], lng: coords[1] }
  }

  for (const area of NAMED_AREA_COORDS) {
    if (area.keywords.some((k) => normalized.includes(k))) {
      return { lat: area.coords[0], lng: area.coords[1] }
    }
  }
  return null
}
