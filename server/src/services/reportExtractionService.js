import { generateContent } from './geminiClient.js'

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    conditions: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          name_vi: { type: 'STRING', description: 'Tên bệnh lý da liễu được ghi trong báo cáo' },
          diagnosed_date: { type: 'STRING', description: 'Ngày chẩn đoán dạng YYYY-MM hoặc YYYY-MM-DD nếu đọc được trong file, để rỗng nếu không có' },
          note: { type: 'STRING', description: 'Ghi chú ngắn: nơi khám/bác sĩ chẩn đoán hoặc chi tiết liên quan đọc được trong file, để rỗng nếu không có' },
        },
        required: ['name_vi'],
      },
      description: 'Danh sách bệnh lý da liễu đã được chẩn đoán, đọc thấy trong file. Mảng rỗng nếu không tìm thấy hoặc file không phải báo cáo y tế.',
    },
  },
  required: ['conditions'],
}

const PROMPT = `Bạn hỗ trợ người dùng ứng dụng "HEALTHY SKIN" nhập nhanh hồ sơ cá nhân bằng cách đọc giúp
file báo cáo/kết quả khám da liễu họ tự tải lên.

Nhiệm vụ: Đọc file đính kèm, tìm các bệnh lý da liễu ĐÃ ĐƯỢC GHI RÕ là chẩn đoán trong file (ví dụ tên
bệnh trong phần "Chẩn đoán", "Kết luận" của một tờ kết quả khám). Với mỗi bệnh lý tìm thấy, trích tên
bệnh, ngày chẩn đoán (nếu có), và ghi chú ngắn (nơi khám/bác sĩ, nếu có).

QUAN TRỌNG: Chỉ trích xuất đúng những gì đã được viết rõ trong file. KHÔNG tự suy diễn, KHÔNG tự đưa
ra chẩn đoán mới, KHÔNG đoán khi chữ mờ/không rõ. Nếu file không phải báo cáo y tế hoặc không đọc được
nội dung liên quan, trả về mảng conditions rỗng.`

// Trích xuất bệnh lý đã chẩn đoán từ file báo cáo khám người dùng tự tải lên, để điền sẵn form thay
// vì bắt gõ tay — người dùng vẫn phải tự bấm "Lưu bệnh lý" mới thật sự lưu (xem ExtendedProfileSection),
// nên đây chỉ là gợi ý đọc lại đúng nội dung file, KHÔNG phải AI tự chẩn đoán mới.
//
// Lỗi ở đây (Gemini chưa cấu hình/quá tải/file không đọc được) không được chặn việc lưu file báo cáo —
// trả mảng rỗng để người dùng vẫn tự nhập tay được như trước khi có tính năng này.
export async function extractDiagnosedConditions(fileBuffer, mimeType) {
  try {
    const parsed = await generateContent(
      [
        { text: PROMPT },
        { inlineData: { mimeType, data: fileBuffer.toString('base64') } },
      ],
      { responseSchema: RESPONSE_SCHEMA },
    )
    const conditions = Array.isArray(parsed.conditions) ? parsed.conditions : []
    return conditions
      .slice(0, 20)
      .map((c) => ({
        name_vi: typeof c.name_vi === 'string' ? c.name_vi.slice(0, 200) : '',
        diagnosed_date: typeof c.diagnosed_date === 'string' ? c.diagnosed_date.slice(0, 20) : '',
        note: typeof c.note === 'string' ? c.note.slice(0, 500) : '',
      }))
      .filter((c) => c.name_vi)
  } catch (err) {
    console.error('[reportExtraction] Không trích xuất được bệnh lý từ file:', err.message)
    return []
  }
}
