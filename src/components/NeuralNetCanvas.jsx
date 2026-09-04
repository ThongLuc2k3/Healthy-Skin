import { useEffect, useRef } from 'react'

export default function NeuralNetCanvas() {
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

    // Multi-layer neural network architecture
    const layers = [4, 6, 8, 5, 3]
    const nodes = []

    layers.forEach((count, layerIdx) => {
      const layerX = (width / (layers.length + 1)) * (layerIdx + 1)
      for (let i = 0; i < count; i++) {
        const layerY = (height / (count + 1)) * (i + 1)
        nodes.push({
          x: layerX,
          y: layerY,
          layer: layerIdx,
          pulse: Math.random() * Math.PI * 2,
        })
      }
    })

    // Data pulses travelling along synapses
    const pulses = []
    for (let i = 0; i < 18; i++) {
      pulses.push({
        fromLayer: Math.floor(Math.random() * (layers.length - 1)),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.01,
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // Draw Synaptic Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[j].layer === nodes[i].layer + 1) {
            ctx.lineWidth = 0.8
            ctx.strokeStyle = 'rgba(47, 169, 140, 0.20)'
            ctx.beginPath()
            ctx.moveTo(nodes[i].x, nodes[i].y)
            ctx.lineTo(nodes[j].x, nodes[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw Traveling Data Pulses
      for (const p of pulses) {
        p.progress += p.speed
        if (p.progress >= 1) {
          p.progress = 0
          p.fromLayer = Math.floor(Math.random() * (layers.length - 1))
        }

        const sourceNodes = nodes.filter((n) => n.layer === p.fromLayer)
        const targetNodes = nodes.filter((n) => n.layer === p.fromLayer + 1)

        if (sourceNodes.length > 0 && targetNodes.length > 0) {
          const src = sourceNodes[0]
          const tgt = targetNodes[0]

          const px = src.x + (tgt.x - src.x) * p.progress
          const py = src.y + (tgt.y - src.y) * p.progress

          ctx.fillStyle = '#1d4ed8'
          ctx.beginPath()
          ctx.arc(px, py, 3.5, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Draw Neural Nodes
      for (const n of nodes) {
        n.pulse += 0.03
        const glow = 0.5 + Math.sin(n.pulse) * 0.5

        ctx.fillStyle = `rgba(47, 169, 140, ${0.4 + glow * 0.5})`
        ctx.beginPath()
        ctx.arc(n.x, n.y, 4.5 + glow * 1.5, 0, Math.PI * 2)
        ctx.fill()
      }

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
      className="absolute inset-0 h-full w-full pointer-events-none opacity-90"
    />
  )
}

