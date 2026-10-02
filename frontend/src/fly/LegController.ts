import * as THREE from 'three';

export type LegName =
  | 'frontLeft'
  | 'frontRight'
  | 'middleLeft'
  | 'middleRight'
  | 'rearLeft'
  | 'rearRight';

export class LegController {
  private legs: Record<LegName, THREE.Object3D>;

  private walkTime = 0;

  private walking = false;

  private walkSpeed = 8;

  constructor(
    legs: Record<LegName, THREE.Object3D>
  ) {
    this.legs = legs;
  }

  setWalking(walking: boolean) {
    this.walking = walking;
  }

  update(deltaTime: number) {
    if (!this.walking) {
      this.resetLegs(deltaTime);
      return;
    }

    this.walkTime +=
      deltaTime * this.walkSpeed;

    this.animateLeg(
      this.legs.frontLeft,
      0
    );

    this.animateLeg(
      this.legs.frontRight,
      Math.PI
    );

    this.animateLeg(
      this.legs.middleLeft,
      Math.PI
    );

    this.animateLeg(
      this.legs.middleRight,
      0
    );

    this.animateLeg(
      this.legs.rearLeft,
      0
    );

    this.animateLeg(
      this.legs.rearRight,
      Math.PI
    );
  }

  private animateLeg(
    leg: THREE.Object3D,
    phase: number
  ) {
    const swing =
      Math.sin(
        this.walkTime + phase
      );

    const lift =
      Math.max(
        0,
        Math.sin(
          this.walkTime + phase
        )
      );

    leg.rotation.x =
      swing * 0.25;

    leg.rotation.z =
      lift * 0.12;
  }

  private resetLegs(
    deltaTime: number
  ) {
    const amount =
      Math.min(
        deltaTime * 8,
        1
      );

    for (
      const leg of Object.values(
        this.legs
      )
    ) {
      leg.rotation.x =
        THREE.MathUtils.lerp(
          leg.rotation.x,
          0,
          amount
        );

      leg.rotation.z =
        THREE.MathUtils.lerp(
          leg.rotation.z,
          0,
          amount
        );
    }
  }
}