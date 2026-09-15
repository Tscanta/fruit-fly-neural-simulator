import * as THREE from 'three';

export type FlyMovement =
  | 'forward'
  | 'backward'
  | 'left'
  | 'right'
  | 'up'
  | 'down';

export class FlyController {
  private fly: THREE.Group;
  private moveSpeed = 0.03;

  constructor(fly: THREE.Group) {
    this.fly = fly;
  }

  move(command: FlyMovement) {
    const direction = new THREE.Vector3();

    switch (command) {
      case 'forward':
        direction.set(0, 0, 1);
        break;

      case 'backward':
        direction.set(0, 0, -1);
        break;

      case 'left':
        direction.set(-1, 0, 0);
        break;

      case 'right':
        direction.set(1, 0, 0);
        break;

      case 'up':
        direction.set(0, 1, 0);
        break;

      case 'down':
        direction.set(0, -1, 0);
        break;
    }

    this.fly.position.addScaledVector(direction, this.moveSpeed);

    if (direction.lengthSq() > 0) {
      this.fly.rotation.y = Math.atan2(direction.x, direction.z);
    }
  }

  getPosition(): THREE.Vector3 {
    return this.fly.position;
  }

  getObject(): THREE.Group {
    return this.fly;
  }
}