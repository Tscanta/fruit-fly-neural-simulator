import * as THREE from 'three';


// creating a dedicated object responsible for controlling the fly.
export class FlyController {
  private fly: THREE.Group;

  // Current movement speed of the fly.
  private moveSpeed = 0.03;

  constructor(fly: THREE.Group) {
    this.fly = fly;
  }

  // Move the fly in a specific direction.
  move(direction: THREE.Vector3) {
    this.fly.position.addScaledVector(
      direction,
      this.moveSpeed
    );
  }

  // Get the fly's current position.
  getPosition(): THREE.Vector3 {
    return this.fly.position;
  }

  // Get the actual Three.js fly object.
  getObject(): THREE.Group {
    return this.fly;
  }
}