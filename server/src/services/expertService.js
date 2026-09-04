import { query } from '../db/connection.js'

function parsed(value) {
  return typeof value === 'string' ? JSON.parse(value) : value
}

function toShape(row) {
  if (!row) return null
  return {
    id: row.id, name: row.name, specialty: row.specialty, clinic_name: row.clinic_name,
    area_vi: row.area_vi, bio_vi: row.bio_vi, certifications: parsed(row.certifications),
    rating_avg: row.rating_avg, reviews: parsed(row.reviews), available_slots: parsed(row.available_slots),
    consultation_fee_vnd: row.consultation_fee_vnd || 0,
  }
}

export async function listExperts(area) {
  const { rows } = await query(
    `SELECT * FROM experts ${area ? 'WHERE area_vi = $1' : ''}`,
    area ? [area] : [],
  )
  return rows.map(toShape)
}

export async function listAreas() {
  const { rows } = await query('SELECT DISTINCT area_vi FROM experts ORDER BY area_vi')
  return rows.map((row) => row.area_vi)
}

export async function getExpertById(id) {
  const { rows } = await query('SELECT * FROM experts WHERE id = $1', [id])
  return toShape(rows[0])
}
