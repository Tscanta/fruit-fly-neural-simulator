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

// 5. Create a cube as our temporary object
const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);

const cubeMaterial = new THREE.MeshBasicMaterial({
  color: 0x222222
});

const cube = new THREE.Mesh(
  cubeGeometry,
  cubeMaterial
);

cube.position.y = 0.5;

scene.add(cube);

// 6. Handle browser resizing
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 7. Game/simulation loop
function animate() {
  requestAnimationFrame(animate);

  cube.rotation.y += 0.01;

  renderer.render(scene, camera);
}

animate();