// ============================================================
// FLY BRAIN PROJECT
// Phase 1 — 3D Simulation Environment
// Step 5D — Fly Physics / Movement State
// ============================================================

import * as THREE from 'three';
import './style.css';
import { FlyController } from './fly/FlyController';

// ============================================================
// 1. KEYBOARD INPUT
// ============================================================

// Stores the current state of keyboard keys.
const keys: Record<string, boolean> = {};


// Detect when a key is pressed
window.addEventListener('keydown', (event) => {
  keys[event.key.toLowerCase()] = true;
});


// Detect when a key is released
window.addEventListener('keyup', (event) => {
  keys[event.key.toLowerCase()] = false;
});


// ============================================================
// 2. CAMERA ROTATION VARIABLES
// ============================================================

// Horizontal camera rotation.
let yaw = 0;


// Vertical camera rotation.
let pitch = 0;


// Mouse sensitivity.
const mouseSensitivity = 0.002;


// ============================================================
// 3. CREATE THE 3D WORLD
// ============================================================

const scene = new THREE.Scene();


// Set the background to white.
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


// Initial camera position.
camera.position.set(0, 2, 5);


// ============================================================
// 5. CREATE THE RENDERER
// ============================================================

const renderer = new THREE.WebGLRenderer({
  antialias: true
});


// Make the renderer fill the browser window.
renderer.setSize(
  window.innerWidth,
  window.innerHeight
);


// Improve rendering quality on high-resolution displays.
renderer.setPixelRatio(
  Math.min(window.devicePixelRatio, 2)
);


// Add the renderer's canvas to the webpage.
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


// Rotate the plane so it lies horizontally.
floor.rotation.x = -Math.PI / 2;


// Add the floor to the scene.
scene.add(floor);


// ============================================================
// 7. CREATE THE FLY PLACEHOLDER
// ============================================================

// The fly is a Group so all of its parts can be
// controlled as one object.

const fly = new THREE.Group();


// ------------------------------------------------------------
// Fly Body
// ------------------------------------------------------------

const bodyGeometry = new THREE.SphereGeometry(
  0.35,
  16,
  16
);


const bodyMaterial = new THREE.MeshBasicMaterial({
  color: 0x222222
});


const body = new THREE.Mesh(
  bodyGeometry,
  bodyMaterial
);


// Make the body longer than it is tall.
body.scale.set(1.5, 0.8, 0.8);


// Add body to the fly.
fly.add(body);


// ------------------------------------------------------------
// Fly Head
// ------------------------------------------------------------

const headGeometry = new THREE.SphereGeometry(
  0.2,
  16,
  16
);


const head = new THREE.Mesh(
  headGeometry,
  bodyMaterial
);


// Position the head in front of the body.
head.position.z = -0.35;


// Add head to the fly.
fly.add(head);


// ------------------------------------------------------------
// Fly Wings
// ------------------------------------------------------------

const wingGeometry = new THREE.PlaneGeometry(
  0.7,
  0.35
);


const wingMaterial = new THREE.MeshBasicMaterial({
  color: 0xdddddd,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide
});


// Left wing
const leftWing = new THREE.Mesh(
  wingGeometry,
  wingMaterial
);

leftWing.position.set(-0.35, 0.15, 0);
leftWing.rotation.z = -0.3;

fly.add(leftWing);


// Right wing
const rightWing = new THREE.Mesh(
  wingGeometry,
  wingMaterial
);

rightWing.position.set(0.35, 0.15, 0);
rightWing.rotation.z = 0.3;

fly.add(rightWing);


// ------------------------------------------------------------
// Fly Position
// ------------------------------------------------------------

// Place the fly slightly above the floor.
fly.position.set(0, 0.5, 0);


// Add the fly to the scene.
scene.add(fly);


// ============================================================
// 8. CREATE FLY CONTROLLER
// ============================================================

// The controller handles the fly's movement,
// rotation, velocity and physics state.

const flyController = new FlyController(fly);


// ============================================================
// 9. MOUSE CAMERA CONTROL
// ============================================================

// Lock the mouse when the scene is clicked.
renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});


// Listen for mouse movement.
document.addEventListener('mousemove', (event) => {

  // Ignore movement unless the pointer is locked.
  if (document.pointerLockElement !== renderer.domElement) {
    return;
  }


  // Horizontal mouse movement controls yaw.
  yaw -= event.movementX * mouseSensitivity;


  // Vertical mouse movement controls pitch.
  pitch -= event.movementY * mouseSensitivity;


  // Prevent the camera from looking completely upside down.
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
    window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(
    window.innerWidth,
    window.innerHeight
  );
});


// ============================================================
// 11. CAMERA MOVEMENT SETTINGS
// ============================================================

// Controls how quickly the camera moves.
const moveSpeed = 0.08;


// ============================================================
// 12. MAIN SIMULATION / GAME LOOP
// ============================================================

function animate() {

  // Ask the browser to run this function again
  // on the next animation frame.
  requestAnimationFrame(animate);


  // ==========================================================
  // FLY PHYSICS TEST
  // ==========================================================

  // Temporary command used to test acceleration,
  // velocity and drag.

  flyController.move('forward');


  // Update the fly's position using its current velocity.
  flyController.update();


  // ==========================================================
  // CAMERA-RELATIVE MOVEMENT
  // ==========================================================

  // Get the direction the camera is currently facing.
  const forward = new THREE.Vector3();

  camera.getWorldDirection(forward);


  // Only move across the ground.
  forward.y = 0;


  // Keep movement speed consistent.
  forward.normalize();


  // Create a vector representing the camera's right direction.
  const right = new THREE.Vector3();

  right.crossVectors(
    forward,
    camera.up
  ).normalize();


  // ==========================================================
  // KEYBOARD CAMERA MOVEMENT
  // ==========================================================

  // Move forward.
  if (keys['w'] || keys['arrowup']) {
    camera.position.addScaledVector(
      forward,
      moveSpeed
    );
  }


  // Move backward.
  if (keys['s'] || keys['arrowdown']) {
    camera.position.addScaledVector(
      forward,
      -moveSpeed
    );
  }


  // Move left.
  if (keys['a'] || keys['arrowleft']) {
    camera.position.addScaledVector(
      right,
      -moveSpeed
    );
  }


  // Move right.
  if (keys['d'] || keys['arrowright']) {
    camera.position.addScaledVector(
      right,
      moveSpeed
    );
  }


  // ==========================================================
  // CAMERA ROTATION
  // ==========================================================

  // YXZ allows yaw and pitch to be controlled independently.
  camera.rotation.order = 'YXZ';


  // Horizontal rotation.
  camera.rotation.y = yaw;


  // Vertical rotation.
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
// 13. START THE SIMULATION
// ============================================================

// Calling animate() starts the continuous simulation loop.
animate();