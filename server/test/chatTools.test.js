import test from 'node:test'
import assert from 'node:assert/strict'
import { CHAT_TOOL_SCHEMAS, executeChatTool } from '../src/services/chatTools.js'
import { getKnowledgeStats, searchKnowledge } from '../src/services/knowledgeService.js'

test('mọi chat tool đều có JSON schema hợp lệ cơ bản', () => {
  assert.ok(CHAT_TOOL_SCHEMAS.length >= 25)
  for (const tool of CHAT_TOOL_SCHEMAS) {
    assert.match(tool.name, /^[a-z][a-z0-9_]+$/)
    assert.equal(tool.parameters.type, 'OBJECT')
    assert.equal(typeof tool.parameters.properties, 'object')
  }
})

test('tool thay đổi dữ liệu yêu cầu đăng nhập và xác nhận', async () => {
  const noLogin = await executeChatTool('book_expert_appointment', { expertId: 'e1', slot: 's1', confirmed: true })
  assert.equal(noLogin.requiresLogin, true)

  const noConfirmation = await executeChatTool(
    'book_expert_appointment',
    { expertId: 'e1', slot: 's1', confirmed: false },
    { userId: 'u1' },
  )
  assert.equal(noConfirmation.requiresConfirmation, true)

  const modelCannotSelfConfirm = await executeChatTool(
    'book_expert_appointment',
    { expertId: 'e1', slot: 's1', confirmed: true },
    { userId: 'u1', latestUserText: 'Tôi muốn đặt lịch với bác sĩ này' },
  )
  assert.equal(modelCannotSelfConfirm.requiresConfirmation, true)
})

test('RAG trả về chunk có nguồn và nội dung liên quan', async () => {
  const results = await executeChatTool('search_health_knowledge', { query: 'chống nắng SPF' })
  assert.ok(results.length > 0)
  assert.equal(typeof results[0].source, 'string')
  assert.match(results[0].content.toLowerCase(), /chống nắng|sunscreen|spf/)
})

test('RAG có phân cấp metadata và ưu tiên dấu hiệu khẩn cấp', async () => {
  const stats = await getKnowledgeStats()
  assert.ok(stats.documents >= 10)
  assert.ok(stats.chunks >= 50)
  assert.ok(stats.domains.includes('acne'))

  const [top] = await searchKnowledge('khó thở và sưng môi sau khi dùng mỹ phẩm', 3)
  assert.equal(top.riskLevel, 'urgent')
  assert.equal(top.retrievalMode, 'hybrid_json_keyword')
  assert.ok(Array.isArray(top.hierarchy) && top.hierarchy.length >= 1)
})

test('RAG hiểu truy vấn kết hợp mụn, sản phẩm mới và ăn nóng', async () => {
  const results = await searchKnowledge('mặt nổi mụn do sản phẩm mới hay ăn nóng', 4)
  assert.equal(results[0].source, 'acne-guide.md')
  assert.ok(results.some((item) => item.domain === 'nutrition'))
})

test('tool đối chiếu thành phần sử dụng hồ sơ hiện tại', async () => {
  const result = await executeChatTool(
    'check_ingredient_for_profile',
    { ingredient: 'retinol' },
    { profile: { skinType: 'da_nhay_cam' } },
  )
  assert.equal(result.needsCaution, true)
})

test('tool tra cứu thành phần chỉ trả tối đa 5 kết quả phù hợp', async () => {
  const results = await executeChatTool('search_skin_ingredients', { query: 'retinol' })
  assert.ok(results.length > 0 && results.length <= 5)
  assert.match(results[0].name_vi.toLowerCase(), /retinol/)
})

test('tool điều hướng chỉ trả các route trong whitelist', async () => {
  assert.deepEqual(await executeChatTool('open_app_page', { page: 'experts' }), {
    label: 'Chuyên gia', path: '/experts',
  })
  assert.deepEqual(await executeChatTool('open_app_page', { page: '../../admin' }), {
    error: 'Trang không hợp lệ.',
  })
})
