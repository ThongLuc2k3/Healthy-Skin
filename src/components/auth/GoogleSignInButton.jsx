import { useEffect, useRef, useState } from 'react'

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

export default function GoogleSignInButton({ acceptedTerms = false, onSuccess, onError, disabled = false }) {
  const targetRef = useRef(null)
  const handlersRef = useRef({ acceptedTerms, onSuccess, onError })
  const [ready, setReady] = useState(false)
  handlersRef.current = { acceptedTerms, onSuccess, onError }

  useEffect(() => {
    if (!clientId) return undefined
    let cancelled = false
    let resizeFrame
    function render() {
      if (cancelled || !window.google || !targetRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => credential
          ? handlersRef.current.onSuccess?.(credential, handlersRef.current.acceptedTerms)
          : handlersRef.current.onError?.('Google không trả về thông tin đăng nhập.'),
        cancel_on_tap_outside: true,
        use_fedcm_for_prompt: true,
      })
      targetRef.current.replaceChildren()
      window.google.accounts.id.renderButton(targetRef.current, {
        theme: 'outline', size: 'large', shape: 'rectangular', text: 'continue_with',
        width: Math.min(targetRef.current.clientWidth || 320, 360), locale: 'vi',
      })
      setReady(true)
    }
    function handleResize() {
      cancelAnimationFrame(resizeFrame)
      resizeFrame = requestAnimationFrame(render)
    }
    if (window.google) render()
    else {
      let script = document.querySelector('script[data-healthy-skin-google]')
      if (!script) {
        script = document.createElement('script')
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.dataset.healthySkinGoogle = 'true'
        document.head.appendChild(script)
      }
      script.addEventListener('load', render, { once: true })
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelled = true
      cancelAnimationFrame(resizeFrame)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  if (!clientId) return <p className="rounded-xl bg-amber-50 p-2.5 text-center text-xs font-semibold text-amber-700">Chưa cấu hình Google Client ID.</p>
  return <div className={`relative flex min-h-11 w-full min-w-0 justify-center overflow-hidden ${disabled || !ready ? 'pointer-events-none opacity-60' : ''}`}><div ref={targetRef} className="flex w-full min-w-0 justify-center" /></div>
}
