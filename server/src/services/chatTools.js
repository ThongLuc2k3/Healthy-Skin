import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { getExpertById, listExperts } from './expertService.js'
import {
  bookService, listBookingsForUser as listServiceBookingsForUser,
  listServicesForVenue, listVenues,
} from './venueService.js'
import { searchKnowledge } from './knowledgeService.js'
import { createBooking, listBookingsForUser as listExpertBookingsForUser } from './bookingService.js'
import { createThreadForBooking } from './consultationService.js'
import { getProfile, saveProfile } from './profileService.js'
import { CHAT_PLANS, getWalletStatus, purchasePlan, topupWallet } from './chatWalletService.js'
import { listScanHistory } from './scanHistoryService.js'
import { listUserVouchers, listVoucherCatalog, redeemVoucherWithPoints } from './voucherService.js'
import { createProposal } from './expertProposalService.js'

const here = dirname(fileURLToPath(import.meta.url))
const ingredientsPath = resolve(here, '../../../src/data/skincare_ingredients.json')
const foodPath = resolve(here, '../../../src/data/food_items.json')

export const CHAT_TOOL_SCHEMAS = [
  {
    name: 'search_skin_ingredients',
    description: 'Tra cứu dữ liệu thành phần mỹ phẩm của HEALTHY SKIN theo tên hoặc công dụng.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Tên thành phần hoặc từ khóa, ví dụ retinol, cấp ẩm.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'find_experts',
    description: 'Tìm tối đa 5 chuyên gia da liễu/chăm sóc da đang có trên ứng dụng.',
    parameters: {
      type: 'OBJECT',
      properties: { area: { type: 'STRING', description: 'Khu vực mong muốn; để trống nếu không rõ.' } },
    },
  },
  {
    name: 'search_food_items',
    description: 'Tra cứu dữ liệu thực phẩm, dị ứng và tình trạng nền trong bộ dữ liệu HEALTHY SKIN.',
    parameters: {
      type: 'OBJECT',
      properties: { query: { type: 'STRING', description: 'Tên thực phẩm, dị ứng hoặc từ khóa.' } },
      required: ['query'],
    },
  },
  {
    name: 'check_ingredient_for_profile',
    description: 'Đối chiếu một thành phần mỹ phẩm với loại da trong hồ sơ hiện tại.',
    parameters: {
      type: 'OBJECT',
      properties: { ingredient: { type: 'STRING', description: 'Tên thành phần cần đối chiếu.' } },
      required: ['ingredient'],
    },
  },
  {
    name: 'compare_skin_ingredients',
    description: 'So sánh dữ liệu của từ hai đến bốn thành phần mỹ phẩm.',
    parameters: {
      type: 'OBJECT',
      properties: {
        ingredients: { type: 'ARRAY', items: { type: 'STRING' }, description: 'Danh sách tên thành phần.' },
      },
      required: ['ingredients'],
    },
  },
  {
    name: 'search_health_knowledge',
    description: 'RAG: tìm đoạn tài liệu HEALTHY SKIN liên quan và trả kèm nguồn để trả lời có căn cứ.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Câu hỏi hoặc chủ đề cần tìm trong kho tri thức.' },
        limit: { type: 'INTEGER', description: 'Số đoạn cần lấy, từ 1 đến 6.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_app_capabilities',
    description: 'Liệt kê tính năng, giới hạn và các trang mà HEALTHY SKIN hỗ trợ.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'find_skin_services',
    description: 'Tìm tối đa 5 cơ sở dịch vụ chăm sóc da, có thể sắp xếp theo vị trí.',
    parameters: {
      type: 'OBJECT',
      properties: {
        category: { type: 'STRING', description: 'Loại dịch vụ/cơ sở cần tìm.' },
        latitude: { type: 'NUMBER', description: 'Vĩ độ hiện tại nếu người dùng đã cung cấp.' },
        longitude: { type: 'NUMBER', description: 'Kinh độ hiện tại nếu người dùng đã cung cấp.' },
      },
    },
  },
  {
    name: 'read_skin_profile',
    description: 'Đọc hồ sơ da người dùng đã cung cấp cho phiên chat để cá nhân hóa câu trả lời.',
    parameters: { type: 'OBJECT', properties: {} },
  },
  {
    name: 'open_app_page',
    description: 'Đề xuất đúng trang trong HEALTHY SKIN để người dùng tiếp tục thao tác.',
    parameters: {
      type: 'OBJECT',
      properties: {
        page: {
          type: 'STRING',
          enum: ['profile', 'scan', 'experts', 'services', 'history', 'pricing'],
          description: 'Trang cần mở.',
        },
      },
      required: ['page'],
    },
  },
  { name: 'get_expert_details', description: 'Xem chi tiết, phí và các khung giờ còn trống của một chuyên gia.', parameters: { type: 'OBJECT', properties: { expertId: { type: 'STRING' } }, required: ['expertId'] } },
  { name: 'get_venue_services', description: 'Xem các dịch vụ có thể đặt tại một cơ sở.', parameters: { type: 'OBJECT', properties: { venueId: { type: 'STRING' } }, required: ['venueId'] } },
  { name: 'get_my_profile', description: 'Đọc hồ sơ da đã lưu của người dùng đang đăng nhập.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'get_my_wallet', description: 'Xem số dư, điểm và số câu hỏi Trợ Lý còn lại.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'list_my_expert_bookings', description: 'Xem các lịch hẹn chuyên gia của người dùng.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'list_my_service_bookings', description: 'Xem các lịch đặt dịch vụ chăm sóc da của người dùng.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'list_my_vouchers', description: 'Xem voucher của người dùng.', parameters: { type: 'OBJECT', properties: { onlyUnused: { type: 'BOOLEAN' } } } },
  { name: 'list_voucher_catalog', description: 'Xem danh mục voucher có thể đổi bằng điểm.', parameters: { type: 'OBJECT', properties: {} } },
  { name: 'list_my_scan_history', description: 'Xem lịch sử quét và phân tích sản phẩm gần đây.', parameters: { type: 'OBJECT', properties: { limit: { type: 'INTEGER' } } } },
  {
    name: 'book_expert_appointment',
    description: 'Tạo lịch hẹn thật với chuyên gia. Chỉ gọi confirmed=true sau khi người dùng xác nhận đúng chuyên gia, giờ và phí.',
    parameters: { type: 'OBJECT', properties: { expertId: { type: 'STRING' }, slot: { type: 'STRING', description: 'Khung giờ chính xác có trong available_slots.' }, confirmed: { type: 'BOOLEAN' } }, required: ['expertId', 'slot', 'confirmed'] },
  },
  {
    name: 'propose_expert_appointment',
    description: 'Gửi đề xuất một giờ hẹn khác cho chuyên gia. Cần xác nhận trước khi gửi.',
    parameters: { type: 'OBJECT', properties: { expertId: { type: 'STRING' }, date: { type: 'STRING' }, time: { type: 'STRING' }, feeVnd: { type: 'INTEGER' }, note: { type: 'STRING' }, confirmed: { type: 'BOOLEAN' } }, required: ['expertId', 'date', 'time', 'confirmed'] },
  },
  {
    name: 'book_skin_service',
    description: 'Đặt và thanh toán demo một dịch vụ tại cơ sở. Cần xác nhận dịch vụ, giờ và giá trước khi gọi.',
    parameters: { type: 'OBJECT', properties: { serviceId: { type: 'STRING' }, scheduledAt: { type: 'STRING', description: 'Thời gian ISO 8601.' }, userVoucherId: { type: 'STRING' }, confirmed: { type: 'BOOLEAN' } }, required: ['serviceId', 'scheduledAt', 'confirmed'] },
  },
  {
    name: 'update_my_skin_profile',
    description: 'Cập nhật một hoặc nhiều trường hồ sơ da. Cần nói rõ thay đổi và được người dùng xác nhận.',
    parameters: { type: 'OBJECT', properties: { skinType: { type: 'STRING' }, allergies: { type: 'ARRAY', items: { type: 'STRING' } }, conditions: { type: 'ARRAY', items: { type: 'STRING' } }, goals: { type: 'ARRAY', items: { type: 'STRING' } }, skinTypeNote: { type: 'STRING' }, allergiesNote: { type: 'STRING' }, conditionsNote: { type: 'STRING' }, goalsNote: { type: 'STRING' }, confirmed: { type: 'BOOLEAN' } }, required: ['confirmed'] },
  },
  { name: 'redeem_voucher', description: 'Đổi điểm lấy voucher. Cần xác nhận voucher và số điểm trước khi đổi.', parameters: { type: 'OBJECT', properties: { voucherId: { type: 'STRING' }, confirmed: { type: 'BOOLEAN' } }, required: ['voucherId', 'confirmed'] } },
  { name: 'purchase_assistant_plan', description: 'Mua gói Trợ Lý bằng thanh toán demo. Cần xác nhận tên gói và giá.', parameters: { type: 'OBJECT', properties: { planId: { type: 'STRING', enum: ['basic_10', 'plus_30', 'pro_100'] }, confirmed: { type: 'BOOLEAN' } }, required: ['planId', 'confirmed'] } },
  { name: 'top_up_wallet', description: 'Nạp ví bằng thanh toán demo. Cần xác nhận số tiền.', parameters: { type: 'OBJECT', properties: { amountVnd: { type: 'INTEGER' }, confirmed: { type: 'BOOLEAN' } }, required: ['amountVnd', 'confirmed'] } },
]

const APP_PAGES = {
  profile: { label: 'Hồ sơ cá nhân', path: '/profile' },
  scan: { label: 'Quét sản phẩm', path: '/scan' },
  experts: { label: 'Chuyên gia', path: '/experts' },
  services: { label: 'Dịch vụ gần bạn', path: '/dich-vu' },
  history: { label: 'Lịch sử phân tích', path: '/history' },
  pricing: { label: 'Gói Trợ Lý', path: '/pricing' },
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'))
}

function searchItems(items, query, limit = 5) {
  const normalized = String(query || '').trim().toLocaleLowerCase('vi')
  if (!normalized) return []
  return items.filter((item) => JSON.stringify(item).toLocaleLowerCase('vi').includes(normalized)).slice(0, limit)
}

function compactProfile(profile) {
  if (!profile || typeof profile !== 'object') return { available: false }
  const allowed = ['skinType', 'skinConcerns', 'allergies', 'conditions', 'goals']
  return Object.fromEntries(allowed.filter((key) => profile[key] != null).map((key) => [key, profile[key]]))
}

function requireLogin(context) {
  return context.userId ? null : { error: 'Bạn cần đăng nhập để thực hiện thao tác này.', requiresLogin: true }
}

function normalizeVietnamese(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd')
}

function requireConfirmation(args, summary, context) {
  const latest = normalizeVietnamese(context.latestUserText)
  const explicitlyConfirmed = /\b(xac (nhan|nhat)|dong y|toi dong y|dung roi|dum (oi|roi)|chot|ok|oke|uh|yes|chuan|ok dat|dat di|lam luon|thuc hien di|mua di|nap di|doi di|cap nhat di)\b/.test(latest)
  if (args.confirmed === true && explicitlyConfirmed) return null
  return { requiresConfirmation: true, summary, message: 'Hãy trình bày đầy đủ chi tiết rồi yêu cầu người dùng xác nhận trước khi thực hiện.' }
}

export async function executeChatTool(name, args = {}, context = {}) {
  switch (name) {
    case 'search_skin_ingredients': { // Dữ liệu tĩnh đã được kiểm duyệt trong repo, không truy vấn web.
      const results = searchItems(await readJson(ingredientsPath), args.query)
      return results.length ? results : { found: false, message: 'Không tìm thấy thành phần trong dữ liệu nội bộ.' }
    }
    case 'search_food_items': {
      const results = searchItems(await readJson(foodPath), args.query)
      return results.length ? results : { found: false, message: 'Không tìm thấy thực phẩm trong dữ liệu nội bộ.' }
    }
    case 'check_ingredient_for_profile': {
      const results = searchItems(await readJson(ingredientsPath), args.ingredient, 1)
      if (!results.length) return { found: false }
      const item = results[0]
      const skinType = context.profile?.skinType
      return {
        ingredient: item,
        profileSkinType: skinType || null,
        needsCaution: Boolean(skinType && item.conflicts_with_skin_type?.includes(skinType)),
        note: 'Đối chiếu theo rule dữ liệu, không phải đánh giá y khoa.',
      }
    }
    case 'compare_skin_ingredients': {
      const requested = Array.isArray(args.ingredients) ? args.ingredients.slice(0, 4) : []
      const items = await readJson(ingredientsPath)
      return requested.map((ingredient) => ({ query: ingredient, matches: searchItems(items, ingredient, 1) }))
    }
    case 'search_health_knowledge':
      return searchKnowledge(String(args.query || ''), Number(args.limit) || 4)
    case 'get_app_capabilities':
      return {
        capabilities: ['hồ sơ da', 'quét sản phẩm', 'lịch sử', 'chat Agent', 'chuyên gia', 'dịch vụ', 'voucher', 'đánh giá'],
        pages: APP_PAGES,
        limits: ['AI không chẩn đoán hoặc kê thuốc', 'kết quả quét chỉ hỗ trợ tham khảo', 'thanh toán đang ở chế độ demo'],
      }
    case 'find_experts':
      return (await listExperts(String(args.area || '').trim() || undefined)).slice(0, 5)
    case 'get_expert_details':
      return (await getExpertById(args.expertId)) || { found: false }
    case 'find_skin_services': {
      const lat = Number.isFinite(Number(args.latitude)) ? Number(args.latitude) : undefined
      const lng = Number.isFinite(Number(args.longitude)) ? Number(args.longitude) : undefined
      return (await listVenues(String(args.category || '').trim() || undefined, lat, lng)).slice(0, 5)
    }
    case 'read_skin_profile':
      return compactProfile(context.profile)
    case 'get_venue_services':
      return (await listServicesForVenue(args.venueId)).slice(0, 20)
    case 'get_my_profile': {
      const blocked = requireLogin(context)
      return blocked || getProfile(context.userId)
    }
    case 'get_my_wallet': {
      const blocked = requireLogin(context)
      return blocked || getWalletStatus(context.userId)
    }
    case 'list_my_expert_bookings': {
      const blocked = requireLogin(context)
      return blocked || (await listExpertBookingsForUser(context.userId)).slice(0, 20)
    }
    case 'list_my_service_bookings': {
      const blocked = requireLogin(context)
      return blocked || (await listServiceBookingsForUser(context.userId)).slice(0, 20)
    }
    case 'list_my_vouchers': {
      const blocked = requireLogin(context)
      return blocked || (await listUserVouchers(context.userId, { onlyUnused: args.onlyUnused === true })).slice(0, 30)
    }
    case 'list_voucher_catalog':
      return listVoucherCatalog()
    case 'list_my_scan_history': {
      const blocked = requireLogin(context)
      if (blocked) return blocked
      return (await listScanHistory(context.userId)).slice(0, Math.min(Math.max(Number(args.limit) || 10, 1), 30))
    }
    case 'book_expert_appointment': {
      const blocked = requireLogin(context) || requireConfirmation(args, `Đặt lịch chuyên gia ${args.expertId} lúc ${args.slot}`, context)
      if (blocked) return blocked
      const booking = await createBooking(context.userId, args.expertId, args.slot)
      if (!booking) return { error: 'Chuyên gia hoặc khung giờ không còn khả dụng.' }
      await createThreadForBooking(booking.id, context.userId)
      return { success: true, booking, navigateTo: `/my-bookings/${booking.id}/chat` }
    }
    case 'propose_expert_appointment': {
      const blocked = requireLogin(context) || requireConfirmation(args, `Gửi đề xuất ${args.date} ${args.time}`, context)
      if (blocked) return blocked
      return { success: true, proposal: await createProposal(context.userId, args.expertId, args) }
    }
    case 'book_skin_service': {
      const blocked = requireLogin(context) || requireConfirmation(args, `Đặt dịch vụ ${args.serviceId} lúc ${args.scheduledAt}`, context)
      if (blocked) return blocked
      const booking = await bookService(context.userId, args.serviceId, args)
      return booking ? { success: true, booking } : { error: 'Dịch vụ không tồn tại hoặc không còn khả dụng.' }
    }
    case 'update_my_skin_profile': {
      const blocked = requireLogin(context) || requireConfirmation(args, 'Cập nhật hồ sơ da', context)
      if (blocked) return blocked
      const current = await getProfile(context.userId)
      const allowed = ['skinType', 'allergies', 'conditions', 'goals', 'skinTypeNote', 'allergiesNote', 'conditionsNote', 'goalsNote']
      const updates = Object.fromEntries(allowed.filter((key) => args[key] !== undefined).map((key) => [key, args[key]]))
      return { success: true, profile: await saveProfile(context.userId, { ...current, ...updates }) }
    }
    case 'redeem_voucher': {
      const blocked = requireLogin(context) || requireConfirmation(args, `Đổi điểm lấy voucher ${args.voucherId}`, context)
      if (blocked) return blocked
      return { success: true, voucher: await redeemVoucherWithPoints(context.userId, args.voucherId) }
    }
    case 'purchase_assistant_plan': {
      const plan = CHAT_PLANS.find((item) => item.id === args.planId)
      if (!plan) return { error: 'Gói Trợ Lý không hợp lệ.' }
      const blocked = requireLogin(context) || requireConfirmation(args, `Mua ${plan.name} giá ${plan.priceVnd}đ`, context)
      if (blocked) return blocked
      return { success: true, wallet: await purchasePlan(context.userId, args.planId), plan }
    }
    case 'top_up_wallet': {
      const amount = Math.floor(Number(args.amountVnd))
      if (!Number.isFinite(amount) || amount <= 0) return { error: 'Số tiền nạp không hợp lệ.' }
      const blocked = requireLogin(context) || requireConfirmation(args, `Nạp ${amount}đ vào ví`, context)
      if (blocked) return blocked
      return { success: true, wallet: await topupWallet(context.userId, amount) }
    }
    case 'open_app_page':
      return APP_PAGES[args.page] || { error: 'Trang không hợp lệ.' }
    default:
      return { error: 'Tool không được hỗ trợ.' }
  }
}
