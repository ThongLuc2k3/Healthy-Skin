import { generateContent, GeminiNotConfiguredError, GeminiRequestError } from './geminiClient.js'
import { SKIN_TYPES, ALLERGIES, CONDITIONS, GOALS } from '../../../src/data/profileOptions.js'

export { GeminiNotConfiguredError, GeminiRequestError }

const RESULT_VALUES = ['phù hợp', 'cần cân nhắc']

const SKIN_LABELS = Object.fromEntries(SKIN_TYPES.map((o) => [o.id, o.label]))
const ALLERGY_LABELS = Object.fromEntries(ALLERGIES.map((o) => [o.id, o.label]))
const CONDITION_LABELS = Object.fromEntries(CONDITIONS.map((o) => [o.id, o.label]))
const GOAL_LABELS = Object.fromEntries(GOALS.map((o) => [o.id, o.label]))

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    recognized: {
      type: 'BOOLEAN',
      description: 'true nếu nhận diện rõ một sản phẩm/thực phẩm cụ thể trong ảnh',
    },
    productName: { type: 'STRING', description: 'Tên sản phẩm hoặc thực phẩm nhận diện được' },
    result: { type: 'STRING', enum: RESULT_VALUES },
    reason: { type: 'STRING', description: 'Giải thích ngắn gọn 1-2 câu, giọng gợi ý cá nhân ("nếu là bạn thì...")' },
    marketPriceRange: { type: 'STRING', description: 'Khoảng giá thị trường tham khảo tại Việt Nam, ví dụ "150.000đ - 220.000đ". Để rỗng nếu không đủ căn cứ để ước lượng.' },
    origin: { type: 'STRING', description: 'Nơi sản xuất/xuất xứ đọc được từ bao bì. Để rỗng nếu không đọc được.' },
    authenticityNote: { type: 'STRING', description: 'Nhận định sơ bộ, tham khảo về dấu hiệu chính hãng hay không (không phải xác nhận pháp lý). Để rỗng nếu không đủ căn cứ.' },
    betterAlternatives: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Tối đa 3 tên sản phẩm liên quan hoặc được đánh giá tốt hơn, phù hợp hồ sơ người dùng hơn. Mảng rỗng nếu không có gợi ý phù hợp.',
    },
    nearbySellers: {
      type: 'ARRAY',
      items: { type: 'STRING' },
      description: 'Tối đa 3 gợi ý chung về nơi/kênh thường bán sản phẩm này tại Việt Nam (ví dụ: "Chuỗi cửa hàng mỹ phẩm", "Sàn thương mại điện tử"). Mảng rỗng nếu không đủ căn cứ.',
    },
  },
  required: ['recognized', 'productName', 'result', 'reason'],
}

export function skinLabel(skinType) {
  return SKIN_LABELS[skinType] || skinType || 'không rõ'
}

export function allergyLabels(allergies) {
  return (allergies || []).map((id) => ALLERGY_LABELS[id] || id)
}

export function conditionLabels(conditions) {
  return (conditions || []).map((id) => CONDITION_LABELS[id] || id)
}

export function goalLabels(goals) {
  return (goals || []).map((id) => GOAL_LABELS[id] || id)
}

// Gộp hồ sơ cá nhân thành đoạn văn cho prompt — bao gồm cả mô tả tự do ("Khác") nếu người dùng có
// nhập, vì đôi khi các mục có sẵn không đủ để mô tả đúng tình trạng của họ.
export function profileSummaryText(profile) {
  const allergies = allergyLabels(profile?.allergies)
  const conditions = conditionLabels(profile?.conditions)
  const goals = goalLabels(profile?.goals)

  const lines = [
    `- Loại da: ${skinLabel(profile?.skinType)}${
      profile?.skinTypeNote ? ` (mô tả thêm của người dùng: "${profile.skinTypeNote}")` : ''
    }`,
    `- Dị ứng thực phẩm: ${allergies.length ? allergies.join(', ') : 'không có'}${
      profile?.allergiesNote ? ` (mô tả thêm của người dùng: "${profile.allergiesNote}")` : ''
    }`,
    `- Bệnh lý nền liên quan dinh dưỡng: ${conditions.length ? conditions.join(', ') : 'không có'}${
      profile?.conditionsNote ? ` (mô tả thêm của người dùng: "${profile.conditionsNote}")` : ''
    }`,
    `- Mục tiêu: ${goals.length ? goals.join(', ') : 'không có'}${
      profile?.goalsNote ? ` (mô tả thêm của người dùng: "${profile.goalsNote}")` : ''
    }`,
  ]

  return lines.join('\n')
}

function buildPrompt(profile) {
  return `Bạn là trợ lý cung cấp thông tin sản phẩm chăm sóc da và thực phẩm cho ứng dụng "HEALTHY SKIN".
Bạn KHÔNG phải bác sĩ và không đưa ra chẩn đoán y khoa — chỉ đưa gợi ý cá nhân nhẹ nhàng và thông tin
sản phẩm khách quan.

Hồ sơ cá nhân người dùng:
${profileSummaryText(profile)}

Nhiệm vụ: Nhìn ảnh được đính kèm (có thể là bảng thành phần mỹ phẩm, nhãn dinh dưỡng, hoặc một sản
phẩm/món ăn cụ thể).
1. Xác định tên sản phẩm hoặc thực phẩm trong ảnh.
2. Đối chiếu với hồ sơ cá nhân ở trên, chọn MỘT trong hai mức: "phù hợp" hoặc "cần cân nhắc". Nếu
   không chắc chắn (ảnh không rõ, sản phẩm lạ, hoặc thấy cần đánh giá y khoa sâu hơn khả năng của bạn),
   LUÔN chọn "cần cân nhắc" thay vì đoán liều "phù hợp".
3. Viết trường reason 1-2 câu, giọng điệu như một gợi ý cá nhân thân thiện (ví dụ: "Nếu là bạn thì...",
   "Có thể cân nhắc vì..."), không phán quyết dứt khoát kiểu y khoa.
4. Nếu đọc được, điền thêm khoảng giá thị trường tham khảo, nơi sản xuất/xuất xứ, và nhận định sơ bộ
   về dấu hiệu chính hãng — để rỗng field nào không đủ căn cứ, không suy đoán liều.
5. Gợi ý tối đa 3 sản phẩm liên quan/tốt hơn (betterAlternatives) và tối đa 3 kênh/nơi thường bán
   (nearbySellers), dựa trên hiểu biết chung, không bịa tên thương hiệu cụ thể nếu không chắc chắn.

Nếu không nhận diện được sản phẩm/thực phẩm rõ ràng trong ảnh, đặt recognized=false và nêu lý do
trong trường reason (ví dụ: ảnh mờ, không phải mỹ phẩm/thực phẩm), để trống các trường thông tin còn lại.`
}

export async function analyzeImage(imageBuffer, mimeType, profile) {
  const parsed = await generateContent(
    [
      { text: buildPrompt(profile) },
      { inlineData: { mimeType, data: imageBuffer.toString('base64') } },
    ],
    { responseSchema: RESPONSE_SCHEMA },
  )

  if (!RESULT_VALUES.includes(parsed.result)) {
    parsed.result = 'cần cân nhắc'
  }

  parsed.betterAlternatives = Array.isArray(parsed.betterAlternatives)
    ? parsed.betterAlternatives.slice(0, 3)
    : []
  parsed.nearbySellers = Array.isArray(parsed.nearbySellers) ? parsed.nearbySellers.slice(0, 3) : []

  return parsed
}
