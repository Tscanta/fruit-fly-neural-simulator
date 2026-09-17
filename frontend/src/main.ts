// FLY BRAIN PROJECT
// Phase 1 — 3D Simulation Environment
// Step 6C — Fly Model Inspection

import * as THREE from 'three';
import './style.css';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FlyController } from './fly/FlyController';

// Keyboard input

const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});

// Camera rotation

let yaw = 0;
let pitch = 0;

const mouseSensitivity = 0.002;

// Create scene

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xffffff);

// Create camera

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 2, 5);

// Create renderer

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);

document.body.appendChild(renderer.domElement);

// Create floor

const floorGeometry = new THREE.PlaneGeometry(20, 20);

const floorMaterial = new THREE.MeshBasicMaterial({
  color: 0xf5f5f5,
  side: THREE.DoubleSide
});

const floor = new THREE.Mesh(
  floorGeometry,
  floorMaterial
);

floor.rotation.x = -Math.PI / 2;

scene.add(floor);

// Create lighting
const ambientLight = new THREE.AmbientLight(
  0xffffff,
  2
);

scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(
  0xffffff,
  3
);

directionalLight.position.set(
  5,
  10,
  5
);

scene.add(directionalLight);

// Create fly controller group
const fly = new THREE.Group();

fly.position.set(0, 0.5, 0);

scene.add(fly);

// Load Drosophila model

const loader = new GLTFLoader();

let flyController: FlyController | null = null;

loader.load(
  '/models/drosophila/scene.gltf',

  (gltf) => {
    const model = gltf.scene;

    // Inspect individual meshes

let meshIndex = 0;

model.traverse((object) => {

  if (!(object instanceof THREE.Mesh)) return;

  object.userData.meshIndex = meshIndex;

  // Highlight unknown meshes
  if (
    meshIndex === 1 ||
    meshIndex === 2 
  ) {
    if (Array.isArray(object.material)) {
      object.material = object.material.map((material) => {
        const clonedMaterial = material.clone();
        clonedMaterial.color.set(0xff0000);
        return clonedMaterial;
      });
    } else {
      object.material = object.material.clone();
      object.material.color.set(0xff0000);
    }
  }

  meshIndex++;
});

    
    // Align the fly's anatomical front with -Z
    model.rotation.y = Math.PI;

    // Calculate model size
    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Scale model
    const largestDimension = Math.max(
      size.x,
      size.y,
      size.z
    );

    if (largestDimension > 0) {
      const targetSize = 1.5;
      const scale = targetSize / largestDimension;

      model.scale.setScalar(scale);
    }

    // Recalculate bounding box after scaling

    const scaledBox = new THREE.Box3().setFromObject(model);

    const center = new THREE.Vector3();

    scaledBox.getCenter(center);

    // Center model inside fly group

    model.position.x -= center.x;
    model.position.z -= center.z;

    // Place bottom of fly near the group's origin

    model.position.y -= scaledBox.min.y;

    // Add model to fly group

    fly.add(model);

    // Allow individual fly parts to be selected

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersections = raycaster.intersectObjects(
    model.children,
    true
  );

  if (intersections.length === 0) return;

  const selected = intersections[0].object;

  if (!(selected instanceof THREE.Mesh)) return;

  console.log(
    'Selected mesh:',
    selected.userData.meshIndex,
    selected.name
  );
});

    // Create fly controller

    flyController = new FlyController(fly);

    console.log('Drosophila model loaded successfully.');
  },

  undefined,

  (error) => {
    console.error(
      'Failed to load Drosophila model:',
      error
    );
  }
);

// Mouse camera control
/*renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});*/

document.addEventListener('mousemove', (event) => {
  if (
    document.pointerLockElement !==
    renderer.domElement
  ) {
    return;
  }

  yaw -= event.movementX * mouseSensitivity;

  pitch -= event.movementY * mouseSensitivity;

  const maxPitch = Math.PI / 2 - 0.1;

  pitch = Math.max(
    -maxPitch,
    Math.min(maxPitch, pitch)
  );
});

// Handle browser resizing

window.addEventListener('resize', () => {
  camera.aspect =
    window.innerWidth /
    window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});

// Camera movement settings

const moveSpeed = 0.08;

// Main simulation loop

function animate() {
  requestAnimationFrame(animate);

  // Fly control

  if (flyController) {
    if (keys['i']) {
      flyController.move('forward');
    }

    if (keys['k']) {
      flyController.move('backward');
    }

    if (keys['j']) {
      flyController.move('left');
    }

    if (keys['l']) {
      flyController.move('right');
    }

    if (keys['u']) {
      flyController.move('up');
    }

    if (keys['o']) {
      flyController.move('down');
    }

    flyController.update();
  }

  // Camera-relative movement

  const forward = new THREE.Vector3();

  camera.getWorldDirection(forward);

  forward.y = 0;

  forward.normalize();

  const right = new THREE.Vector3();

  right.crossVectors(
    forward,
    camera.up
  ).normalize();

  // Camera keyboard movement

  if (keys['w'] || keys['arrowup']) 
  {
    camera.position.addScaledVector(forward, moveSpeed);
  }

  if (keys['s'] || keys['arrowdown']) 
  {
    camera.position.addScaledVector(forward, -moveSpeed);
  }

  if (keys['a'] || keys['arrowleft']) 
  {
    camera.position.addScaledVector(right,-moveSpeed);
  }

  if (keys['d'] || keys['arrowright']) 
  {
    camera.position.addScaledVector(right,moveSpeed);
  }

  // Camera rotation
  camera.rotation.order = 'YXZ';
  camera.rotation.y = yaw;
  camera.rotation.x = pitch;

  // Render scene
  renderer.render(scene,camera);
}

// Start simulation
animate();