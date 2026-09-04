import test from 'node:test'
import assert from 'node:assert/strict'
import { getAppointmentFallbackReply } from '../src/services/appointmentFallbackService.js'

test('câu không đặt lịch không bị fallback bắt', async () => {
  assert.equal(await getAppointmentFallbackReply([{ role: 'user', text: 'retinol là gì?' }]), null)
})
