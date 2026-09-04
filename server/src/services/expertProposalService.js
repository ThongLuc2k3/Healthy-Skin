import { query } from '../db/connection.js'
import { getExpertById } from './expertService.js'
import { recordExpertBookingSettlement } from './settlementService.js'

function toShape(row) {
  if (!row) return null
  return {
    id: row.id,
    userId: row.user_id,
    expertId: row.expert_id,
    proposedDate: row.proposed_date,
    proposedTime: row.proposed_time,
    proposedFeeVnd: row.proposed_fee_vnd,
    noteVi: row.note_vi,
    status: row.status,
    expertNote: row.expert_note,
    bookingId: row.booking_id,
    createdAt: row.created_at,
    respondedAt: row.responded_at,
  }
}

export async function createProposal(userId, expertId, { date, time, feeVnd, note }) {
  const expert = await getExpertById(expertId)
  if (!expert) return null
  const fee = Number(feeVnd)
  if (!date || !String(time || '').trim() || !Number.isFinite(fee) || fee <= 0) return null

  const { rows } = await query(
    `INSERT INTO expert_booking_proposals (user_id,expert_id,proposed_date,proposed_time,proposed_fee_vnd,note_vi)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [userId, expertId, date, String(time).trim().slice(0, 50), Math.round(fee), String(note || '').trim().slice(0, 500)],
  )
  return toShape(rows[0])
}

export async function listProposalsForUserAndExpert(userId, expertId) {
  const { rows } = await query(
    'SELECT * FROM expert_booking_proposals WHERE user_id=$1 AND expert_id=$2 ORDER BY created_at DESC',
    [userId, expertId],
  )
  return rows.map(toShape)
}

export async function getProposalRawById(id) {
  const { rows } = await query('SELECT * FROM expert_booking_proposals WHERE id=$1', [id])
  return rows[0]
}

export async function listProposalsForExpert(expertId) {
  const { rows } = await query(
    "SELECT * FROM expert_booking_proposals WHERE expert_id=$1 AND status='pending' ORDER BY created_at ASC",
    [expertId],
  )
  return rows.map(toShape)
}

export async function respondToProposal(expertId, proposalId, accept, expertNote) {
  const proposal = await getProposalRawById(proposalId)
  if (!proposal || proposal.expert_id !== expertId || proposal.status !== 'pending') return null
  const { rows } = await query(
    `UPDATE expert_booking_proposals SET status=$1, expert_note=$2, responded_at=NOW()
     WHERE id=$3 RETURNING *`,
    [accept ? 'accepted' : 'rejected', String(expertNote || '').trim().slice(0, 500) || null, proposalId],
  )
  return toShape(rows[0])
}

// Khách xác nhận lại sau khi chuyên gia đã nhận đề xuất — mới thật sự tạo expert_bookings, đúng mức
// phí khách đã đề xuất (không phải giá niêm yết của chuyên gia). Trả về { proposal, bookingId } để
// route gọi tiếp createThreadForBooking giống hệt luồng đặt lịch chuẩn.
export async function confirmProposal(userId, proposalId) {
  const proposal = await getProposalRawById(proposalId)
  if (!proposal || Number(proposal.user_id) !== Number(userId) || proposal.status !== 'accepted') return null

  const slot = `${proposal.proposed_date instanceof Date
    ? proposal.proposed_date.toISOString().slice(0, 10)
    : proposal.proposed_date} · ${proposal.proposed_time}`

  const { rows: bookingRows } = await query(
    `INSERT INTO expert_bookings (user_id,expert_id,slot,status,consultation_fee_vnd)
     VALUES ($1,$2,$3,'booked',$4) RETURNING *`,
    [userId, proposal.expert_id, slot, proposal.proposed_fee_vnd],
  )
  const booking = bookingRows[0]

  if (proposal.proposed_fee_vnd > 0) {
    await recordExpertBookingSettlement(booking.id, proposal.proposed_fee_vnd).catch((err) => {
      console.error('[settlement] Không ghi được sổ đối soát cho đề xuất lịch hẹn:', err)
    })
  }

  const { rows } = await query(
    `UPDATE expert_booking_proposals SET status='confirmed', booking_id=$1 WHERE id=$2 RETURNING *`,
    [booking.id, proposalId],
  )
  return { proposal: toShape(rows[0]), bookingId: booking.id }
}
