// Bộ ca kiểm thử tham chiếu cho khung QA — đúng tinh thần mục 5 "Khung QA và tính lặp lại cho AI"
// trong Healthy_Skin_Ke_Hoach_Phat_Trien_Chi_Tiet.pdf: mỗi ca có đầu vào, hồ sơ, mức rủi ro, đáp án
// tham chiếu và lý do, để chạy lặp lại được thay vì đánh giá bằng cảm giác dùng thử.
//
// RULE_TEST_CASES: chạy trực tiếp qua matchEngine.js, xác định 100%, phải luôn đúng — dùng để
// gate `npm run test`. GEMINI_TEST_CASES: cần ảnh fixture thật (xem fixtures/README.md) + API key,
// dùng để đo tính nhất quán, không auto-fail vì Gemini không xác định.

export const RULE_TEST_CASES = [
  {
    id: 'rule_binh_thuong_phu_hop_skincare',
    category: 'skincare',
    itemId: 'hyaluronic_acid',
    profile: { skinType: 'da_hon_hop', allergies: [], conditions: [], goals: [] },
    expectedResult: 'phù hợp',
    riskLevel: 'thấp',
    note: 'Thành phần cấp ẩm lành tính, không xung đột loại da, không có cờ cảnh báo chung.',
  },
  {
    id: 'rule_binh_thuong_can_can_nhac_skin_type',
    category: 'skincare',
    itemId: 'coconut_oil',
    profile: { skinType: 'da_dau', allergies: [], conditions: [], goals: [] },
    expectedResult: 'cần cân nhắc',
    expectedReasonPrefix: 'Nếu là bạn thì nên cân nhắc kỹ:',
    riskLevel: 'trung bình',
    note: 'Xung đột trực tiếp loại da (comedogenic cao trên da dầu) — phải đi qua nhánh avoidReason.',
  },
  {
    id: 'rule_canh_bao_chung_khong_lien_quan_ho_so',
    category: 'skincare',
    itemId: 'retinol',
    profile: { skinType: 'da_hon_hop', allergies: [], conditions: [], goals: [] },
    expectedResult: 'cần cân nhắc',
    riskLevel: 'trung bình',
    note: 'Da hỗn hợp không nằm trong conflicts_with_skin_type của retinol, nhưng cờ photosensitizing '
      + 'là cảnh báo chung (UNIVERSAL_CAUTION_FLAGS) áp dụng cho mọi loại da.',
  },
  {
    id: 'rule_uu_tien_avoid_hon_caution_chung',
    category: 'skincare',
    itemId: 'fragrance_parfum',
    profile: { skinType: 'da_nhay_cam', allergies: [], conditions: [], goals: [] },
    expectedResult: 'cần cân nhắc',
    expectedReasonPrefix: 'Nếu là bạn thì nên cân nhắc kỹ:',
    riskLevel: 'trung bình',
    note: 'fragrance_parfum vừa xung đột da_nhay_cam vừa có cờ allergen_potential (universal) — '
      + 'nhánh avoidReason phải được ưu tiên trước, canh đúng thứ tự if trong matchEngine.js.',
  },
  {
    id: 'rule_food_di_ung',
    category: 'food',
    itemId: 'tom',
    profile: { skinType: 'da_hon_hop', allergies: ['hai_san'], conditions: [], goals: [] },
    expectedResult: 'cần cân nhắc',
    expectedReasonPrefix: 'Nếu là bạn thì nên cân nhắc kỹ:',
    riskLevel: 'cao',
    note: 'Dị ứng hải sản khớp trực tiếp — rủi ro cao nếu hệ thống lỡ trả "phù hợp".',
  },
  {
    id: 'rule_food_benh_ly_nen',
    category: 'food',
    itemId: 'thit_bo',
    profile: { skinType: 'da_hon_hop', allergies: [], conditions: ['gut'], goals: [] },
    expectedResult: 'cần cân nhắc',
    riskLevel: 'cao',
    note: 'Purin cao xung đột trực tiếp với bệnh gout đã khai báo.',
  },
  {
    id: 'rule_food_canh_bao_chung',
    category: 'food',
    itemId: 'ca_phe',
    profile: { skinType: 'da_hon_hop', allergies: [], conditions: [], goals: [] },
    expectedResult: 'cần cân nhắc',
    riskLevel: 'thấp',
    note: 'Không dị ứng/bệnh nền liên quan, nhưng caffeine là cờ cảnh báo chung.',
  },
  {
    id: 'rule_food_phu_hop',
    category: 'food',
    itemId: 'rau_cai_xanh',
    profile: { skinType: 'da_hon_hop', allergies: [], conditions: [], goals: [] },
    expectedResult: 'phù hợp',
    riskLevel: 'thấp',
    note: 'Không xung đột, không cờ cảnh báo chung.',
  },
  {
    id: 'rule_thieu_du_lieu_ho_so_rong',
    category: 'skincare',
    itemId: 'niacinamide',
    profile: { skinType: '', allergies: [], conditions: [], goals: [] },
    expectedResult: 'phù hợp',
    riskLevel: 'thấp',
    note: 'Hồ sơ trống (người dùng chưa khai báo) không được làm hệ thống lỗi hay tự suy đoán '
      + 'xung đột — phải xử lý êm như không có xung đột nào khớp.',
  },
  {
    id: 'rule_mau_thuan_nhieu_dieu_kien_chong_cheo',
    category: 'food',
    itemId: 'sua_tuoi',
    profile: {
      skinType: 'da_nhay_cam',
      allergies: ['dau_phong', 'sua'],
      conditions: ['gut', 'khong_dung_nap_lactose'],
      goals: [],
    },
    expectedResult: 'cần cân nhắc',
    expectedReasonPrefix: 'Nếu là bạn thì nên cân nhắc kỹ:',
    riskLevel: 'cao',
    note: 'Hồ sơ có nhiều dị ứng/bệnh nền chồng chéo — vẫn phải bắt đúng dị ứng sữa khớp trực tiếp.',
  },
]

// Cần ảnh thật trong fixtures/ (xem fixtures/README.md) mới chạy được — runQa.js tự bỏ qua có
// cảnh báo nếu thiếu ảnh hoặc thiếu GEMINI_API_KEY, không giả vờ đã kiểm thử.
export const GEMINI_TEST_CASES = [
  {
    id: 'gemini_nhan_thanh_phan_ro_rang',
    fixtureImage: 'niacinamide_serum_label.jpg',
    mimeType: 'image/jpeg',
    profile: { skinType: 'da_dau', allergies: [], conditions: [], goals: ['giam_mun'] },
    expectedResult: 'phù hợp',
    riskLevel: 'thấp',
    note: 'Ảnh nhãn thành phần rõ nét, hoạt chất lành tính, không xung đột hồ sơ.',
  },
  {
    id: 'gemini_san_pham_xung_dot_ho_so',
    fixtureImage: 'benzoyl_peroxide_cream.jpg',
    mimeType: 'image/jpeg',
    profile: { skinType: 'da_kho', allergies: [], conditions: [], goals: [] },
    expectedResult: 'cần cân nhắc',
    riskLevel: 'trung bình',
    note: 'Sản phẩm có hoạt chất gây khô mạnh trên da khô đã khai báo.',
  },
  {
    id: 'gemini_anh_mo_khong_nhan_dien_duoc',
    fixtureImage: 'anh_mo_khong_ro.jpg',
    mimeType: 'image/jpeg',
    profile: { skinType: 'da_hon_hop', allergies: [], conditions: [], goals: [] },
    expectedResult: null,
    expectedRecognized: false,
    riskLevel: 'thấp',
    note: 'Ảnh mờ/không phải sản phẩm — AI phải trả recognized=false thay vì đoán liều.',
  },
]
