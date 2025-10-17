import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
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
 * Create Matcap Texture
 */
function createMatcapTexture() {
    const canvas2d = document.createElement('canvas')
    canvas2d.width = 256
    canvas2d.height = 256
    const ctx = canvas2d.getContext('2d')
    
    const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128)
    gradient.addColorStop(0, '#ffffff')
    gradient.addColorStop(0.5, '#7300ffff')
    gradient.addColorStop(1, '#3a00ccff')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 256, 256)
    
    return new THREE.CanvasTexture(canvas2d)
}

const matcapTexture = createMatcapTexture()
console.log('✓ Matcap texture created!')

/**
 * Parameters
 */
const parameters = {
    text: 'Hello Three.js!',
    donutCount: 100,
    regenerate: null
}

/**
 * Font Loading with Multiple Fallbacks
 */
const fontLoader = new FontLoader()
let currentFont = null
let fontAttempts = 0

const fontPaths = [
    'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
    'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json',
    '/fonts/helvetiker_regular.typeface.json'
]

function tryLoadFont(index = 0) {
    if (index >= fontPaths.length) {
        console.error('✗ All font loading attempts failed')
        showError()
        return
    }
    
    const fontPath = fontPaths[index]
    console.log(`Attempting to load font from: ${fontPath}`)
    
    fontLoader.load(
        fontPath,
        (font) => {
            console.log('✓ Font loaded successfully!')
            currentFont = font
            createScene(font)
            
            // Setup regenerate function
            parameters.regenerate = () => createScene(font)
            gui.add(parameters, 'regenerate').name('Regenerate Scene')
            gui.add(parameters, 'donutCount', 0, 300, 1).name('Donut Count')
        },
        (progress) => {
            if (progress.total > 0) {
                console.log('Loading:', Math.round((progress.loaded / progress.total) * 100) + '%')
            }
        },
        (error) => {
            console.warn(`Failed attempt ${index + 1}/${fontPaths.length}`)
            tryLoadFont(index + 1)
        }
    )
}

function showError() {
    const errorDiv = document.createElement('div')
    errorDiv.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; background: rgba(255,0,0,0.9); padding: 30px; border-radius: 10px; z-index: 1000; max-width: 600px; text-align: center; font-family: Arial;'
    errorDiv.innerHTML = `
        <h2>❌ Font Loading Failed</h2>
        <p>Could not load font from any source.</p>
        <p style="margin-top: 15px;"><strong>Solution:</strong></p>
        <p>Copy the font file to your project:</p>
        <pre style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 5px; text-align: left; overflow-x: auto;">mkdir -p static/fonts
cp node_modules/three/examples/fonts/helvetiker_regular.typeface.json static/fonts/</pre>
        <p style="margin-top: 15px;">Then refresh the page</p>
        <button onclick="location.reload()" style="margin-top: 15px; padding: 10px 20px; font-size: 16px; cursor: pointer; background: #4CAF50; color: white; border: none; border-radius: 5px;">Retry</button>
    `
    document.body.appendChild(errorDiv)
}

// Start loading
console.log('🔄 Loading font...')
tryLoadFont(0)

/**
 * Create Scene Function
 */
function createScene(font) {
    if (!font) {
        console.error('Font is undefined!')
        return
    }
    
    console.log('Creating 3D scene...')
    
    // Clear existing meshes
    const meshesToRemove = []
    scene.children.forEach(child => {
        if (child.type === 'Mesh') {
            meshesToRemove.push(child)
        }
    })
    
    meshesToRemove.forEach(mesh => {
        if (mesh.geometry) mesh.geometry.dispose()
        if (mesh.material) mesh.material.dispose()
        scene.remove(mesh)
    })
    
    // Shared material
    const material = new THREE.MeshMatcapMaterial({ 
        matcap: matcapTexture 
    })
    
    // Text Geometry
    const textGeometry = new TextGeometry(
        parameters.text,
        {
            font: font,
            size: 0.5,
            depth: 0.2,  // Changed from 'height' to 'depth'
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.02,
            bevelOffset: 0,
            bevelSegments: 5
        }
    )
    
    // Center the text properly
    textGeometry.computeBoundingBox()
    const centerOffsetX = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x)
    const centerOffsetY = -0.5 * (textGeometry.boundingBox.max.y - textGeometry.boundingBox.min.y)
    const centerOffsetZ = -0.5 * (textGeometry.boundingBox.max.z - textGeometry.boundingBox.min.z)
    
    textGeometry.translate(centerOffsetX, centerOffsetY, centerOffsetZ)
    
    const textMesh = new THREE.Mesh(textGeometry, material)
    scene.add(textMesh)
    
    console.log('✓ 3D Text created and centered!')
    
    // Create donuts
    const donutGeometry = new THREE.TorusGeometry(0.3, 0.2, 20, 45)
    
    for(let i = 0; i < parameters.donutCount; i++) {
        const donut = new THREE.Mesh(donutGeometry, material)
        
        // Random position
        donut.position.x = (Math.random() - 0.5) * 10
        donut.position.y = (Math.random() - 0.5) * 10
        donut.position.z = (Math.random() - 0.5) * 10
        
        // Random rotation
        donut.rotation.x = Math.random() * Math.PI
        donut.rotation.y = Math.random() * Math.PI
        
        // Random scale
        const scale = Math.random()
        donut.scale.set(scale, scale, scale)
        
        scene.add(donut)
    }
    
    console.log(`✓ Created ${parameters.donutCount} donuts!`)
    console.log('✓ Scene ready!')
}

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
camera.position.set(1, 1, 3)
scene.add(camera)

/**
 * Controls
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Handle Resize
 */
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Animate
 */
const tick = () => {
    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()

console.log('Activity 11: 3D Text - Initializing...')