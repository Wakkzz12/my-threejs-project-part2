import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Debug UI
 */
const gui = new dat.GUI()

/**
 * Canvas
 */
const canvas = document.querySelector('canvas.webgl')

/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * Create Procedural Textures
 */
function createCheckerboardTexture() {
    const canvas2d = document.createElement('canvas')
    canvas2d.width = 512
    canvas2d.height = 512
    const ctx = canvas2d.getContext('2d')

    const tileSize = 64
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#ffffff' : '#333333'
            ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize)
        }
    }

    return new THREE.CanvasTexture(canvas2d)
}

function createGradientTexture() {
    const canvas2d = document.createElement('canvas')
    canvas2d.width = 512
    canvas2d.height = 512
    const ctx = canvas2d.getContext('2d')

    const gradient = ctx.createLinearGradient(0, 0, 512, 512)
    gradient.addColorStop(0, '#ff0000')
    gradient.addColorStop(0.5, '#00ff00')
    gradient.addColorStop(1, '#0000ff')

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)

    return new THREE.CanvasTexture(canvas2d)
}

function createColorfulTexture() {
    const canvas2d = document.createElement('canvas')
    canvas2d.width = 512
    canvas2d.height = 512
    const ctx = canvas2d.getContext('2d')

    for (let y = 0; y < 512; y += 32) {
        for (let x = 0; x < 512; x += 32) {
            const r = Math.floor((x / 512) * 255)
            const g = Math.floor((y / 512) * 255)
            const b = 128
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
            ctx.fillRect(x, y, 32, 32)
        }
    }

    return new THREE.CanvasTexture(canvas2d)
}

function createDoorFallbackTexture() {
    const canvas2d = document.createElement('canvas')
    canvas2d.width = 512
    canvas2d.height = 512
    const ctx = canvas2d.getContext('2d')

    ctx.fillStyle = '#8B4513'
    ctx.fillRect(0, 0, 512, 512)

    ctx.strokeStyle = '#654321'
    ctx.lineWidth = 3
    for (let x = 0; x < 512; x += 64) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, 512)
        ctx.stroke()
    }

    for (let y = 0; y < 512; y += 128) {
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(512, y)
        ctx.stroke()
    }

    ctx.fillStyle = '#FFD700'
    ctx.beginPath()
    ctx.arc(400, 256, 20, 0, Math.PI * 2)
    ctx.fill()

    return new THREE.CanvasTexture(canvas2d)
}

/**
 * Initialize Textures
 */
const textures = {
    checkerboard: createCheckerboardTexture(),
    gradient: createGradientTexture(),
    colorful: createColorfulTexture(),
    door: createDoorFallbackTexture(),
    normal: createDoorFallbackTexture()
}

console.log('✓ Procedural textures created!')

/**
 * Load Real Door Textures (if available)
 */
const textureLoader = new THREE.TextureLoader()

textureLoader.load(
    '/static/textures/door/color.jpg',
    (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        textures.door = texture
        console.log('✓ Door color texture loaded!')
        if (parameters.textureType === 'door') updateTexture()
    },
    undefined,
    () => console.warn('⚠ Door color texture not found, using fallback.')
)

textureLoader.load(
    '/static/textures/door/normal.jpg',
    (texture) => {
        textures.normal = texture
        console.log('✓ Door normal texture loaded!')
    },
    undefined,
    () => console.warn('⚠ Door normal texture not found, using fallback.')
)

/**
 * Load Minecraft texture
 */
textureLoader.load(
    '/static/textures/minecraft.png',
    (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        textures.minecraft = texture
        console.log('✓ Minecraft texture loaded!')
        if (parameters.textureType === 'minecraft') updateTexture()
    },
    undefined,
    (err) => {
        console.warn('⚠ Minecraft texture not found at /static/textures/minecraft.png')
    }
)

/**
 * Parameters
 */
const parameters = {
    textureType: 'checkerboard',
    repeatX: 1,
    repeatY: 1,
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    wrapMode: 'repeat'
}

/**
 * Object (uses StandardMaterial for lighting support)
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshStandardMaterial({
    map: textures.checkerboard
})
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Lighting (for door & normal maps)
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
directionalLight.position.set(2, 2, 3)
scene.add(directionalLight)

/**
 * Update Texture Function
 */
function updateTexture() {
    const texture = textures[parameters.textureType]
    if (!texture) {
        console.error('Texture not found:', parameters.textureType)
        return
    }

    texture.repeat.set(parameters.repeatX, parameters.repeatY)
    texture.offset.set(parameters.offsetX, parameters.offsetY)
    texture.rotation = parameters.rotation * Math.PI
    texture.center.set(0.5, 0.5)

    const wrapModes = {
        repeat: THREE.RepeatWrapping,
        mirrored: THREE.MirroredRepeatWrapping,
        clamp: THREE.ClampToEdgeWrapping
    }
    texture.wrapS = wrapModes[parameters.wrapMode]
    texture.wrapT = wrapModes[parameters.wrapMode]
    texture.needsUpdate = true

    // If door texture selected, use normal map too
    if (parameters.textureType === 'door') {
        material.map = textures.door
        material.normalMap = textures.normal
    } else {
        material.map = texture
        material.normalMap = null
    }

    material.needsUpdate = true
    console.log('✓ Texture updated to:', parameters.textureType)
}

/**
 * GUI Controls
 */
gui.add(parameters, 'textureType', ['checkerboard', 'gradient', 'colorful', 'door', 'minecraft', 'normal'])
    .onChange(updateTexture)
    .name('Texture Type')

gui.add(parameters, 'repeatX', 0.1, 5, 0.1).onChange(updateTexture)
gui.add(parameters, 'repeatY', 0.1, 5, 0.1).onChange(updateTexture)
gui.add(parameters, 'offsetX', -1, 1, 0.1).onChange(updateTexture)
gui.add(parameters, 'offsetY', -1, 1, 0.1).onChange(updateTexture)
gui.add(parameters, 'rotation', 0, 2, 0.1).onChange(updateTexture).name('Rotation (×π)')
gui.add(parameters, 'wrapMode', ['repeat', 'mirrored', 'clamp']).onChange(updateTexture)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1.5, 1, 2)
scene.add(camera)

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Resize
 */
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()
    mesh.rotation.y = elapsedTime * 0.5
    controls.update()
    renderer.render(scene, camera)
    requestAnimationFrame(tick)
}
tick()

console.log('✅ Activity 9: Working with procedural + door textures!')
