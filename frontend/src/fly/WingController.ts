import * as THREE from 'three';

export class WingController {
  private leftWingPivot: THREE.Group;
  private rightWingPivot: THREE.Group;

  private flapTime = 0;

  private flapFrequency = 8;

  private strokeAngle =
    THREE.MathUtils.degToRad(45);

  private pitchAngle =
    THREE.MathUtils.degToRad(8);

  constructor(
    leftWingPivot: THREE.Group,
    rightWingPivot: THREE.Group
  ) {
    this.leftWingPivot = leftWingPivot;
    this.rightWingPivot = rightWingPivot;
  }

  update(deltaTime: number) {
    this.flapTime += deltaTime;

    const phase =
      this.flapTime *
      this.flapFrequency *
      Math.PI *
      2;

    const stroke =
      Math.sin(phase) *
      this.strokeAngle;

    const pitch =
      Math.sin(
        phase + Math.PI / 2
      ) *
      this.pitchAngle;

    // Both wings flap up and down together

    this.leftWingPivot.rotation.x = stroke;
    this.rightWingPivot.rotation.x = stroke;

    // Small mirrored wing twist

    this.leftWingPivot.rotation.z = pitch;
    this.rightWingPivot.rotation.z = -pitch;
  }
}