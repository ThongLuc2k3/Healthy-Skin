import { useEffect, useState } from 'react'
import { fetchAuthedBlobUrl } from '../lib/apiClient'

function AuthedImage({ src, alt, className }) {
  const [blobUrl, setBlobUrl] = useState(null)

  useEffect(() => {
    let objectUrl = null
    let cancelled = false

    fetchAuthedBlobUrl(src).then((url) => {
      if (cancelled) {
        URL.revokeObjectURL(url)
        return
      }
      objectUrl = url
      setBlobUrl(url)
    })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (!blobUrl) {
    return <div className={`animate-pulse bg-slate-100 ${className || ''}`} />
  }

  return <img src={blobUrl} alt={alt} className={className} />
}

export default AuthedImage
