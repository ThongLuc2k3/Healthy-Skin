import config from '../config/env.js'
import { callGroqJson } from './agentClient.js'
import { generateContent } from './geminiClient.js'

export const INTENT_ROUTES = ['static', 'rag', 'agent_read', 'agent_write', 'confirm', 'clarify']

const SYSTEM_PROMPT = `Bạn là bộ định tuyến ý định cho HEALTHY SKIN. Chỉ phân loại, không trả lời và không quyết định thực thi.
Chọn đúng một route:
- static: chào hỏi, cảm ơn, giới thiệu ứng dụng.
- rag: hỏi kiến thức chung về da, mỹ phẩm, thành phần, thực phẩm hoặc dinh dưỡng; không yêu cầu dữ liệu tài khoản.
- agent_read: muốn xem, tìm hoặc mở dữ liệu thật trong ứng dụng như ví, hồ sơ, lịch, chuyên gia, dịch vụ, voucher, lịch sử.
- agent_write: muốn tạo, sửa, xóa, mua, nạp, đặt hoặc gửi một thao tác thật nhưng chưa phải tin xác nhận cuối.
- confirm: tin mới nhất xác nhận, đồng ý, chốt hoặc sửa lựa chọn của thao tác đang bàn ở các tin trước.
- clarify: ý định thiếu rõ ràng hoặc ngoài phạm vi.
Phải dùng ngữ cảnh hội thoại. Trả JSON duy nhất: {"route":"...","confidence":0.0,"reason":"..."}. Phân loại confirm không phải quyền thực thi; server sẽ kiểm tra lại.`

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    route: { type: 'STRING', enum: INTENT_ROUTES.map((item) => item.toUpperCase()) },
    confidence: { type: 'NUMBER' },
    reason: { type: 'STRING' },
  },
  required: ['route', 'confidence', 'reason'],
}

function normalizeResult(value, provider) {
  const route = String(value?.route || '').toLowerCase()
  if (!INTENT_ROUTES.includes(route)) throw new Error('Intent route không hợp lệ')
  return {
    route,
    confidence: Math.min(Math.max(Number(value.confidence) || 0, 0), 1),
    reason: String(value.reason || '').slice(0, 160),
    provider,
  }
}

function conversation(messages) {
  return messages.slice(-10).map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'user',
    content: String(message.text).slice(0, 700),
  }))
}

export async function classifyChatIntent(messages) {
  if (config.aiProvider === 'groq' && config.groqApiKey) {
    try {
      const result = await callGroqJson(conversation(messages), SYSTEM_PROMPT)
      return normalizeResult(result.value, `groq:${result.model}`)
    } catch (error) {
      console.warn('[intent-router] Groq fallback:', error.message)
    }
  }

  if (config.geminiApiKey) {
    try {
      const transcript = conversation(messages).map((item) => `${item.role}: ${item.content}`).join('\n')
      const result = await generateContent([{ text: `${SYSTEM_PROMPT}\n\nHội thoại:\n${transcript}` }], { responseSchema: RESPONSE_SCHEMA })
      return normalizeResult(result, `gemini:${config.geminiModel}`)
    } catch (error) {
      console.warn('[intent-router] Gemini fallback:', error.message)
    }
  }

  return null
}
