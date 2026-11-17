import {
  BufferGeometry, CanvasTexture, Color, EdgesGeometry, Float32BufferAttribute,
  Group, LineBasicMaterial, LineSegments, MathUtils, Mesh, MeshBasicMaterial,
  PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, Raycaster, Scene,
  SRGBColorSpace, Vector2, WebGLRenderer,
} from 'three'
import { samples } from './fixture'
import { drawFrame } from './frameArt'

type Options = {
  selected: number
  overlays: boolean
  photo: HTMLImageElement
  onSelect: (sample: number) => void
  onAvailability: (available: boolean) => void
}

export function mountFrameScene(canvas: HTMLCanvasElement, options: Options) {
  const context = canvas.getContext('webgl2', { alpha: true, antialias: true })
  if (!context) {
    options.onAvailability(false)
    return null
  }

  const renderer = new WebGLRenderer({ canvas, context })
  const scene = new Scene()
  const camera = new PerspectiveCamera(35, 1, 0.1, 30)
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const plane = new PlaneGeometry(3.8, 3.8 * 9 / 16)
  const edges = new EdgesGeometry(plane)
  const cards = samples.map((sample, index) => {
    const group = new Group()
    const image = document.createElement('canvas')
    drawFrame(image, sample, options.overlays, options.photo)
    const texture = new CanvasTexture(image)
    texture.colorSpace = SRGBColorSpace
    const material = new MeshBasicMaterial({ map: texture })
    const mesh = new Mesh(plane, material)
    mesh.userData.sample = index
    group.add(mesh)
    const outline = new LineBasicMaterial()
    const trim = new LineSegments(edges, outline)
    trim.position.z = 0.008
    group.add(trim)
    scene.add(group)
    return { group, mesh, material, outline, texture, image }
  })

  const track = new BufferGeometry()
  const trackVertices: number[] = []
  for (const z of [-1.7, -0.5, 0.7, 1.9, 3.1]) trackVertices.push(-6, -1.42, z, 6, -1.42, z)
  for (let x = -6; x <= 6; x += 0.65) trackVertices.push(x, -1.42, -3, x, -1.42, 3.1)
  track.setAttribute('position', new Float32BufferAttribute(trackVertices, 3))
  const trackInk = new LineBasicMaterial({ color: 0x789dbb, transparent: true, opacity: 0.19 })
  scene.add(new LineSegments(track, trackInk))

  const stream = new BufferGeometry()
  const streamPosition = new Float32BufferAttribute(new Float32Array(72 * 3), 3)
  stream.setAttribute('position', streamPosition)
  const streamInk = new PointsMaterial({ color: 0xfb8e9c, size: 0.029, transparent: true, opacity: 0.8 })
  const particles = new Points(stream, streamInk)
  particles.frustumCulled = false
  scene.add(particles)

  const ray = new Raycaster()
  const pointer = new Vector2()
  const surfaces = cards.map((card) => card.mesh)
  const focusInk = new Color('#f3b1b0')
  const idleInk = new Color('#547587')
  let selected = options.selected
  let overlays = options.overlays
  let frame = 0
  let last = 0
  let until = 0
  let visible = true
  let lost = false
  let orbit = 0
  let cameraX = 0
  let streamOffset = 0
  let cameraZ = 6.6
  let initialized = false

  function render(now: number) {
    frame = 0
    if (!visible || lost) return
    const still = reduced.matches
    const dt = Math.min(0.05, (now - last) / 1000)
    const blend = still || !initialized ? 1 : 1 - Math.exp(-10 * dt)
    last = now
    initialized = true
    cameraX = MathUtils.lerp(cameraX, still ? 0 : orbit * 0.48, blend)
    camera.position.set(cameraX, 0.26, cameraZ)
    camera.lookAt(0, -0.04, 0)
    cards.forEach(({ group, material, outline }, index) => {
      const active = index === selected
      const side = (index - selected + samples.length) % samples.length === 1 ? 1 : -1
      group.position.x = MathUtils.lerp(group.position.x, active ? 0 : side * 2.7, blend)
      group.position.y = MathUtils.lerp(group.position.y, active ? 0.11 : -0.05, blend)
      group.position.z = MathUtils.lerp(group.position.z, active ? 0.85 : -0.65, blend)
      group.rotation.y = MathUtils.lerp(group.rotation.y, active ? 0 : -side * 0.44, blend)
      const tint = MathUtils.lerp(material.color.r, active ? 1 : 0.35, blend)
      material.color.setRGB(tint, tint, tint)
      outline.color.lerp(active ? focusInk : idleInk, blend)
    })
    if (!still) streamOffset = (streamOffset + dt * 0.19) % 1
    for (let i = 0; i < streamPosition.count; i++) {
      const x = (((i * 0.618 + streamOffset) % 1) - 0.5) * 10.8
      streamPosition.setXYZ(i, x, -1.27 + Math.sin(x * 1.1 + i) * 0.06, 0.8 + (i % 5) * 0.11)
    }
    streamPosition.needsUpdate = true
    renderer.render(scene, camera)
    if (!still && now < until) frame = requestAnimationFrame(render)
  }

  function wake() {
    if (!visible || lost) return
    const now = performance.now()
    until = now + 900
    if (!frame) {
      last = now
      frame = requestAnimationFrame(render)
    }
  }

  function resize() {
    const { width, height } = canvas.getBoundingClientRect()
    camera.aspect = Math.max(1, width) / Math.max(1, height)
    cameraZ = Math.max(6.45, 0.85 + 7.3 / camera.aspect)
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5))
    renderer.setSize(Math.max(1, width), Math.max(1, height), false)
    wake()
  }

  function move(event: PointerEvent) {
    if (event.pointerType !== 'mouse' || reduced.matches) return
    const box = canvas.getBoundingClientRect()
    orbit = (event.clientX - box.left) / box.width * 2 - 1
    wake()
  }

  function leave() {
    orbit = 0
    wake()
  }

  function pick(event: MouseEvent) {
    if (lost) return
    const box = canvas.getBoundingClientRect()
    pointer.set((event.clientX - box.left) / box.width * 2 - 1, 1 - (event.clientY - box.top) / box.height * 2)
    ray.setFromCamera(pointer, camera)
    const hit = ray.intersectObjects(surfaces)[0]
    if (hit) options.onSelect(hit.object.userData.sample)
  }

  function lose(event: Event) {
    event.preventDefault()
    lost = true
    options.onAvailability(false)
  }

  function restore() {
    lost = false
    options.onAvailability(true)
    wake()
  }

  const size = new ResizeObserver(resize)
  const view = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting
    if (visible) wake()
  })
  size.observe(canvas)
  view.observe(canvas)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerleave', leave)
  canvas.addEventListener('click', pick)
  canvas.addEventListener('webglcontextlost', lose)
  canvas.addEventListener('webglcontextrestored', restore)
  reduced.addEventListener('change', wake)
  resize()
  options.onAvailability(true)

  return {
    update(nextSelected: number, nextOverlays: boolean) {
      selected = nextSelected
      if (nextOverlays !== overlays) {
        overlays = nextOverlays
        cards.forEach(({ image, texture }, index) => {
          drawFrame(image, samples[index], overlays, options.photo)
          texture.needsUpdate = true
        })
      }
      wake()
    },
    dispose() {
      cancelAnimationFrame(frame)
      size.disconnect()
      view.disconnect()
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerleave', leave)
      canvas.removeEventListener('click', pick)
      canvas.removeEventListener('webglcontextlost', lose)
      canvas.removeEventListener('webglcontextrestored', restore)
      reduced.removeEventListener('change', wake)
      for (const card of cards) {
        card.material.dispose()
        card.outline.dispose()
        card.texture.dispose()
      }
      plane.dispose()
      edges.dispose()
      track.dispose()
      trackInk.dispose()
      stream.dispose()
      streamInk.dispose()
      renderer.dispose()
    },
  }
}
