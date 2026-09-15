import * as THREE from 'three';

export class FlyController {
  private fly: THREE.Group;
  private moveSpeed = 0.03;

  constructor(fly: THREE.Group) {
    this.fly = fly;
  }

  move(direction: THREE.Vector3) {
    if (direction.lengthSq() === 0) return;

    direction.normalize();

    // Move the fly
    this.fly.position.addScaledVector(direction, this.moveSpeed);

    // Rotate the fly to face its movement direction
    this.fly.rotation.y = Math.atan2(direction.x, direction.z);
  }

  getPosition(): THREE.Vector3 {
    return this.fly.position;
  }

  getObject(): THREE.Group {
    return this.fly;
  }
}