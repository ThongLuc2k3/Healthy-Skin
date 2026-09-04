#!/usr/bin/env node
// Chạy: node server/src/qa/runQa.js [--rule-only]
//
// Khung QA cho AI — đúng quy trình 5 bước mục 5.2 của Healthy_Skin_Ke_Hoach_Phat_Trien_Chi_Tiet.pdf:
// (1) khoá cấu hình, (2) chạy lặp, (3) so tham chiếu, (4) ghi log, (5) duyệt (con người, không tự
// động). Phần rule-based xác định 100% nên auto-fail (exit code != 0) nếu sai; phần Gemini không xác
// định nên chỉ cảnh báo, để "người phụ trách QA quyết định pass/fail" như tài liệu đã nêu.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { matchProfile } from '../../../src/logic/matchEngine.js'
import { RULE_TEST_CASES, GEMINI_TEST_CASES } from './testCases.js'
import config from '../config/env.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../../../src/data')
const FIXTURES_DIR = path.resolve(__dirname, 'fixtures')
const REPORTS_DIR = path.resolve(__dirname, 'reports')

const GEMINI_RUNS_PER_CASE = 3
const RISKY_PHRASES = ['chắc chắn', 'chẩn đoán', 'kê đơn', 'bạn bị bệnh', 'điều trị dứt điểm']
const LONG_REASON_THRESHOLD = 400

const ruleOnly = process.argv.includes('--rule-only')

function loadDatabase() {
  const skincare = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'skincare_ingredients.json'), 'utf-8'))
  const food = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'food_items.json'), 'utf-8'))
  return { skincare, food }
}

function runRuleCases() {
  const { skincare, food } = loadDatabase()
  const db = { skincare, food }
  const results = []

  for (const testCase of RULE_TEST_CASES) {
    const item = db[testCase.category]?.find((i) => i.id === testCase.itemId)
    if (!item) {
      results.push({ id: testCase.id, pass: false, error: `Không tìm thấy item "${testCase.itemId}" trong ${testCase.category}` })
      continue
    }

    const { result, reason } = matchProfile(testCase.profile, item)
    let pass = result === testCase.expectedResult
    const problems = []
    if (!pass) problems.push(`kỳ vọng "${testCase.expectedResult}" nhưng nhận "${result}"`)

    if (pass && testCase.expectedReasonPrefix && !reason.startsWith(testCase.expectedReasonPrefix)) {
      pass = false
      problems.push(`reason không đúng nhánh mong đợi (thiếu tiền tố "${testCase.expectedReasonPrefix}")`)
    }

    results.push({ id: testCase.id, pass, result, reason, riskLevel: testCase.riskLevel, problems })
  }

  return results
}

async function runGeminiCases() {
  if (!config.geminiApiKey) {
    return { skipped: true, reason: 'Thiếu GEMINI_API_KEY trong server/.env — bỏ qua toàn bộ ca Gemini.' }
  }

  const { analyzeImage } = await import('../services/geminiService.js')
  const results = []

  for (const testCase of GEMINI_TEST_CASES) {
    const fixturePath = path.join(FIXTURES_DIR, testCase.fixtureImage)
    if (!fs.existsSync(fixturePath)) {
      results.push({
        id: testCase.id,
        skipped: true,
        reason: `Thiếu file ảnh fixtures/${testCase.fixtureImage} — xem fixtures/README.md.`,
      })
      continue
    }

    const imageBuffer = fs.readFileSync(fixturePath)
    const runs = []
    for (let i = 0; i < GEMINI_RUNS_PER_CASE; i += 1) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const parsed = await analyzeImage(imageBuffer, testCase.mimeType, testCase.profile)
        runs.push(parsed)
      } catch (err) {
        runs.push({ error: err.message })
      }
    }

    results.push({ id: testCase.id, riskLevel: testCase.riskLevel, runs, ...classifyGeminiRuns(testCase, runs) })
  }

  return { skipped: false, results }
}

// Phân loại lỗi theo đúng 5 nhóm ở mục 5.3 kế hoạch mentor. Đây là CẢNH BÁO cho người duyệt, không
// phải phán quyết pass/fail tự động — Gemini không xác định nên không thể auto-fail như rule-based.
function classifyGeminiRuns(testCase, runs) {
  const flags = []
  const validRuns = runs.filter((r) => !r.error)

  if (validRuns.length < runs.length) {
    flags.push(`${runs.length - validRuns.length}/${runs.length} lần gọi lỗi API.`)
  }
  if (validRuns.length === 0) return { flags }

  const resultSet = new Set(validRuns.map((r) => r.result))
  if (resultSet.size > 1) {
    flags.push(`Kết quả thay đổi giữa các lần chạy cùng đầu vào: ${[...resultSet].join(', ')} (thiếu nhất quán).`)
  }

  if (testCase.expectedRecognized === false) {
    const wronglyRecognized = validRuns.filter((r) => r.recognized === true)
    if (wronglyRecognized.length > 0) {
      flags.push(`${wronglyRecognized.length}/${validRuns.length} lần vẫn nhận diện dù ảnh không rõ ràng.`)
    }
  } else if (testCase.expectedResult === 'cần cân nhắc') {
    const tooPermissive = validRuns.filter((r) => r.result === 'phù hợp')
    if (tooPermissive.length > 0) {
      flags.push(`${tooPermissive.length}/${validRuns.length} lần trả "phù hợp" dù ca này cần cân nhắc `
        + '(thiên lệch về phía dễ dãi, quan trọng hơn thiên lệch ngược lại).')
    }
  }

  for (const run of validRuns) {
    const reason = run.reason || ''
    if (RISKY_PHRASES.some((phrase) => reason.includes(phrase))) {
      flags.push(`Giọng điệu như chẩn đoán/kê đơn trong reason: "${reason.slice(0, 120)}..."`)
    }
    if (reason.length > LONG_REASON_THRESHOLD) {
      flags.push(`Giải thích quá dài (${reason.length} ký tự), khó hiểu, không đúng trọng tâm.`)
    }
  }

  return { flags }
}

function printRuleSummary(results) {
  const failed = results.filter((r) => !r.pass)
  console.log(`\n=== Rule-based (${results.length} ca) ===`)
  for (const r of results) {
    console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.id}${r.problems?.length ? '  -> ' + r.problems.join('; ') : ''}`)
  }
  console.log(`Tổng: ${results.length - failed.length}/${results.length} PASS.`)
  return failed
}

function printGeminiSummary(geminiOutcome) {
  console.log('\n=== Gemini (đo tính nhất quán, cần người duyệt) ===')
  if (geminiOutcome.skipped) {
    console.log(`BỎ QUA — ${geminiOutcome.reason}`)
    return
  }
  for (const r of geminiOutcome.results) {
    if (r.skipped) {
      console.log(`BỎ QUA  ${r.id}  -> ${r.reason}`)
      continue
    }
    const status = r.flags.length === 0 ? 'OK' : 'CẦN DUYỆT'
    console.log(`${status}  ${r.id} (rủi ro: ${r.riskLevel})`)
    r.flags.forEach((f) => console.log(`    - ${f}`))
  }
}

async function main() {
  const ruleResults = runRuleCases()
  const failedRule = printRuleSummary(ruleResults)

  let geminiOutcome = { skipped: true, reason: 'Chạy với --rule-only, bỏ qua phần Gemini.' }
  if (!ruleOnly) {
    geminiOutcome = await runGeminiCases()
  }
  printGeminiSummary(geminiOutcome)

  fs.mkdirSync(REPORTS_DIR, { recursive: true })
  const reportPath = path.join(REPORTS_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}.json`)
  fs.writeFileSync(reportPath, JSON.stringify({ ruleResults, geminiOutcome }, null, 2))
  console.log(`\nBáo cáo đầy đủ: ${path.relative(process.cwd(), reportPath)}`)

  if (failedRule.length > 0) {
    console.error(`\n${failedRule.length} ca rule-based FAIL — đây là lỗi xác định, phải sửa trước khi đưa vào pilot.`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('[qa] Lỗi khi chạy khung QA:', err)
  process.exitCode = 1
})
