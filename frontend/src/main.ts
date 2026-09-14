import * as THREE from 'three';
import './style.css';

// 1. Create the 3D world
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// 2. Create the camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, 2, 5);

// 3. Create the renderer
const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);

// 4. Create a simple floor
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

// 5. Create a simple fly placeholder

const fly = new THREE.Group();

// Body
const bodyGeometry = new THREE.SphereGeometry(0.35, 16, 16);
const bodyMaterial = new THREE.MeshBasicMaterial({
  color: 0x222222
});

const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.scale.set(1.5, 0.8, 0.8);

fly.add(body);

// Head
const headGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const head = new THREE.Mesh(headGeometry, bodyMaterial);

head.position.z = -0.35;

fly.add(head);

// Wings
const wingGeometry = new THREE.PlaneGeometry(0.7, 0.35);
const wingMaterial = new THREE.MeshBasicMaterial({
  color: 0xdddddd,
  transparent: true,
  opacity: 0.7,
  side: THREE.DoubleSide
});

const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
leftWing.position.set(-0.35, 0.15, 0);
leftWing.rotation.z = -0.3;

fly.add(leftWing);

const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
rightWing.position.set(0.35, 0.15, 0);
rightWing.rotation.z = 0.3;

fly.add(rightWing);

// Put the fly slightly above the floor
fly.position.set(0, 0.5, 0);

scene.add(fly);

// 6. Handle browser resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 7. Game/simulation loop
function animate() {
  requestAnimationFrame(animate);

  fly.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();