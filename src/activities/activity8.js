import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'

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
 * Object
 */
const geometry = new THREE.BoxGeometry(1, 1, 1)
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 })
const mesh = new THREE.Mesh(geometry, material)
scene.add(mesh)

/**
 * Debug Parameters
 */
const parameters = {
    color: 0xff0000,
    spin: () => {
        gsap.to(mesh.rotation, { duration: 1, y: mesh.rotation.y + Math.PI * 2 })
    }
}

/**
 * Debug Controls
 */
// Position
gui.add(mesh.position, 'y').min(-3).max(3).step(0.01).name('elevation')
gui.add(mesh.position, 'x').min(-3).max(3).step(0.01).name('position X')
gui.add(mesh.position, 'z').min(-3).max(3).step(0.01).name('position Z')

// Visibility
gui.add(mesh, 'visible')

// Wireframe
gui.add(material, 'wireframe')

// Color
gui.addColor(parameters, 'color').onChange(() => {
    material.color.set(parameters.color)
})

// Spin button
gui.add(parameters, 'spin')

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

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    window.requestAnimationFrame(tick)
}

tick()

console.log('Activity 8: Debug UI loaded!')
console.log('Instructions: Use the GUI panel on the right to control the cube')