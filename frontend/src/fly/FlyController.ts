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

  private velocity = new THREE.Vector3();

  private acceleration = 0.002;
  private maxSpeed = 0.08;
  private drag = 0.90;

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
  this.applyMovement(direction);
}

private applyMovement(direction: THREE.Vector3) {
  if (direction.lengthSq() === 0) return;

  direction.normalize();

  this.velocity.addScaledVector(
    direction,
    this.acceleration
  );

  if (this.velocity.length() > this.maxSpeed) {
    this.velocity.setLength(this.maxSpeed);
  }

  this.fly.rotation.y = Math.atan2(
    direction.x,
    direction.z
  );
}

  update() {
    // Apply current velocity to the fly.
    this.fly.position.add(this.velocity);

    // Gradually reduce velocity when no acceleration
    // is being applied.
    this.velocity.multiplyScalar(this.drag);
  }

  getPosition(): THREE.Vector3 {
    return this.fly.position;
  }

  getObject(): THREE.Group {
    return this.fly;
  }
}