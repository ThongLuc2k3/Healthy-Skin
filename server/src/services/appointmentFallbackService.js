import { listExperts } from './expertService.js'
import { createBooking } from './bookingService.js'
import { createThreadForBooking } from './consultationService.js'

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd')
}

const WEEKDAYS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7']

function tomorrowInVietnam() {
  const now = new Date()
  const vietnam = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }))
  vietnam.setDate(vietnam.getDate() + 1)
  return {
    weekday: WEEKDAYS[vietnam.getDay()],
    date: vietnam.toLocaleDateString('vi-VN'),
  }
}

function hourOfSlot(slot) {
  const match = String(slot).match(/-\s*(\d{1,2}):(\d{2})/)
  return match ? Number(match[1]) : null
}

function formatExpert(expert, slots) {
  return `${expert.name} (${expert.specialty}), ${Number(expert.consultation_fee_vnd || 0).toLocaleString('vi-VN')}đ: ${slots.join(', ')}`
}

// Khi Gemini hết quota, yêu cầu đặt lịch phổ biến vẫn được xử lý từ dữ liệu thật thay vì trả 502.
export async function getAppointmentFallbackReply(messages, context = {}) {
  const latest = [...messages].reverse().find((message) => message.role === 'user')?.text || ''
  const text = normalize(latest)
  const userConversation = normalize(messages.filter((message) => message.role === 'user').map((message) => message.text).join(' '))
  const hasBookingContext = /\b(dat lich|lich hen|hen bac si|hen chuyen gia)\b/.test(userConversation)
  const isBookingFollowUp = /\b(re nhat|gia re|chieu mat|chieu muon|chon|bac si nay|gio nay|xac (nhan|nhat)|dong y|chot|dat di|ok dat)\b/.test(text)
  if (!hasBookingContext || (!/\b(dat lich|lich hen|hen bac si|hen chuyen gia)\b/.test(text) && !isBookingFollowUp)) return null

  const experts = await listExperts()
  const wantsAcne = /\b(mun|noi mun|acne)\b/.test(userConversation)
  const wantsTomorrow = /\b(ngay mai)\b/.test(userConversation)
  const wantsAfternoon = /\b(buoi chieu|chieu|toi)\b/.test(userConversation)
  const target = wantsTomorrow ? tomorrowInVietnam() : null

  const relevantExperts = wantsAcne
    ? experts.filter((expert) => normalize(expert.specialty).includes('da lieu'))
    : experts
  const ranked = [...relevantExperts].sort((a, b) => {
    const score = (expert) => wantsAcne && normalize(expert.specialty).includes('mun') ? 2 : normalize(expert.specialty).includes('da lieu') ? 1 : 0
    return score(b) - score(a)
  })

  const isConfirmation = /\b(xac (nhan|nhat)|dong y|chot|dat di|ok dat)\b/.test(text)
  if (isConfirmation) {
    if (!context.userId) {
      return { reply: 'Bạn cần đăng nhập trước khi mình tạo lịch. Sau khi đăng nhập, hãy nhắn lại “xác nhận đặt”.', toolsUsed: ['appointment_fallback'], responseMode: 'agent_fallback' }
    }
    const previousAssistant = [...messages].reverse().find((message) => message.role === 'assistant')?.text || ''
    const selectedExpert = ranked.find((expert) => previousAssistant.includes(expert.name))
    const selectedSlot = selectedExpert?.available_slots?.find((slot) => previousAssistant.includes(slot))
    if (!selectedExpert || !selectedSlot) {
      return { reply: 'Mình chưa xác định được chính xác bác sĩ và giờ bạn đang xác nhận. Bạn hãy nhắn tên bác sĩ kèm khung giờ nhé.', toolsUsed: ['appointment_fallback'], responseMode: 'agent_fallback' }
    }
    const booking = await createBooking(context.userId, selectedExpert.id, selectedSlot)
    if (!booking) {
      return { reply: 'Khung giờ này vừa không còn khả dụng. Bạn chọn giúp mình một giờ khác nhé.', toolsUsed: ['appointment_fallback', 'book_expert_appointment'], responseMode: 'agent_fallback' }
    }
    await createThreadForBooking(booking.id, context.userId)
    return {
      reply: `Đã đặt lịch thành công với ${selectedExpert.name} lúc ${selectedSlot}. Phí tư vấn ${Number(selectedExpert.consultation_fee_vnd || 0).toLocaleString('vi-VN')}đ. Mã lịch hẹn: ${booking.id}.`,
      navigateTo: `/my-bookings/${booking.id}/chat`,
      toolsUsed: ['appointment_fallback', 'book_expert_appointment'],
      responseMode: 'agent_fallback',
    }
  }

  const wantsCheapest = /\b(re nhat|gia re|tiet kiem)\b/.test(text)
  const wantsLateAfternoon = /\b(chieu mat|chieu muon|muon muon)\b/.test(text)
  if (wantsCheapest || wantsLateAfternoon) {
    const candidates = ranked.flatMap((expert) => (expert.available_slots || [])
      .filter((slot) => !wantsLateAfternoon || hourOfSlot(slot) >= 15)
      .map((slot) => ({ expert, slot })))
      .sort((a, b) => Number(a.expert.consultation_fee_vnd) - Number(b.expert.consultation_fee_vnd) || hourOfSlot(b.slot) - hourOfSlot(a.slot))
    const choice = candidates[0]
    if (choice) {
      return {
        reply: `Lựa chọn rẻ nhất phù hợp giờ chiều mát là ${choice.expert.name} (${choice.expert.specialty}) lúc ${choice.slot}, phí ${Number(choice.expert.consultation_fee_vnd || 0).toLocaleString('vi-VN')}đ. Bạn nhắn “xác nhận đặt” để mình tạo lịch ngay.`,
        toolsUsed: ['appointment_fallback', 'find_experts'],
        responseMode: 'agent_fallback',
      }
    }
  }

  const exact = ranked.flatMap((expert) => {
    const slots = (expert.available_slots || []).filter((slot) => {
      if (target && !slot.startsWith(target.weekday)) return false
      if (wantsAfternoon && hourOfSlot(slot) < 12) return false
      return true
    })
    return slots.length ? [{ expert, slots }] : []
  }).slice(0, 3)

  const loginNote = context.userId ? '' : ' Bạn cần đăng nhập trước khi mình tạo lịch.'
  if (exact.length) {
    return {
      reply: `Mình đã kiểm tra lịch thật và tìm được:\n${exact.map(({ expert, slots }) => `• ${formatExpert(expert, slots)}`).join('\n')}\nBạn chọn một bác sĩ/giờ rồi nhắn “xác nhận đặt” để mình tạo lịch.${loginNote}`,
      toolsUsed: ['appointment_fallback', 'find_experts'],
      responseMode: 'agent_fallback',
    }
  }

  const alternatives = ranked.slice(0, 3).map((expert) => formatExpert(expert, (expert.available_slots || []).slice(0, 3)))
  const requested = target ? `${target.weekday} (${target.date})${wantsAfternoon ? ' buổi chiều' : ''}` : 'thời gian bạn yêu cầu'
  return {
    reply: `Mình đã hiểu bạn muốn khám về tình trạng nổi mụn, có thể liên quan sản phẩm mới hoặc chế độ ăn. Hiện không có lịch có sẵn đúng ${requested}. Các lựa chọn gần nhất:\n${alternatives.map((item) => `• ${item}`).join('\n')}\nBạn có thể chọn một giờ trên, hoặc nhắn giờ cụ thể để mình gửi đề xuất lịch mới cho bác sĩ.${loginNote}`,
    toolsUsed: ['appointment_fallback', 'find_experts'],
    responseMode: 'agent_fallback',
  }
}
