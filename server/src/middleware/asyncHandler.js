// Express 4 không tự bắt lỗi ném ra trong route handler async — bọc lại để lỗi
// luôn được chuyển tới errorHandler thay vì làm request treo vô thời hạn.
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next)
  }
}
