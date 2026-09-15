// ============================================================
// FLY BRAIN PROJECT
// Phase 1 — 3D Simulation Environment
// Step 4B — Mouse Camera Look
// ============================================================

import * as THREE from 'three';
import './style.css';
import { FlyController } from './fly/FlyController'; // Controller for the fly

// ============================================================
// 1. KEYBOARD INPUT
// ============================================================

// Stores the current state of keyboard keys.
//
// Example:
// keys["w"] = true  → W is currently being held
// keys["w"] = false → W is not being held
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

// Yaw controls horizontal camera rotation.
// Positive/negative values rotate the camera left and right.
let yaw = 0;


// Pitch controls vertical camera rotation.
// Positive/negative values make the camera look up and down.
let pitch = 0;


// Controls how sensitive the mouse is.
const mouseSensitivity = 0.002;


// ============================================================
// 3. CREATE THE 3D WORLD
// ============================================================

// The Scene is the main container for everything in our
// virtual environment.
const scene = new THREE.Scene();


// Set the background to white.
scene.background = new THREE.Color(0xffffff);


// ============================================================
// 4. CREATE THE CAMERA
// ============================================================

// PerspectiveCamera creates a camera that behaves like
// a real-world camera.
//
// Arguments:
// 75   → field of view
// aspect ratio → width / height
// 0.1  → nearest visible distance
// 1000 → farthest visible distance
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);


// Initial camera position.
//
// X → left/right
// Y → up/down
// Z → forward/backward
camera.position.set(0, 2, 5);


// ============================================================
// 5. CREATE THE RENDERER
// ============================================================

// The renderer converts our 3D scene into pixels that
// the browser can display.
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

// Create a large flat plane.
//
// 20 × 20 gives us a simple starting environment.
const floorGeometry = new THREE.PlaneGeometry(20, 20);


// Create a simple light-gray material.
const floorMaterial = new THREE.MeshBasicMaterial({
  color: 0xf5f5f5,
  side: THREE.DoubleSide
});


// Combine the geometry and material into a mesh.
const floor = new THREE.Mesh(
  floorGeometry,
  floorMaterial
);


// Rotate the plane so it lies horizontally.
//
// PlaneGeometry is normally vertical.
// Rotating it 90 degrees puts it on the ground.
floor.rotation.x = -Math.PI / 2;


// Add the floor to the scene.
scene.add(floor);


// ============================================================
// 7. CREATE THE FLY PLACEHOLDER
// ============================================================

// We use a THREE.Group so multiple objects can behave
// as one fly.
//
// Later this placeholder will be replaced with a proper
// fly model and eventually connected to the neural simulation.
const fly = new THREE.Group();


// -------------------------
// Fly Body
// -------------------------

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


// -------------------------
// Fly Head
// -------------------------

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


// -------------------------
// Fly Wings
// -------------------------

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


// -------------------------
// Fly Position
// -------------------------

// Place the fly slightly above the floor.
fly.position.set(0, 0.5, 0);


// Add the fly to the scene.
scene.add(fly);
const flyController = new FlyController(fly);

// ============================================================
// 8. MOUSE CAMERA CONTROL
// ============================================================

// Clicking the 3D scene locks the mouse pointer to the
// browser window.
//
// This gives us the same basic behavior used by many
// first-person/third-person games.
renderer.domElement.addEventListener('click', () => {
  renderer.domElement.requestPointerLock();
});


// Listen for mouse movement.
document.addEventListener('mousemove', (event) => {

  // Ignore mouse movement unless the pointer is locked.
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
// 9. HANDLE BROWSER RESIZING
// ============================================================

// Update the camera and renderer when the browser window
// changes size.
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
// 10. MOVEMENT SETTINGS
// ============================================================

// Controls how quickly the camera moves.
const moveSpeed = 0.08;


// ============================================================
// 11. MAIN SIMULATION / GAME LOOP
// ============================================================

// This function runs continuously.
//
// Eventually this loop will become the heart of our
// biological simulation:
//
// Environment
//      ↓
// Sensory input
//      ↓
// Neural simulation
//      ↓
// Motor output
//      ↓
// Fly movement
//      ↓
// Environment
//      ↓
// ...
function animate() {

  //const flyDirection = new THREE.Vector3(1, 0, 0);
  flyController.move('up');

  // Ask the browser to run this function again on the
  // next animation frame.
  requestAnimationFrame(animate);

// ----------------------------------------------------------
// Camera-relative movement
// ----------------------------------------------------------

// Get the direction the camera is currently facing.
const forward = new THREE.Vector3();

camera.getWorldDirection(forward);


// We only want movement across the ground.
// Ignore the camera's vertical direction.
forward.y = 0;


// Normalize the vector so movement speed stays consistent.
forward.normalize();


// Create a vector representing the camera's right direction.
const right = new THREE.Vector3();

right.crossVectors(
  forward,
  camera.up
).normalize();

// ----------------------------------------------------------
// Keyboard movement
// ----------------------------------------------------------

// Move forward/backward
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

// Move left/right
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

  // ----------------------------------------------------------
  // Apply mouse-controlled camera rotation
  // ----------------------------------------------------------

  // YXZ rotation order allows us to control yaw and pitch
  // independently without unwanted rotation behavior.
  camera.rotation.order = 'YXZ';


  // Horizontal rotation
  camera.rotation.y = yaw;


  // Vertical rotation
  camera.rotation.x = pitch;


  // ----------------------------------------------------------
  // Render the scene
  // ----------------------------------------------------------

  renderer.render(
    scene,
    camera
  );
}


// ============================================================
// 12. START THE SIMULATION
// ============================================================

// Defining animate() isn't enough.
// Calling it actually starts the continuous render loop.
animate();