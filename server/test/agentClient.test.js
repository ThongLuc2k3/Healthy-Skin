import test from 'node:test'
import assert from 'node:assert/strict'
import { toGroqTools } from '../src/services/agentClient.js'

test('schema Gemini được đổi sang Groq mà không làm hỏng thuộc tính tên type', () => {
  const [tool] = toGroqTools([{ name: 'open_dispute', description: 'Test', parameters: { type: 'OBJECT', properties: { type: { type: 'STRING' }, items: { type: 'ARRAY', items: { type: 'INTEGER' } } } } }])
  assert.equal(tool.function.parameters.type, 'object')
  assert.equal(tool.function.parameters.properties.type.type, 'string')
  assert.equal(tool.function.parameters.properties.items.items.type, 'integer')
})
