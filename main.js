import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'lil-gui'
import { Vector3 } from 'three/src/math/Vector3'
import { VertexNormalsHelper } from 'three/examples/jsm/helpers/VertexNormalsHelper'
import { createNoise2D } from 'simplex-noise'

const noise = createNoise2D()

/**
 * Debug
 */
// const gui = new dat.GUI()

/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * BOX
 */
const material = new THREE.MeshNormalMaterial({ color: 'red' })
// const geometry = new THREE.BufferGeometry()

// const vA = new Vector3(1, 0, 0)
// const vB = new Vector3(0, 1, 0)
// const vC = new Vector3(0, 0, 1)

// geometry.setAttribute(
// 	'position',
// 	new THREE.BufferAttribute(new Float32Array([...vA, ...vB, ...vC]), 3)
// )

// const bc = vC.clone().sub(vB)
// const ab = vB.clone().sub(vA)
// const n = ab.cross(bc).normalize()

// geometry.setAttribute(
// 	'normal',
// 	new THREE.BufferAttribute(new Float32Array([...n, ...n, ...n]), 3)
// )

function createTerrain(position) {
	const geometry = new THREE.PlaneGeometry(10, 10, 10, 10)
	geometry.rotateX(-Math.PI * 0.5)
	const pos = geometry.getAttribute('position')
	const normal = geometry.getAttribute('normal')

	for (let i = 0; i < pos.count; i++) {
		const xA = pos.getX(i) + position.x
		const zA = pos.getZ(i) + position.z

		const zB = zA + 0.001
		const xC = xA + 0.001

		const yA = noise(xA * 0.1, zA * 0.1)
		const yB = noise(xA * 0.1, zB * 0.1)
		const yC = noise(xC * 0.1, zA * 0.1)

		const vA = new Vector3(xA, yA, zA)
		const vB = new Vector3(xA, yB, zB)
		const vC = new Vector3(xC, yC, zA)

		const bc = vC.sub(vB)
		const ab = vB.sub(vA)
		const n = ab.cross(bc).normalize()

		pos.setY(i, yA)
		normal.setXYZ(i, n.x, n.y, n.z)
	}

	normal.needsUpdate = true
	pos.needsUpdate = true
	// geometry.computeVertexNormals()

	const mesh = new THREE.Mesh(geometry, material)
	mesh.position.copy(position)
	material.flatShading = true

	const helper = new VertexNormalsHelper(mesh, 1, 0xdd3300)

	return [mesh]
}

// console.log(geometry.index)

// geometry.computeVertexNormals()

const meshes = createTerrain(new Vector3(0, 0, 0))
scene.add(
	...meshes,
	...createTerrain(new Vector3(10, 0, 0)),
	...createTerrain(new Vector3(0, 0, 10)),
	...createTerrain(new Vector3(10, 0, 10))
)

/**
 * render sizes
 */
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
}
/**
 * Camera
 */
const fov = 60
const camera = new THREE.PerspectiveCamera(fov, sizes.width / sizes.height, 0.1)
camera.position.set(4, 4, 4)
camera.lookAt(new THREE.Vector3(0, 2.5, 0))

/**
 * Show the axes of coordinates system
 */
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

/**
 * renderer
 */
const renderer = new THREE.WebGLRenderer({
	antialias: window.devicePixelRatio < 2,
	logarithmicDepthBuffer: true,
})
document.body.appendChild(renderer.domElement)
handleResize()

/**
 * OrbitControls
 */
const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true

/**
 * Three js Clock
 */
// const clock = new THREE.Clock()

/**
 * frame loop
 */
function tic() {
	/**
	 * tempo trascorso dal frame precedente
	 */
	// const deltaTime = clock.getDelta()
	/**
	 * tempo totale trascorso dall'inizio
	 */
	// const time = clock.getElapsedTime()

	controls.update()

	renderer.render(scene, camera)

	requestAnimationFrame(tic)
}

requestAnimationFrame(tic)

window.addEventListener('resize', handleResize)

function handleResize() {
	sizes.width = window.innerWidth
	sizes.height = window.innerHeight

	camera.aspect = sizes.width / sizes.height
	camera.updateProjectionMatrix()

	renderer.setSize(sizes.width, sizes.height)

	const pixelRatio = Math.min(window.devicePixelRatio, 2)
	renderer.setPixelRatio(pixelRatio)
}
