import assert from 'node:assert'
import { computeDiscountedPrice } from './voucherPricing.js'

// Không giảm giá khi không có voucher
assert.strictEqual(computeDiscountedPrice(200000, null), 200000)

// Giảm theo phần trăm, làm tròn
assert.strictEqual(
  computeDiscountedPrice(199000, { discount_type: 'percent', discount_value: 10 }),
  Math.round(199000 * 0.9),
)

// Giảm theo số tiền cố định, không âm
assert.strictEqual(
  computeDiscountedPrice(50000, { discount_type: 'fixed', discount_value: 80000 }),
  0,
)
assert.strictEqual(
  computeDiscountedPrice(200000, { discount_type: 'fixed', discount_value: 50000 }),
  150000,
)

console.log('Tất cả test voucherPricing PASS')
