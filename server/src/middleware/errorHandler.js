export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Không tìm thấy đường dẫn API này.' })
}

export function errorHandler(err, req, res, _next) {
  console.error(err)
  const status = err.status || 500
  const message = err.publicMessage || 'Đã có lỗi xảy ra phía máy chủ, vui lòng thử lại sau.'
  res.status(status).json({ error: message })
}
