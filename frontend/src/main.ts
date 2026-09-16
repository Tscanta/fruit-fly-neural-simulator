// ============================================================
// FLY BRAIN PROJECT
// Phase 1 — 3D Simulation Environment
// Step 6A — Replace Placeholder Fly
// ============================================================

import * as THREE from 'three';
import './style.css';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FlyController } from './fly/FlyController';


// ============================================================
// 1. KEYBOARD INPUT
// ============================================================

const keys: Record<string, boolean> = {};

window.addEventListener('keydown', (event) => {
  keys[event.key.toLowerCase()] = true;
});

window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});


// ============================================================
// 2. CAMERA ROTATION VARIABLES
// ============================================================

let yaw = 0;
let pitch = 0;

const mouseSensitivity = 0.002;


// ============================================================
// 3. CREATE THE 3D WORLD
// ============================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0xffffff);


// ============================================================
// 4. CREATE THE CAMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 2, 5);


// ============================================================
// 5. CREATE THE RENDERER
// ============================================================

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


// ============================================================
// 6. CREATE THE FLOOR
// ============================================================

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


// 6B. CREATE LIGHTING
// Ambient light provides general illumination.
const ambientLight = new THREE.AmbientLight(
  0xffffff,
  2
);

scene.add(ambientLight);


// Directional light acts like a simple sun.
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


// 7. CREATE FLY CONTROLLER GROUP

// This outer group is the actual "body container"
// controlled by FlyController.

// The downloaded Drosophila model will be placed inside it.

const fly = new THREE.Group();

fly.position.set(0, 0.5, 0);

scene.add(fly);

// 8. LOAD DROSOPHILA MODEL
const loader = new GLTFLoader();
let flyController: FlyController | null = null;
loader.load(
  '/models/drosophila/scene.gltf',
  (gltf) => {

    // Get the actual 3D model.
    const model = gltf.scene;
    model.rotation.y = Math.PI; // Align the fly's anatomical front with -Z.

    // MODEL HIERARCHY INSPECTION
    // Print every object contained inside the Drosophila model.
    // This helps us identify the individual body parts.

    model.traverse((object) => {
      console.log(
        'Model Object:',
        object.name,
        '| Type:',
        object.type
      );
    });

    // --------------------------------------------------------
    // Calculate the model's size
    // --------------------------------------------------------

    const box = new THREE.Box3().setFromObject(model);
    const size = new THREE.Vector3();
    box.getSize(size);


    // --------------------------------------------------------
    // Scale the model
    // --------------------------------------------------------

    // Make the fly a reasonable size for our environment.

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


    // --------------------------------------------------------
    // Recalculate bounding box after scaling
    // --------------------------------------------------------

    const scaledBox = new THREE.Box3().setFromObject(model);

    const center = new THREE.Vector3();

    scaledBox.getCenter(center);


    // --------------------------------------------------------
    // Center the model inside the fly group
    // --------------------------------------------------------

    model.position.x -= center.x;
    model.position.z -= center.z;


    // Put the bottom of the fly near the group's origin.

    model.position.y -= scaledBox.min.y;


    // --------------------------------------------------------
    // Add model to fly group
    // --------------------------------------------------------

    fly.add(model);


    // --------------------------------------------------------
    // Create controller
    // --------------------------------------------------------

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


// ============================================================
// 9. MOUSE CAMERA CONTROL
// ============================================================

renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});


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


// ============================================================
// 10. HANDLE BROWSER RESIZING
// ============================================================

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


// ============================================================
// 11. CAMERA MOVEMENT SETTINGS
// ============================================================

const moveSpeed = 0.08;


// ============================================================
// 12. MAIN SIMULATION LOOP
// ============================================================

function animate() {

  requestAnimationFrame(animate);


  // ==========================================================
  // FLY CONTROL
  // ==========================================================

  // Only control the fly after the model has loaded.

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


    // Update velocity, position and drag.
    flyController.update();
  }


  // ==========================================================
  // CAMERA-RELATIVE MOVEMENT
  // ==========================================================

  const forward = new THREE.Vector3();

  camera.getWorldDirection(forward);

  forward.y = 0;

  forward.normalize();


  const right = new THREE.Vector3();

  right.crossVectors(
    forward,
    camera.up
  ).normalize();


  // ==========================================================
  // CAMERA KEYBOARD MOVEMENT
  // ==========================================================

  if (keys['w'] || keys['arrowup']) {
    camera.position.addScaledVector(
      forward,
      moveSpeed
    );
  }


  if (keys['s'] || keys['arrowdown']) {
    camera.position.addScaledVector(
      forward,
      -moveSpeed
    );
  }


  if (keys['a'] || keys['arrowleft']) {
    camera.position.addScaledVector(
      right,
      -moveSpeed
    );
  }


  if (keys['d'] || keys['arrowright']) {
    camera.position.addScaledVector(
      right,
      moveSpeed
    );
  }


  // ==========================================================
  // CAMERA ROTATION
  // ==========================================================

  camera.rotation.order = 'YXZ';

  camera.rotation.y = yaw;

  camera.rotation.x = pitch;


  // ==========================================================
  // RENDER
  // ==========================================================

  renderer.render(
    scene,
    camera
  );
}


// ============================================================
// 13. START SIMULATION
// ============================================================

animate();