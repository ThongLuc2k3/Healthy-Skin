import config from '../config/env.js'

export class AgentProviderError extends Error {
  constructor(message, { status = 502, quotaExceeded = false, provider = 'groq', cause } = {}) {
    super(message)
    this.status = status
    this.quotaExceeded = quotaExceeded
    this.provider = provider
    this.cause = cause
  }
}

const REQUEST_TIMEOUT_MS = 105_000

function lowerCaseSchema(value) {
  if (Array.isArray(value)) return value.map(lowerCaseSchema)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, key === 'type' && typeof item === 'string' ? item.toLowerCase() : lowerCaseSchema(item)]))
}

export function toGroqTools(functionDeclarations) {
  return functionDeclarations.map((tool) => ({
    type: 'function',
    function: { name: tool.name, description: tool.description, parameters: lowerCaseSchema(tool.parameters) },
  }))
}

export async function callGroqAgent(messages, systemInstruction, functionDeclarations) {
  if (!config.groqApiKey) throw new AgentProviderError('GROQ_API_KEY chưa được cấu hình.', { status: 503 })
  const models = [...new Set([config.groqModel, config.groqFallbackModel].filter(Boolean))]
  let last
  for (const model of models) {
    let response
    try {
      response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${config.groqApiKey}` },
        body: JSON.stringify({ model, messages: [{ role: 'system', content: systemInstruction }, ...messages], tools: toGroqTools(functionDeclarations), tool_choice: 'auto', parallel_tool_calls: false, temperature: .1, max_completion_tokens: 3000 }),
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      })
    } catch (error) {
      last = new AgentProviderError('Groq phản hồi quá lâu hoặc không thể kết nối.', { cause: error })
      continue
    }
    const payload = await response.json().catch(() => ({}))
    if (response.ok && payload.choices?.[0]?.message) return { message: payload.choices[0].message, model }
    const quotaExceeded = response.status === 429
    last = new AgentProviderError(quotaExceeded ? 'Groq đã chạm giới hạn hiện tại.' : 'Groq không tạo được tool call hợp lệ.', { status: response.status, quotaExceeded, cause: payload.error })
    if (payload.error?.code !== 'tool_use_failed' && !quotaExceeded && response.status < 500) break
  }
  throw last || new AgentProviderError('Groq không trả về nội dung.')
}
