import config from '../config/env.js'

export class GeminiNotConfiguredError extends Error {}
export class GeminiRequestError extends Error {
  constructor(message, { status = null, quotaExceeded = false } = {}) {
    super(message)
    this.status = status
    this.quotaExceeded = quotaExceeded
  }
}

// Kết thúc trước timeout 120 giây của chat frontend để API còn thời gian trả lỗi JSON rõ ràng.
const REQUEST_TIMEOUT_MS = 105_000

async function callGemini(body) {
  if (!config.geminiApiKey) {
    throw new GeminiNotConfiguredError('GEMINI_API_KEY chưa được cấu hình.')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new GeminiRequestError('Gemini API phản hồi quá lâu, vui lòng thử lại.')
    }
    throw new GeminiRequestError(`Không thể kết nối tới Gemini API: ${err.message}`)
  }

  if (!response.ok) {
    const errBody = await response.text()
    throw new GeminiRequestError(`Gemini API trả lỗi ${response.status}: ${errBody}`, {
      status: response.status,
      quotaExceeded: response.status === 429,
    })
  }

  const data = await response.json()
  const content = data.candidates?.[0]?.content

  if (!content?.parts?.length) {
    const blockReason = data.promptFeedback?.blockReason
    throw new GeminiRequestError(
      blockReason ? `Gemini từ chối xử lý yêu cầu (${blockReason}).` : 'Gemini không trả về nội dung.',
    )
  }

  return content
}

export async function generateContent(parts, { responseSchema } = {}) {
  const content = await callGemini({
    contents: [{ role: 'user', parts }],
    ...(responseSchema
      ? { generationConfig: { responseMimeType: 'application/json', responseSchema } }
      : {}),
  })

  const text = content.parts.map((part) => part.text || '').join('').trim()
  if (!responseSchema) return text

  try {
    return JSON.parse(text)
  } catch {
    throw new GeminiRequestError('Không thể đọc kết quả JSON từ Gemini.')
  }
}

export async function generateChatReply(contents, systemInstruction) {
  const content = await callGemini({
    contents,
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
  })
  return content.parts.map((part) => part.text || '').join('').trim()
}

export async function generateAgentTurn(contents, systemInstruction, functionDeclarations) {
  return callGemini({
    contents,
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
    tools: [{ functionDeclarations }],
    toolConfig: { functionCallingConfig: { mode: 'AUTO' } },
  })
}
