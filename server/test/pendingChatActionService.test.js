import test from 'node:test'
import assert from 'node:assert/strict'
import { isNaturalConfirmation, signPendingChatAction, verifyPendingChatAction } from '../src/services/pendingChatActionService.js'

test('pending action có chữ ký, hết quyền khi bị sửa và chỉ thuộc đúng người dùng', () => {
  const token = signPendingChatAction({ name: 'top_up_wallet', args: { amountVnd: 10000 }, summary: 'Nạp 10000đ vào ví' }, 7)
  const payload = verifyPendingChatAction(token, 7)
  assert.equal(payload.name, 'top_up_wallet')
  assert.equal(payload.args.amountVnd, 10000)
  assert.equal(verifyPendingChatAction(token, 8), null)
  assert.equal(verifyPendingChatAction(`${token}x`, 7), null)
})

test('nhận diện xác nhận tự nhiên chỉ dùng kèm pending action đã ký', () => {
  assert.equal(isNaturalConfirmation('đúm òi nà'), true)
  assert.equal(isNaturalConfirmation('đúng rồi'), true)
  assert.equal(isNaturalConfirmation('ừ nha'), true)
  assert.equal(isNaturalConfirmation('tôi muốn nạp thêm tiền'), false)
})
