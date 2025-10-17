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
 * Texture Loader
 */
const textureLoader = new THREE.TextureLoader()

const textures = {
    minecraft: null,
    matcaps: []
}

/**
 * Load Minecraft texture
 */
textureLoader.load(
    '/static/textures/minecraft.png',
    (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace
        textures.minecraft = texture
        console.log('✓ Minecraft texture loaded!')
        if (parameters.useMinecraftTexture) updateMaterial()
    },
    undefined,
    () => console.warn('⚠ minecraft.png not found in /static/textures/')
)

/**
 * Load Matcap textures (1–8)
 */
for (let i = 1; i <= 8; i++) {
    textureLoader.load(
        `/static/textures/matcaps/${i}.png`,
        (texture) => {
            textures.matcaps[i - 1] = texture
            console.log(`✓ Matcap ${i}.png loaded!`)
            if (parameters.matcapIndex === i - 1 && parameters.materialType === 'Matcap') updateMaterial()
        },
        undefined,
        () => console.warn(`⚠ ${i}.png not found`)
    )
}

/**
 * Parameters
 */
const parameters = {
    materialType: 'Standard',
    color: '#ffffff',
    metalness: 0.7,
    roughness: 0.2,
    wireframe: false,
    useMinecraftTexture: false,
    matcapIndex: 0 // corresponds to 1.png
}

/**
 * Create Initial Material
 */
let material = new THREE.MeshStandardMaterial({
    color: parameters.color,
    metalness: parameters.metalness,
    roughness: parameters.roughness
})

/**
 * Objects
 */
const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 32), material)
sphere.position.x = -1.5

const plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material)

const torus = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.2, 32, 64), material)
torus.position.x = 1.5

scene.add(sphere, plane, torus)

/**
 * Update Material Function
 */
function updateMaterial() {
    material.dispose()

    let newMaterial

    switch (parameters.materialType) {
        case 'Basic':
            newMaterial = new THREE.MeshBasicMaterial({
                color: parameters.color,
                wireframe: parameters.wireframe,
                map: parameters.useMinecraftTexture ? textures.minecraft : null
            })
            break

        case 'Normal':
            newMaterial = new THREE.MeshNormalMaterial({
                wireframe: parameters.wireframe,
                flatShading: false
            })
            break

        case 'Matcap':
            const matcap = textures.matcaps[parameters.matcapIndex] || null
            newMaterial = new THREE.MeshMatcapMaterial({
                matcap: matcap,
                wireframe: parameters.wireframe
            })
            break

        case 'Lambert':
            newMaterial = new THREE.MeshLambertMaterial({
                color: parameters.color,
                wireframe: parameters.wireframe,
                map: parameters.useMinecraftTexture ? textures.minecraft : null
            })
            break

        case 'Phong':
            newMaterial = new THREE.MeshPhongMaterial({
                color: parameters.color,
                wireframe: parameters.wireframe,
                shininess: 100,
                map: parameters.useMinecraftTexture ? textures.minecraft : null
            })
            break

        case 'Standard':
        default:
            newMaterial = new THREE.MeshStandardMaterial({
                color: parameters.color,
                metalness: parameters.metalness,
                roughness: parameters.roughness,
                wireframe: parameters.wireframe,
                map: parameters.useMinecraftTexture ? textures.minecraft : null
            })
            break
    }

    material = newMaterial
    sphere.material = material
    plane.material = material
    torus.material = material

    console.log('🧱 Material updated to:', parameters.materialType)
}

/**
 * GUI Controls
 */
gui.add(parameters, 'materialType', [
    'Basic',
    'Normal',
    'Matcap',
    'Lambert',
    'Phong',
    'Standard'
]).onChange(updateMaterial).name('Material Type')

gui.add(parameters, 'useMinecraftTexture').onChange(updateMaterial).name('Use Minecraft Texture')

gui.add(parameters, 'matcapIndex', 0, 7, 1)
    .onChange(() => {
        if (parameters.materialType === 'Matcap') updateMaterial()
    })
    .name('Matcap (1–8)')

gui.addColor(parameters, 'color').onChange(() => {
    if (material.color) material.color.set(parameters.color)
})

gui.add(parameters, 'wireframe').onChange(() => {
    material.wireframe = parameters.wireframe
})

const standardFolder = gui.addFolder('Standard Material')
standardFolder.add(parameters, 'metalness', 0, 1, 0.01).onChange((value) => {
    if (material.metalness !== undefined) material.metalness = value
})
standardFolder.add(parameters, 'roughness', 0, 1, 0.01).onChange((value) => {
    if (material.roughness !== undefined) material.roughness = value
})

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

const pointLight = new THREE.PointLight(0xffffff, 0.5)
pointLight.position.set(2, 3, 4)
scene.add(pointLight)

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
camera.position.set(1, 1, 2)
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

    // Rotate objects
    sphere.rotation.y = 0.1 * elapsedTime
    plane.rotation.y = 0.1 * elapsedTime
    torus.rotation.y = 0.1 * elapsedTime

    sphere.rotation.x = 0.15 * elapsedTime
    plane.rotation.x = 0.15 * elapsedTime
    torus.rotation.x = 0.15 * elapsedTime

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()

console.log('✅ Activity 10: Materials, Matcaps 1–8 (1.png–8.png), and Minecraft texture loaded!')
