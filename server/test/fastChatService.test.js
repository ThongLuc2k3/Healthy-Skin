import test from 'node:test'
import assert from 'node:assert/strict'
import { getFastChatReply } from '../src/services/fastChatService.js'

const ask = (text) => getFastChatReply([{ role: 'user', text }])

test('câu chào dùng câu trả lời lưu sẵn', async () => {
  const result = await ask('hello')
  assert.equal(result.responseMode, 'keyword')
  assert.deepEqual(result.toolsUsed, ['keyword_response'])
})

test('câu hỏi thao tác đơn giản dùng hướng dẫn nội bộ', async () => {
  const result = await ask('Quét sản phẩm như thế nào?')
  assert.equal(result.responseMode, 'keyword')
  assert.match(result.reply, /\/scan/)
})

test('câu kiến thức rõ ràng dùng RAG', async () => {
  const result = await ask('Kem chống nắng SPF bao nhiêu?')
  assert.equal(result.responseMode, 'rag')
  assert.match(result.reply, /Nguồn:/)
})

test('chủ đề mới không cần khai báo keyword vẫn được hybrid RAG tìm thấy', async () => {
  const result = await ask('Ăn nóng và sản phẩm mới có làm tôi nổi mụn không?')
  assert.equal(result.responseMode, 'rag')
  assert.match(result.reply, /Nguồn:/)
})

test('câu hỏi lĩnh vực website không bị trả nhầm tài liệu mụn', async () => {
  const result = await ask('Trang web bạn đang làm về lĩnh vực nào?')
  assert.equal(result.responseMode, 'rag')
  assert.match(result.reply, /công nghệ hỗ trợ chăm sóc da và dinh dưỡng/i)
  assert.doesNotMatch(result.reply, /Mụn có thể biểu hiện/)
  assert.ok(result.confidence >= 0.85)
})

test('RAG không đoán khi không có kết quả đạt 85 phần trăm', async () => {
  const result = await ask('Cách sửa động cơ phản lực trên sao Hỏa?')
  assert.equal(result.responseMode, 'rag_no_match')
  assert.equal(result.confidence, 0)
  assert.match(result.reply, /chưa biết/i)
})

test('câu mơ hồ được chuyển tiếp cho Agent', async () => {
  assert.equal(await ask('Tôi nên làm gì?'), null)
})

test('yêu cầu thao tác và xác nhận luôn được chuyển cho Agent', async () => {
  assert.equal(await ask('Đặt lịch chuyên gia giúp tôi'), null)
  assert.equal(await ask('Tôi đồng ý, đặt đi'), null)
  assert.equal(await ask('xác nhất'), null)
})
