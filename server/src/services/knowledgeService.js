import { readdir, readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const knowledgeDir = resolve(here, '../../../knowledge')
const expansionsPath = resolve(knowledgeDir, 'query-expansions.json')
export const MIN_KNOWLEDGE_CONFIDENCE = 0.85
let cachedChunks
let cachedExpansions

function normalize(value) {
  return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/đ/g, 'd')
}

function tokens(value) {
  const stopWords = new Set(['va', 'hay', 'cho', 'cua', 'voi', 'the', 'nao', 'toi', 'minh', 'ban', 'sau', 'khi', 'dung', 'cach', 'la', 'dang', 'lam', 'gi', 'bao', 'nhieu', 'co', 'khong', 'duoc', 've'])
  return [...new Set((normalize(value).match(/[a-z0-9]{2,}/g) || []).filter((token) => !stopWords.has(token)))]
}

function parseFrontmatter(text) {
  if (!text.startsWith('---\n')) return { metadata: {}, body: text }
  const end = text.indexOf('\n---\n', 4)
  if (end < 0) return { metadata: {}, body: text }
  const metadata = {}
  for (const line of text.slice(4, end).split('\n')) {
    const separator = line.indexOf(':')
    if (separator < 0) continue
    const key = line.slice(0, separator).trim()
    const raw = line.slice(separator + 1).trim()
    metadata[key] = raw.startsWith('[') ? raw.slice(1, -1).split(',').map((item) => item.trim()).filter(Boolean) : raw
  }
  return { metadata, body: text.slice(end + 5) }
}

function chunkMarkdown(text, source) {
  const { metadata, body } = parseFrontmatter(text)
  const chunks = []
  const hierarchy = []
  let current = null
  const flush = () => {
    if (!current) return
    const content = current.lines.join('\n').trim()
    if (content) chunks.push({
      id: `${source}#${chunks.length + 1}`, source, title: current.title,
      hierarchy: current.hierarchy, level: current.level,
      domain: metadata.domain || 'general', riskLevel: metadata.risk_level || 'low',
      authority: metadata.authority || 'internal_reviewed', reviewedAt: metadata.reviewed_at || null,
      tags: Array.isArray(metadata.tags) ? metadata.tags : [], content: content.slice(0, 2200),
    })
  }
  for (const line of body.split('\n')) {
    const heading = line.match(/^(#{1,3})\s+(.+)/)
    if (!heading) { if (current) current.lines.push(line); continue }
    flush()
    const level = heading[1].length
    hierarchy[level - 1] = heading[2].trim()
    hierarchy.length = level
    current = { title: heading[2].trim(), level, hierarchy: [...hierarchy], lines: [line] }
  }
  flush()
  return chunks
}

async function loadExpansions() {
  if (!cachedExpansions) cachedExpansions = JSON.parse(await readFile(expansionsPath, 'utf8'))
  return cachedExpansions
}

async function loadChunks() {
  if (cachedChunks) return cachedChunks
  const files = (await readdir(knowledgeDir)).filter((file) => file.endsWith('.md') && file !== 'README.md')
  cachedChunks = (await Promise.all(files.map(async (source) =>
    chunkMarkdown(await readFile(resolve(knowledgeDir, source), 'utf8'), source)))).flat()
  return cachedChunks
}

function expandQuery(query, groups) {
  const normalized = normalize(query)
  const expanded = new Set(tokens(query))
  for (const group of groups) {
    if (group.terms.some((term) => normalized.includes(normalize(term)))) {
      for (const term of group.terms) tokens(term).forEach((token) => expanded.add(token))
    }
  }
  return [...expanded]
}

function tokenSet(value) {
  return new Set(tokens(value))
}

export async function searchKnowledge(query, limit = 4) {
  const [chunks, expansionData] = await Promise.all([loadChunks(), loadExpansions()])
  const originalQueryTokens = tokens(query)
  const queryTokens = expandQuery(query, expansionData.groups || [])
  if (!queryTokens.length) return []
  const normalizedQuery = normalize(query)
  const activeGroups = (expansionData.groups || []).filter((group) =>
    group.terms.some((term) => normalizedQuery.includes(normalize(term))))
  const urgent = (expansionData.urgent_terms || []).some((term) => normalizedQuery.includes(normalize(term)))
  return chunks.map((chunk) => {
    const title = normalize(chunk.title)
    const body = normalize(chunk.content)
    const titleTokens = tokenSet(chunk.title)
    const bodyTokens = tokenSet(chunk.content)
    const tagTokens = tokenSet(chunk.tags.join(' '))
    const hierarchyTokens = tokenSet(chunk.hierarchy.join(' '))
    const lexicalScore = queryTokens.reduce((sum, token) => sum
      + (titleTokens.has(token) ? 5 : 0) + (tagTokens.has(token) ? 4 : 0)
      + (hierarchyTokens.has(token) ? 2 : 0) + (bodyTokens.has(token) ? 1 : 0), 0)
    const directMatchBoost = originalQueryTokens.reduce((sum, token) => sum
      + (titleTokens.has(token) ? 8 : 0) + (tagTokens.has(token) ? 6 : 0)
      + (hierarchyTokens.has(token) ? 3 : 0) + (bodyTokens.has(token) ? 2 : 0), 0)
    const urgentHits = urgent ? (expansionData.urgent_terms || [])
      .filter((term) => body.includes(normalize(term)) || title.includes(normalize(term))).length : 0
    const safetyBoost = urgent && chunk.riskLevel === 'urgent' ? 25 + urgentHits * 15 : 0
    const searchableTokens = new Set([...titleTokens, ...tagTokens, ...hierarchyTokens, ...bodyTokens])
    const directMatches = originalQueryTokens.filter((token) => searchableTokens.has(token)).length
    const directCoverage = originalQueryTokens.length ? directMatches / originalQueryTokens.length : 0
    const intentAligned = activeGroups.some((group) => tokens(group.terms.join(' ')).some((token) => searchableTokens.has(token)))
    const titleHasDirectTerm = originalQueryTokens.some((token) => titleTokens.has(token))
    const confidence = urgent && chunk.riskLevel === 'urgent'
      ? 1
      : Math.min(1, directCoverage * 0.65 + (intentAligned ? 0.25 : 0) + (titleHasDirectTerm ? 0.1 : 0))
    return { ...chunk, score: lexicalScore + directMatchBoost + safetyBoost, confidence: Number(confidence.toFixed(3)), retrievalMode: 'hybrid_json_keyword' }
  }).filter((chunk) => chunk.score > 0 && chunk.confidence >= MIN_KNOWLEDGE_CONFIDENCE).sort((a, b) => b.score - a.score)
    .slice(0, Math.min(Math.max(limit, 1), 8))
}

export async function getKnowledgeStats() {
  const chunks = await loadChunks()
  return {
    documents: new Set(chunks.map((chunk) => chunk.source)).size, chunks: chunks.length,
    domains: [...new Set(chunks.map((chunk) => chunk.domain))].sort(),
    riskLevels: Object.fromEntries(['low', 'medium', 'high', 'urgent'].map((risk) => [risk, chunks.filter((chunk) => chunk.riskLevel === risk).length])),
  }
}
