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
 * Geometry Selection
 */
let mesh = null

const parameters = {
    geometry: 'random-triangles',
    wireframe: true,
    color: '#ff0000'
}

// Function to create geometry based on selection
function createGeometry() {
    // Remove old mesh if exists
    if (mesh) {
        scene.remove(mesh)
        mesh.geometry.dispose()
        mesh.material.dispose()
    }
    
    let geometry
    
    switch(parameters.geometry) {
        case 'box':
            geometry = new THREE.BoxGeometry(1, 1, 1, 2, 2, 2)
            break
        case 'sphere':
            geometry = new THREE.SphereGeometry(0.7, 32, 32)
            break
        case 'cone':
            geometry = new THREE.ConeGeometry(0.7, 1.5, 32)
            break
        case 'torus':
            geometry = new THREE.TorusGeometry(0.7, 0.3, 32, 100)
            break
        case 'cylinder':
            geometry = new THREE.CylinderGeometry(0.7, 0.7, 1.5, 32)
            break
        case 'plane':
            geometry = new THREE.PlaneGeometry(2, 2, 10, 10)
            break
        case 'single-triangle':
            geometry = new THREE.BufferGeometry()
            const vertices = new Float32Array([
                0, 1, 0,    // Top vertex
                -1, -1, 0,  // Bottom left
                1, -1, 0    // Bottom right
            ])
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
            break
        case 'random-triangles':
        default:
            geometry = new THREE.BufferGeometry()
            const count = 50
            const positionsArray = new Float32Array(count * 3 * 3)
            for(let i = 0; i < count * 3 * 3; i++) {
                positionsArray[i] = (Math.random() - 0.5) * 4
            }
            geometry.setAttribute('position', new THREE.BufferAttribute(positionsArray, 3))
            break
    }
    
    const material = new THREE.MeshBasicMaterial({ 
        color: parameters.color,
        wireframe: parameters.wireframe,
        side: THREE.DoubleSide
    })
    
    mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
}

// Initial geometry
createGeometry()

/**
 * Debug Controls
 */
gui.add(parameters, 'geometry', [
    'random-triangles',
    'single-triangle', 
    'box', 
    'sphere', 
    'cone', 
    'torus', 
    'cylinder',
    'plane'
]).onChange(() => {
    createGeometry()
})

gui.add(parameters, 'wireframe').onChange((value) => {
    if (mesh) mesh.material.wireframe = value
})

gui.addColor(parameters, 'color').onChange((value) => {
    if (mesh) mesh.material.color.set(value)
})

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
camera.position.z = 3
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
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Rotate mesh
    if (mesh) {
        mesh.rotation.y = elapsedTime * 0.2
        mesh.rotation.x = elapsedTime * 0.1
    }

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()

console.log('Activity 7: Geometries loaded!')
console.log('Instructions: Use GUI to change geometry types')