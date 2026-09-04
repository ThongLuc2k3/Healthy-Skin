import { useEffect, useRef } from 'react'

export default function HolographicSphere() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let width = (canvas.width = canvas.parentElement.offsetWidth)
    let height = (canvas.height = canvas.parentElement.offsetHeight)

    const handleResize = () => {
      if (!canvas.parentElement) return
      width = canvas.width = canvas.parentElement.offsetWidth
      height = canvas.height = canvas.parentElement.offsetHeight
    }
    window.addEventListener('resize', handleResize)

    // Generate 3D sphere vertices
    const numPoints = 180
    const points = []
    const phi = Math.PI * (3 - Math.sqrt(5)) // golden ratio angle

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2 // -1 to 1
      const radius = Math.sqrt(1 - y * y)
      const theta = phi * i
      const x = Math.cos(theta) * radius
      const z = Math.sin(theta) * radius
      points.push({ x, y, z, originalX: x, originalY: y, originalZ: z })
    }

    // Generate connections between close points
    const connections = []
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const dx = points[i].x - points[j].x
        const dy = points[i].y - points[j].y
        const dz = points[i].z - points[j].z
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
        if (dist < 0.42) {
          connections.push([i, j])
        }
      }
    }

    let angleX = 0
    let angleY = 0
    let scanLineY = -1.2

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2
      const scale = Math.min(width, height) * 0.28

      angleX += 0.005
      angleY += 0.008
      scanLineY += 0.015
      if (scanLineY > 1.4) scanLineY = -1.4

      const cosX = Math.cos(angleX)
      const sinX = Math.sin(angleX)
      const cosY = Math.cos(angleY)
      const sinY = Math.sin(angleY)

      const projectedPoints = points.map((p) => {
        // Rotate Y
        let x1 = p.x * cosY - p.z * sinY
        let z1 = p.z * cosY + p.x * sinY
        // Rotate X
        let y1 = p.y * cosX - z1 * sinX
        let z2 = z1 * cosX + p.y * sinX

        const perspective = 400 / (400 + z2 * scale)
        const screenX = centerX + x1 * scale * perspective
        const screenY = centerY + y1 * scale * perspective

        return { x: screenX, y: screenY, z: z2, origY: p.y }
      })

      // Draw wireframe links
      ctx.lineWidth = 0.8
      for (const [i, j] of connections) {
        const p1 = projectedPoints[i]
        const p2 = projectedPoints[j]
        const alpha = Math.max(0.08, (p1.z + p2.z) / 4 + 0.35)

        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha * 0.45})`
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      }

      // Draw nodes
      for (const p of projectedPoints) {
        const alpha = Math.max(0.1, p.z / 2 + 0.5)
        const size = Math.max(1, (p.z + 1.2) * 1.5)

        ctx.fillStyle = `rgba(103, 232, 249, ${alpha * 0.8})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw scanning laser beam plane
      const beamY = centerY + scanLineY * scale * 0.7
      const grad = ctx.createLinearGradient(0, beamY - 12, 0, beamY + 12)
      grad.addColorStop(0, 'rgba(34, 211, 238, 0)')
      grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.45)')
      grad.addColorStop(1, 'rgba(34, 211, 238, 0)')

      ctx.fillStyle = grad
      ctx.fillRect(centerX - scale * 1.3, beamY - 12, scale * 2.6, 24)

      // Laser core line
      ctx.strokeStyle = 'rgba(165, 243, 252, 0.9)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(centerX - scale * 1.2, beamY)
      ctx.lineTo(centerX + scale * 1.2, beamY)
      ctx.stroke()

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full pointer-events-none opacity-80"
    />
  )
}
