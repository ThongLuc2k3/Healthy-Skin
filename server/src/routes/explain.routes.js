import { Router } from 'express'
import { optionalAuth } from '../middleware/auth.js'
import { explainLimiter } from '../middleware/rateLimit.js'
import { asyncHandler } from '../middleware/asyncHandler.js'
import { explainResult } from '../services/explainService.js'
import { GeminiNotConfiguredError, GeminiRequestError } from '../services/geminiService.js'

const router = Router()

const RESULT_VALUES = ['phù hợp', 'cần cân nhắc']

router.post(
  '/',
  optionalAuth,
  explainLimiter,
  asyncHandler(async (req, res) => {
    const { nameVi, category, result, reason, profile } = req.body ?? {}

    if (typeof nameVi !== 'string' || !nameVi.trim()) {
      return res.status(400).json({ error: 'Thiếu tên sản phẩm/thực phẩm cần giải thích.' })
    }
    if (!RESULT_VALUES.includes(result)) {
      return res.status(400).json({ error: 'Dữ liệu kết quả không hợp lệ.' })
    }

    let explanation
    try {
      explanation = await explainResult({
        nameVi,
        category: category === 'food' ? 'food' : 'skincare',
        result,
        reason: typeof reason === 'string' ? reason : '',
        profile: profile ?? {},
      })
    } catch (err) {
      if (err instanceof GeminiNotConfiguredError) {
        return res.status(503).json({
          error: 'Tính năng giải thích bằng AI chưa sẵn sàng, thiếu cấu hình Gemini API key.',
        })
      }
      if (err instanceof GeminiRequestError) {
        return res.status(502).json({ error: 'Không thể tạo giải thích lúc này, vui lòng thử lại.' })
      }
      throw err
    }

    res.json({ explanation })
  }),
)

export default router
