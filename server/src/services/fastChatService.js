import { MIN_KNOWLEDGE_CONFIDENCE, searchKnowledge } from './knowledgeService.js'

function normalize(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd').trim()
}

const CANNED = [
  { test: /^(xin chao|chao|hello|hi|hey|alo)[.!? ]*$/, reply: 'Chào bạn! Mình là Trợ Lý HEALTHY SKIN. Mình có thể giúp bạn tra cứu thành phần, hướng dẫn quét sản phẩm, tìm chuyên gia hoặc giải thích cách dùng ứng dụng.' },
  { test: /^(cam on|thank|thanks|ok|okay|oke)[.!? ]*$/, reply: 'Rất vui vì đã giúp được bạn. Khi cần, bạn cứ hỏi mình về thành phần, hồ sơ da hoặc các tính năng của HEALTHY SKIN nhé.' },
  { test: /^(ban la ai|day la dau|tro ly la gi)[.!? ]*$/, reply: 'Mình là Trợ Lý HEALTHY SKIN, hỗ trợ tra cứu kiến thức chăm sóc da, dữ liệu sản phẩm và hướng dẫn sử dụng web. Mình không thay thế bác sĩ hoặc chẩn đoán y khoa.' },
  { test: /^(giup toi|giup minh|ban giup duoc gi|can giup do)[.!? ]*$/, reply: 'Bạn có thể nhờ mình tra cứu thành phần, xem hoặc cập nhật hồ sơ, tìm và đặt lịch chuyên gia, đặt dịch vụ, xem lịch sử, ví và voucher. Với thao tác thay đổi dữ liệu hoặc phát sinh phí, mình sẽ hỏi bạn xác nhận trước.' },
]

const APP_GUIDES = [
  { keywords: ['quet san pham', 'quet anh', 'scan'], reply: 'Bạn mở trang Quét thử, chọn ảnh rõ mặt trước và bảng thành phần rồi bắt đầu phân tích. Kết quả chỉ mang tính hỗ trợ sàng lọc. Mở nhanh: /scan' },
  { keywords: ['tao ho so', 'ho so da', 'sua ho so'], reply: 'Bạn mở Hồ sơ da, chọn loại da, dị ứng, tình trạng nền và mục tiêu rồi lưu lại. Hồ sơ này được dùng để cá nhân hóa kết quả quét. Mở nhanh: /profile' },
  { keywords: ['tim chuyen gia'], reply: 'Bạn có thể cho mình biết khu vực mong muốn để mình tìm chuyên gia, xem phí và khung giờ giúp bạn. Hoặc mở nhanh: /experts' },
  { keywords: ['dich vu gan', 'co so gan', 'spa gan'], reply: 'Bạn vào Dịch Vụ Quanh Bạn và cho phép vị trí để sắp xếp cơ sở theo khoảng cách. Mở nhanh: /dich-vu' },
  { keywords: ['lich su quet', 'xem lich su'], reply: 'Lịch sử phân tích được lưu cho tài khoản đã đăng nhập. Bạn có thể xem tại: /history' },
]

function ragAnswer(chunk) {
  const paragraphs = chunk.content.split(/\n\s*\n/).slice(1).filter((part) => !part.startsWith('## Nguồn'))
  const content = paragraphs.join('\n\n').split('\n## Nguồn')[0].trim().slice(0, 850)
  return `${content}\n\nNguồn: [${chunk.source} > ${chunk.title}]`
}

export async function getFastChatReply(messages) {
  const latest = [...messages].reverse().find((message) => message.role === 'user')?.text || ''
  const text = normalize(latest)
  if (!text) return null

  if (/^(toi|minh|em|tui)?\s*(nen|can)\s*(lam gi|giup gi|the nao)[.!? ]*$/.test(text)) return null

  // Mọi ý định thực hiện hoặc xác nhận thao tác phải đi qua Agent/tool, không được câu trả lời nhanh
  // chặn lại và hướng người dùng sang thao tác thủ công.
  const actionIntent = /\b(dat lich|dat dich vu|mua goi|nap vi|doi voucher|cap nhat ho so|sua ho so|xac (nhan|nhat)|dong y|chot|thuc hien di|dat di|mua di|nap di|doi di)\b/
  if (actionIntent.test(text)) return null

  const canned = CANNED.find((item) => item.test.test(text))
  if (canned) return { reply: canned.reply, toolsUsed: ['keyword_response'], responseMode: 'keyword' }

  if (text.length <= 180) {
    const guide = APP_GUIDES.find((item) => item.keywords.some((keyword) => text.includes(keyword)))
    if (guide) return { reply: guide.reply, toolsUsed: ['app_guide'], responseMode: 'keyword' }

    // Thử hybrid search cho mọi câu kiến thức ngắn. Ngưỡng điểm chặn kết quả yếu/không liên quan;
    // các ý định thao tác đã được chuyển cho Agent ở phía trên.
    const [chunk] = await searchKnowledge(latest, 1)
    if (chunk?.confidence >= MIN_KNOWLEDGE_CONFIDENCE) {
      return { reply: ragAnswer(chunk), confidence: chunk.confidence, toolsUsed: ['search_health_knowledge'], responseMode: 'rag' }
    }
    return {
      reply: 'Mình chưa biết câu trả lời từ kho tài liệu HEALTHY SKIN hiện có. Bạn có thể hỏi rõ hơn hoặc chọn tư vấn với chuyên gia.',
      confidence: 0,
      toolsUsed: ['search_health_knowledge'],
      responseMode: 'rag_no_match',
    }
  }
  return null
}
