import { v2 as cloudinary } from 'cloudinary'
import config from '../config/env.js'

cloudinary.config({
  cloud_name: config.cloudinaryCloudName,
  api_key: config.cloudinaryApiKey,
  api_secret: config.cloudinaryApiSecret,
})

const MIME_TO_RESOURCE = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/webp': 'image',
  'image/gif': 'image',
  'application/pdf': 'raw',
}

function resolveResourceType(mimeType) {
  if (MIME_TO_RESOURCE[mimeType]) return MIME_TO_RESOURCE[mimeType]
  // Video tự tải lên ở Góc truyền động lực có nhiều định dạng (mp4/webm/mov...) — nhận diện theo
  // tiền tố mime thay vì liệt kê từng loại, Cloudinary bắt buộc đúng resource_type='video' mới xử lý
  // đúng (upload nhầm resource_type='image' cho video sẽ lỗi hoặc lưu sai).
  if (mimeType?.startsWith('video/')) return 'video'
  return 'image'
}

export async function uploadBuffer(buffer, mimeType, { folder = 'da-duong' } = {}) {
  const resourceType = resolveResourceType(mimeType)

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(new Error(`Cloudinary upload failed: ${error.message}`))
        else resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )
    uploadStream.end(buffer)
  })
}

// resourceType phải khớp đúng loại lúc upload (mặc định 'image') — Cloudinary lập chỉ mục publicId
// riêng theo từng resource_type, gọi destroy() với resourceType sai sẽ "thành công" nhưng không xoá
// được gì (video tải lên ở Góc truyền động lực phải truyền resourceType='video').
export async function deleteFile(publicId, resourceType = 'image') {
  if (!publicId) return
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType })
  } catch {
    // silent fail — xoá file không quan trọng nếu Cloudinary lỗi
  }
}

export function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null
  const parts = url.split('/')
  const versionIndex = parts.findIndex((p) => p.startsWith('v') && /^\d+$/.test(p.slice(1)))
  if (versionIndex === -1) return null
  return parts.slice(versionIndex + 1).join('/').replace(/\.[^/.]+$/, '')
}
