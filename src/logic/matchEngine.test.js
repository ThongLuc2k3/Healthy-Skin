import assert from 'node:assert'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { matchProfile, getRecommendations } from './matchEngine.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const skincare = JSON.parse(
  readFileSync(join(__dirname, '../data/skincare_ingredients.json'), 'utf-8'),
)
const food = JSON.parse(readFileSync(join(__dirname, '../data/food_items.json'), 'utf-8'))

const find = (db, id) => db.find((i) => i.id === id)

// Hồ sơ 1: da dầu, dị ứng hải sản, tiểu đường
const profile1 = { skinType: 'da_dau', allergies: ['hai_san'], conditions: ['tieu_duong'], goals: [] }

assert.strictEqual(matchProfile(profile1, find(skincare, 'coconut_oil')).result, 'cần cân nhắc')
assert.strictEqual(matchProfile(profile1, find(skincare, 'niacinamide')).result, 'phù hợp')
assert.strictEqual(matchProfile(profile1, find(food, 'tom')).result, 'cần cân nhắc')
assert.strictEqual(matchProfile(profile1, find(food, 'nuoc_ngot_co_gas')).result, 'cần cân nhắc')

// Hồ sơ 2: da khô, không dị ứng, không bệnh nền
const profile2 = { skinType: 'da_kho', allergies: [], conditions: [], goals: [] }

assert.strictEqual(matchProfile(profile2, find(skincare, 'coconut_oil')).result, 'phù hợp')
assert.strictEqual(matchProfile(profile2, find(skincare, 'retinol')).result, 'cần cân nhắc')
assert.strictEqual(matchProfile(profile2, find(food, 'ca_phe')).result, 'cần cân nhắc')

// Hồ sơ 3: da nhạy cảm, dị ứng đậu phộng + sữa, gout
const profile3 = {
  skinType: 'da_nhay_cam',
  allergies: ['dau_phong', 'sua'],
  conditions: ['gut'],
  goals: [],
}

assert.strictEqual(matchProfile(profile3, find(skincare, 'fragrance_parfum')).result, 'cần cân nhắc')
assert.strictEqual(matchProfile(profile3, find(food, 'thit_bo')).result, 'cần cân nhắc')

const rec = getRecommendations(profile3, [...skincare, ...food])
assert.ok(rec['phù hợp'].length > 0, 'Phải có ít nhất 1 mục phù hợp')
assert.ok(rec['cần cân nhắc'].length > 0, 'Phải có ít nhất 1 mục cần cân nhắc')

console.log('Tất cả test matchEngine PASS')
console.log('Hồ sơ 3, Phù hợp:', rec['phù hợp'].length, '| Cần cân nhắc:', rec['cần cân nhắc'].length)
