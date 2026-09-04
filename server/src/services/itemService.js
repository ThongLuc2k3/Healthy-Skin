import { query } from '../db/connection.js'

function parseJson(value) {
  return typeof value === 'string' ? JSON.parse(value) : value
}

function parseSkincareRow(row) {
  return {
    id: row.id, name_vi: row.name_vi, category: row.category,
    flags: parseJson(row.flags), conflicts_with_skin_type: parseJson(row.conflicts_with_skin_type),
    explanation_vi: row.explanation_vi, source: row.source,
  }
}

function parseFoodRow(row) {
  return {
    id: row.id, name_vi: row.name_vi, category: row.category,
    flags: parseJson(row.flags), conflicts_with_allergy: parseJson(row.conflicts_with_allergy),
    conflicts_with_condition: parseJson(row.conflicts_with_condition),
    explanation_vi: row.explanation_vi, source: row.source,
  }
}

export async function listSkincareItems() {
  const { rows } = await query('SELECT * FROM skincare_ingredients')
  return rows.map(parseSkincareRow)
}

export async function listFoodItems() {
  const { rows } = await query('SELECT * FROM food_items')
  return rows.map(parseFoodRow)
}

export async function listAllItems() {
  const [skincare, food] = await Promise.all([listSkincareItems(), listFoodItems()])
  return [...skincare, ...food]
}
