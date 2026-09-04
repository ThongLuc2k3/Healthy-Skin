// Trích xuất nguyên văn nội dung điều khoản từ 2 file .docx sang các file dữ liệu
// tĩnh trong src/data — chạy 1 lần (node scripts/extract-legal-content.mjs), không
// gõ tay lại nội dung để tránh sai lệch so với bản gốc.
import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')

const FULL_DOCX = resolve(ROOT, 'HELTHY SKIN.docx')
const SUMMARY_DOCX = resolve(ROOT, 'ĐIỀU KHOẢN SỬ DỤNG TÓM TẮT.docx')

function readDocumentXml(docxPath) {
  return execFileSync('unzip', ['-p', docxPath, 'word/document.xml'], {
    maxBuffer: 1024 * 1024 * 50,
  }).toString('utf-8')
}

function decodeXmlEntities(str) {
  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
}

// Chỉ lấy các <w:p> là con trực tiếp của <w:body> (ngang hàng, không lồng
// trong text box/drawing của trang bìa) — tương đương body.findall('w:p') của
// python-docx/ElementTree. Nếu quét mù toàn bộ <w:p> bằng regex không theo dõi
// độ sâu, các đoạn văn bên trong text box trang bìa (w:drawing/w:txbxContent)
// sẽ bị trộn lẫn sai vị trí vào luồng nội dung chính.
function extractTopLevelParagraphXml(xml) {
  const bodyMatch = xml.match(/<w:body>([\s\S]*)<\/w:body>/)
  const body = bodyMatch ? bodyMatch[1] : xml
  const tokenRegex = /<w:p(?=[ >])|<\/w:p>/g
  const spans = []
  let depth = 0
  let start = -1
  let match
  while ((match = tokenRegex.exec(body))) {
    if (match[0] === '</w:p>') {
      depth--
      if (depth === 0 && start !== -1) {
        spans.push(body.slice(start, tokenRegex.lastIndex))
        start = -1
      }
    } else {
      if (depth === 0) start = match.index
      depth++
    }
  }
  return spans
}

// Trả về mảng { text, isListItem } cho từng đoạn thân tài liệu trong document.xml.
function extractParagraphs(xml) {
  const paragraphs = []
  for (const pXml of extractTopLevelParagraphXml(xml)) {
    // Bỏ nội dung text box lồng bên trong đoạn (vd. hộp tiêu đề trang bìa) —
    // không thuộc luồng đọc chính, tránh lẫn lộn thứ tự câu chữ.
    const withoutTextboxes = pXml.replace(/<w:txbxContent>[\s\S]*?<\/w:txbxContent>/g, '')
    const isListItem = /<w:numPr[ >/]/.test(pXml)
    const texts = []
    const tRegex = /<w:t[^>]*>([\s\S]*?)<\/w:t>/g
    let tMatch
    while ((tMatch = tRegex.exec(withoutTextboxes))) {
      texts.push(decodeXmlEntities(tMatch[1]))
    }
    const text = texts.join('').trim()
    paragraphs.push({ text, isListItem })
  }
  return paragraphs
}

// Gom các đoạn văn thành block: chapter / article / list / paragraph.
// Phân loại chỉ dựa trên cấu trúc (numPr = list item, tiền tố "CHƯƠNG "/"Điều n."
// = heading) — không diễn giải hay đổi câu chữ.
function toBlocks(paragraphs) {
  const blocks = []
  let currentList = null

  function flushList() {
    if (currentList) {
      blocks.push(currentList)
      currentList = null
    }
  }

  for (const { text, isListItem } of paragraphs) {
    if (!text) {
      flushList()
      continue
    }
    if (isListItem) {
      if (!currentList) currentList = { type: 'list', items: [] }
      currentList.items.push(text)
      continue
    }
    flushList()
    if (/^CHƯƠNG\s/.test(text)) {
      blocks.push({ type: 'chapter', text })
    } else if (/^Điều\s+\d+\./.test(text)) {
      blocks.push({ type: 'article', text })
    } else {
      blocks.push({ type: 'paragraph', text })
    }
  }
  flushList()
  return blocks
}

function writeDataModule(varName, data, outPath, description) {
  const header = `// Nội dung trích xuất nguyên văn bởi scripts/extract-legal-content.mjs\n// từ ${description} — KHÔNG chỉnh sửa tay, chạy lại script nếu tài liệu gốc thay đổi.\n`
  const body = `${header}const ${varName} = ${JSON.stringify(data, null, 2)}\n\nexport default ${varName}\n`
  writeFileSync(outPath, body, 'utf-8')
  const count = Array.isArray(data) ? data.length : Object.keys(data).length
  console.log(`Đã ghi ${outPath} (${count} block/nhóm).`)
}

function main() {
  const fullXml = readDocumentXml(FULL_DOCX)
  const summaryXml = readDocumentXml(SUMMARY_DOCX)

  const fullParagraphs = extractParagraphs(fullXml)
  const summaryParagraphs = extractParagraphs(summaryXml)

  const fullBlocks = toBlocks(fullParagraphs)
  const summaryBlocks = toBlocks(summaryParagraphs)

  writeDataModule(
    'termsFull',
    fullBlocks,
    resolve(ROOT, 'src/data/termsFull.js'),
    "HELTHY SKIN.docx (Quy chế hoạt động và Điều khoản sử dụng)",
  )
  writeDataModule(
    'termsSummary',
    summaryBlocks,
    resolve(ROOT, 'src/data/termsSummary.js'),
    'ĐIỀU KHOẢN SỬ DỤNG TÓM TẮT.docx',
  )

  // Trích riêng đoạn "LỜI MỞ ĐẦU" (trước "CƠ SỞ PHÁP LÝ") và Điều 84 (thông tin liên
  // hệ) từ chính bản đầy đủ để dùng cho trang "Về chúng tôi" — vẫn nguyên văn, chỉ
  // chọn lọc theo cấu trúc có sẵn (không viết lại câu chữ).
  const introStart = fullBlocks.findIndex((b) => b.text === 'LỜI MỞ ĐẦU')
  const introEnd = fullBlocks.findIndex((b) => b.text === 'CƠ SỞ PHÁP LÝ')
  const introBlocks = fullBlocks.slice(introStart + 1, introEnd)

  const contactIndex = fullBlocks.findIndex((b) => b.type === 'article' && /^Điều 84\./.test(b.text))
  const nextArticleIndex = fullBlocks.findIndex(
    (b, i) => i > contactIndex && (b.type === 'article' || b.type === 'chapter'),
  )
  const contactBlocks = fullBlocks.slice(contactIndex, nextArticleIndex)

  writeDataModule(
    'aboutContent',
    { intro: introBlocks, contact: contactBlocks },
    resolve(ROOT, 'src/data/aboutContent.js'),
    'HELTHY SKIN.docx (phần LỜI MỞ ĐẦU và Điều 84 — Thông tin liên hệ)',
  )
}

main()
