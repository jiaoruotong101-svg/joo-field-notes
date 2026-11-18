import type { SignalForm } from './forms'
import { useEffect, type RefObject } from 'react'
import {
  MathUtils, PerspectiveCamera, Points, Scene, ShaderMaterial, Vector3, WebGLRenderer,
} from 'three'
import { createSignalGeometry, PARTICLE_COUNT } from './geometry'
import { fragmentShader, vertexShader } from './shaders'
import { chapterMotion } from './chapterMotion'

export type SignalControls = {
  paused: boolean
  form: SignalForm
  impulse: number
  hoverX: number
  hoverY: number
  hover: boolean
  dragX: number
  dragY: number
  dragging: boolean
}

export type SignalCanvasProps = {
  context: WebGL2RenderingContext
  controls: RefObject<SignalControls>
  onAvailability: (available: boolean) => void
}

export default function SignalCanvas({ context, controls, onAvailability }: SignalCanvasProps) {
  useEffect(() => {
    const canvas = context.canvas as HTMLCanvasElement
    let renderer: WebGLRenderer
    try {
      renderer = new WebGLRenderer({ canvas, context })
    } catch {
      onAvailability(false)
      return
    }

    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    const compact = matchMedia('(max-width: 740px), (pointer: coarse)')
    const baseCount = compact.matches ? 20000 : (navigator.hardwareConcurrency || 8) < 6 ? 34000 : PARTICLE_COUNT
    let quality = 1
    const scene = new Scene()
    const camera = new PerspectiveCamera(38, 1, 0.1, 30)
    camera.position.z = 5.8
    const geometry = createSignalGeometry(baseCount)
    const uniforms = {
      uTime: { value: 0 },
      uWipe: { value: new Vector3() },
      uHeight: { value: 1 },
      uShape: { value: new Vector3(1, 0, 0) },
      uBurst: { value: 0 },
      uArrival: { value: 0 },
      uDpr: { value: 1 },
      uDensity: { value: 1 },
      uPointer: { value: new Vector3() },
    }
    const material = new ShaderMaterial({ vertexShader, fragmentShader, uniforms, transparent: true, depthWrite: false })
    const points = new Points(geometry, material)
    points.frustumCulled = false
    points.rotation.set(-0.15, -0.18, -0.45)
    scene.add(points)
    let frame = 0
    let visible = true
    let lost = false
    let painted = false
    let width = 1
    let height = 1
    let last = performance.now()
    let elapsed = 0
    let sampleFrames = 0
    let sampleTime = 0
    let inputImpulse = controls.current.impulse
    let sinceBurst = Infinity
    let seenDragX = 0
    let seenDragY = 0
    let velocityX = 0
    let velocityY = 0
    let scroll = 0
    let lastScrollY = window.scrollY

    function resize() {
      const box = canvas.getBoundingClientRect()
      width = Math.max(1, box.width)
      height = Math.max(1, box.height)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      const dpr = Math.min(devicePixelRatio, compact.matches ? 1.2 : 1.65) * quality
      const bufferWidth = Math.floor(width * dpr)
      const bufferHeight = Math.floor(height * dpr)
      if (canvas.width !== bufferWidth || canvas.height !== bufferHeight) {
        renderer.setDrawingBufferSize(width, height, dpr)
      }
      uniforms.uDpr.value = dpr
      uniforms.uHeight.value = height
      uniforms.uDensity.value = compact.matches ? 0.94 : 1.02
      geometry.setDrawRange(0, Math.floor(Math.min(baseCount, compact.matches ? 20000 : baseCount) * quality))
    }

    function draw(now: number) {
      frame = 0
      if (lost || !visible || document.hidden) return
      const rawDt = (now - last) / 1000
      const reduced = motion.matches
      const input = controls.current
      const idle = reduced || input.paused
      const scrollY = window.scrollY
      const interacting = input.dragging || input.dragX !== seenDragX || input.dragY !== seenDragY
        || input.impulse !== inputImpulse || sinceBurst < 1.1
        || Math.abs(uniforms.uShape.value.getComponent(input.form) - 1) > 0.01
        || Math.abs(velocityX) + Math.abs(velocityY) > 0.12 || scrollY !== lastScrollY
      if (painted && !idle && compact.matches && !interacting && rawDt < 0.03) {
        frame = requestAnimationFrame(draw)
        return
      }
      const dt = Math.min(0.05, Math.max(0.001, rawDt))
      last = now
      lastScrollY = scrollY
      if (!idle) elapsed += dt
      if (!idle && elapsed > 2 && rawDt < 0.2) {
        sampleFrames++
        sampleTime += rawDt
        if (sampleTime > 2.5) {
          if (sampleFrames / sampleTime < (compact.matches ? 25 : 43) && quality > 0.72) {
            quality *= 0.83
            resize()
          }
          sampleFrames = 0
          sampleTime = 0
        }
      }
      if (input.impulse !== inputImpulse) {
        inputImpulse = input.impulse
        sinceBurst = 0
      }
      sinceBurst += dt
      uniforms.uArrival.value = idle ? 1 : MathUtils.smootherstep(elapsed, 0, 1.65)
      uniforms.uTime.value = reduced ? 0 : elapsed
      for (let i = 0; i < 3; i++) {
        const target = i === input.form ? 1 : 0
        uniforms.uShape.value.setComponent(i, idle ? target : MathUtils.damp(uniforms.uShape.value.getComponent(i), target, 4.8, dt))
      }
      uniforms.uBurst.value = idle ? 0 : Math.min(1, sinceBurst * 7) * Math.exp(-sinceBurst * 2.5)
      if (reduced) scroll = 0
      else if (!idle) scroll = MathUtils.clamp(scrollY / Math.max(500, innerHeight), 0, 1)
      const box = canvas.getBoundingClientRect()
      uniforms.uWipe.value.set(chapterMotion.circleX - box.left, chapterMotion.circleY - box.top, reduced ? 0 : chapterMotion.radius)
      camera.position.z = 5.8 - scroll * 0.75
      camera.position.y = scroll * 0.55
      const viewHalfHeight = Math.tan(MathUtils.degToRad(camera.fov / 2)) * camera.position.z
      const pointer = uniforms.uPointer.value
      pointer.x = MathUtils.damp(pointer.x, input.hoverX * viewHalfHeight * camera.aspect, 16, dt)
      pointer.y = MathUtils.damp(pointer.y, input.hoverY * viewHalfHeight, 16, dt)
      pointer.z = idle ? 0 : MathUtils.damp(pointer.z, input.hover && !input.dragging ? 1 : 0, 9, dt)

      const dx = input.dragX - seenDragX
      const dy = input.dragY - seenDragY
      seenDragX = input.dragX
      seenDragY = input.dragY
      if (!idle && (input.dragging || dx !== 0 || dy !== 0)) {
        points.rotation.y += dx * 0.009
        points.rotation.x += dy * 0.009
        velocityX = MathUtils.damp(velocityX, dx * 0.009 / dt, 13, dt)
        velocityY = MathUtils.damp(velocityY, dy * 0.009 / dt, 13, dt)
      } else if (!idle) {
        points.rotation.y += (0.085 + velocityX) * dt
        points.rotation.x = MathUtils.damp(points.rotation.x + velocityY * dt, -0.15, 0.7, dt)
        velocityX *= Math.exp(-dt * 3.1)
        velocityY *= Math.exp(-dt * 3.1)
      }
      points.rotation.z = -0.45 + scroll * 0.23
      renderer.render(scene, camera)
      if (!painted) {
        painted = true
        onAvailability(true)
      }
      if (!idle) frame = requestAnimationFrame(draw)
    }

    function wake() {
      if (!frame && visible && !document.hidden && !lost) {
        last = performance.now()
        frame = requestAnimationFrame(draw)
      }
    }

    function contextLost(event: Event) {
      event.preventDefault()
      lost = true
      painted = false
      onAvailability(false)
    }

    function contextRestored() {
      lost = false
      wake()
    }

    const sizeObserver = new ResizeObserver(() => { resize(); wake() })
    sizeObserver.observe(canvas)
    const viewObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      wake()
    })
    viewObserver.observe(canvas)
    document.addEventListener('visibilitychange', wake)
    motion.addEventListener('change', wake)
    canvas.addEventListener('signalchange', wake)
    canvas.addEventListener('webglcontextlost', contextLost)
    canvas.addEventListener('webglcontextrestored', contextRestored)
    resize()
    wake()

    return () => {
      cancelAnimationFrame(frame)
      sizeObserver.disconnect()
      viewObserver.disconnect()
      document.removeEventListener('visibilitychange', wake)
      motion.removeEventListener('change', wake)
      canvas.removeEventListener('signalchange', wake)
      canvas.removeEventListener('webglcontextlost', contextLost)
      canvas.removeEventListener('webglcontextrestored', contextRestored)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [context, controls, onAvailability])

  return null
}
