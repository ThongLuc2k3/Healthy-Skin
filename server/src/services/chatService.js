import { generateAgentTurn } from './geminiClient.js'
import config from '../config/env.js'
import { AgentProviderError, callGroqAgent } from './agentClient.js'
import { profileSummaryText } from './geminiService.js'
import { CHAT_TOOL_SCHEMAS, executeChatTool } from './chatTools.js'

const MAX_MESSAGES = 20
const MAX_MESSAGE_LENGTH = 1000
const MAX_AGENT_STEPS = 12

function buildSystemInstruction(context) {
  const profile = context?.profile
  const profileText = profile?.skinType
    ? `Hồ sơ cá nhân hiện tại của người dùng:\n${profileSummaryText(profile)}`
    : 'Người dùng chưa khai báo hồ sơ cá nhân.'

  return `Bạn là Trợ Lý trong ứng dụng "HEALTHY SKIN" — nền tảng cá nhân hóa chăm sóc da và dinh dưỡng
dựa trên một hồ sơ cá nhân dùng chung. Bạn KHÔNG phải bác sĩ. Nhiệm vụ của bạn CHỈ giới hạn ở hai việc:
(1) hướng dẫn cách dùng app (khai báo hồ sơ, quét ảnh sản phẩm, đặt lịch chuyên gia...), và
(2) giải đáp thắc mắc cơ bản về thành phần mỹ phẩm/thực phẩm liên quan tới hồ sơ cá nhân của họ.

${profileText}
Trang hiện tại người dùng đang xem: ${context?.page || 'không rõ'}.

Quy tắc bắt buộc:
- Trả lời ngắn gọn (tối đa khoảng 5 câu), không lan man.
- Nếu người dùng hỏi kiểu "trị [tình trạng da/bệnh lý] thế nào", "nên dùng sản phẩm/thuốc gì cho...",
  hoặc bất kỳ câu hỏi nào cần đánh giá y khoa cụ thể: KHÔNG tự đưa giải pháp/liệu trình, chỉ trả lời
  rất ngắn rồi gợi ý người dùng đặt lịch tư vấn với chuyên gia thật trên trang "Chuyên gia" của app.
- Không liệt kê tên sản phẩm/thương hiệu cụ thể nên mua — việc đó thuộc trang Quét sản phẩm hoặc
  chuyên gia tư vấn, không phải Trợ Lý.
- Nếu không chắc chắn, thành thật nói không chắc thay vì bịa thông tin.
- Không đưa ra lời khuyên mang tính chẩn đoán y khoa dưới bất kỳ hình thức nào.
- Với câu hỏi kiến thức chăm sóc da hoặc cách dùng app, ưu tiên gọi search_health_knowledge rồi dựa
  trên nội dung được trả về; khi dùng tài liệu hãy ghi nguồn dạng [Tên tài liệu > Tiêu đề].
- Dùng tool thay vì đoán khi câu hỏi liên quan dữ liệu thành phần, thực phẩm, hồ sơ, chuyên gia, cơ sở
  hoặc đường dẫn trong ứng dụng.
- Agent có thể thực hiện thao tác thật bằng tool. Với thao tác thay đổi dữ liệu hoặc phát sinh phí,
  trước tiên phải lấy đủ chi tiết, tóm tắt chuyên gia/dịch vụ, thời gian, phí và gọi tool với
  confirmed=false. Chỉ gọi lại với confirmed=true khi tin nhắn MỚI NHẤT của người dùng xác nhận rõ
  bản tóm tắt đó. Không tự suy diễn sự im lặng hoặc câu hỏi ban đầu là xác nhận.
- Hiểu các cách xác nhận tự nhiên và lỗi gõ gần nghĩa như "xác nhận", "xác nhất", "đồng ý",
  "chốt", "ok đặt" dựa trên ngữ cảnh 10 lượt hội thoại gần nhất.
- Nếu tool trả requiresConfirmation, hỏi xác nhận ngắn gọn. Nếu success=true, nói rõ đã hoàn tất và
  nêu mã lịch/giao dịch nếu có. Nếu requiresLogin, đề nghị đăng nhập Google hoặc tài khoản thường.
- Không bảo người dùng tự vào trang để đặt nếu công cụ tương ứng có thể làm được việc đó.
- Nếu tool trả lỗi hoặc không có kết quả, nói rõ dữ liệu nội bộ chưa có thay vì tự bịa.
- Mỗi bước chỉ gọi đúng một tool; không gọi nhiều tool song song.`
}

function toGeminiRole(role) {
  return role === 'assistant' ? 'model' : 'user'
}

async function chatReplyWithGemini(messages, context) {
  const contents = messages.slice(-MAX_MESSAGES).map((m) => ({
    role: toGeminiRole(m.role),
    parts: [{ text: String(m.text).slice(0, MAX_MESSAGE_LENGTH) }],
  }))

  const toolsUsed = []
  let navigateTo = null
  let pendingAction = null
  for (let turn = 0; turn < MAX_AGENT_STEPS; turn += 1) {
    const parts = await generateAgentTurn(contents, buildSystemInstruction(context), CHAT_TOOL_SCHEMAS)
    const calls = parts.parts.filter((part) => part.functionCall)
    if (calls.length === 0) {
      const reply = parts.parts.map((part) => part.text || '').join('').trim()
      return { reply, toolsUsed, provider: 'gemini', providerModel: config.geminiModel, navigateTo, pendingAction }
    }

    contents.push({ role: 'model', parts: parts.parts })
    const responseParts = []
    for (const part of calls) {
      const { name, args = {} } = part.functionCall
      let result
      try {
        result = await executeChatTool(name, args, context)
      } catch (error) {
        result = { error: error?.message || 'Không thể thực hiện tool lúc này.' }
      }
      toolsUsed.push(name)
      if (result?.navigateTo) navigateTo = result.navigateTo
      if (result?.requiresConfirmation) pendingAction = { name, args, summary: result.summary }
      responseParts.push({ functionResponse: { name, response: { result } } })
    }
    contents.push({ role: 'user', parts: responseParts })
  }
  return { reply: 'Mình chưa thể hoàn tất yêu cầu bằng các công cụ hiện có. Bạn thử diễn đạt cụ thể hơn nhé.', toolsUsed }
}

async function chatReplyWithGroq(messages, context) {
  const conversation = messages.slice(-MAX_MESSAGES).map((message) => ({ role: message.role === 'assistant' ? 'assistant' : 'user', content: String(message.text).slice(0, MAX_MESSAGE_LENGTH) }))
  const toolsUsed = []
  let navigateTo = null
  let pendingAction = null
  let providerModel = config.groqModel
  for (let turn = 0; turn < MAX_AGENT_STEPS; turn += 1) {
    const result = await callGroqAgent(conversation, buildSystemInstruction(context), CHAT_TOOL_SCHEMAS)
    const message = result.message
    providerModel = result.model
    const calls = message.tool_calls || []
    if (!calls.length) return { reply: String(message.content || '').trim(), toolsUsed, provider: 'groq', providerModel, navigateTo, pendingAction }
    conversation.push({ role: 'assistant', content: message.content || null, tool_calls: calls })
    for (const call of calls) {
      const name = call.function?.name
      let args = {}
      try { args = JSON.parse(call.function?.arguments || '{}') } catch { args = {} }
      let toolResult
      try { toolResult = await executeChatTool(name, args, context) }
      catch (error) { toolResult = { error: error?.message || 'Không thể thực hiện tool lúc này.' } }
      toolsUsed.push(name)
      if (toolResult?.navigateTo) navigateTo = toolResult.navigateTo
      if (toolResult?.requiresConfirmation) pendingAction = { name, args, summary: toolResult.summary }
      conversation.push({ role: 'tool', tool_call_id: call.id, name, content: JSON.stringify({ result: toolResult }) })
    }
  }
  return { reply: 'Mình chưa thể hoàn tất yêu cầu bằng các công cụ hiện có. Bạn thử diễn đạt cụ thể hơn nhé.', toolsUsed, provider: 'groq', providerModel }
}

export async function chatReply(messages, context) {
  let groqFailure
  if (config.aiProvider === 'groq' && config.groqApiKey) {
    try { return await chatReplyWithGroq(messages, context) }
    catch (error) { groqFailure = error }
  }
  try { return await chatReplyWithGemini(messages, context) }
  catch (error) {
    if (!groqFailure) throw error
    throw new AgentProviderError(`Groq chưa xử lý được yêu cầu và Gemini dự phòng cũng không khả dụng: ${error.message}`, { status: error.status || 502, quotaExceeded: groqFailure.quotaExceeded && error.quotaExceeded, provider: 'all', cause: { groq: groqFailure.cause, gemini: error.message } })
  }
}
