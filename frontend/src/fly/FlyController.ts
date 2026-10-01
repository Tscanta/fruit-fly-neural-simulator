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

  private acceleration = 7.2;
  private maxSpeed = 4.8;
  private drag = 0.90;

  private turnSpeed = 0.12;

  private maxBankAngle = Math.PI / 8;
  private bankSpeed = 0.08;

  // Environment limits
  private minX = -9;
  private maxX = 9;

  private minY = 0.2;
  private maxY = 8;

  private minZ = -9;
  private maxZ = 9;

  constructor(fly: THREE.Group) {
    this.fly = fly;
  }

  move(command: FlyMovement) {
    const direction = new THREE.Vector3();

    switch (command) {
      case 'forward':
        direction.set(0, 0, -1);
        break;

      case 'backward':
        direction.set(0, 0, 1);
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

    if (direction.lengthSq() === 0) return;

    direction.normalize();

    // Apply acceleration at approximately 60 updates per second.
    this.velocity.addScaledVector(
      direction,
      this.acceleration / 60
    );

    if (this.velocity.length() > this.maxSpeed) {
      this.velocity.setLength(this.maxSpeed);
    }

    // Smoothly rotate toward movement direction.
    const targetRotation = Math.atan2(
      direction.x,
      direction.z
    );

    this.fly.rotation.y = THREE.MathUtils.lerp(
      this.fly.rotation.y,
      targetRotation,
      this.turnSpeed
    );
  }

  update(deltaTime: number) {
    // Move using seconds.
    this.fly.position.addScaledVector(
      this.velocity,
      deltaTime
    );

    // Keep the fly inside the simulation area.
    this.fly.position.x = THREE.MathUtils.clamp(
      this.fly.position.x,
      this.minX,
      this.maxX
    );

    this.fly.position.y = THREE.MathUtils.clamp(
      this.fly.position.y,
      this.minY,
      this.maxY
    );

    this.fly.position.z = THREE.MathUtils.clamp(
      this.fly.position.z,
      this.minZ,
      this.maxZ
    );

    // Apply frame-rate-independent drag.
    const dragFactor = Math.pow(
      this.drag,
      deltaTime * 60
    );

    this.velocity.multiplyScalar(dragFactor);

    // Bank the fly while turning.
    const turnAmount = this.velocity.x;

    const targetBank = THREE.MathUtils.clamp(
      -turnAmount * 0.15,
      -this.maxBankAngle,
      this.maxBankAngle
    );

    this.fly.rotation.z = THREE.MathUtils.lerp(
      this.fly.rotation.z,
      targetBank,
      this.bankSpeed
    );
  }

  getPosition(): THREE.Vector3 {
    return this.fly.position;
  }

  getObject(): THREE.Group {
    return this.fly;
  }
}