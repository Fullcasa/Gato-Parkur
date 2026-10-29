import * as THREE from 'three';
import { PawStyle } from '../types/game';

/**
 * Procedural 3D First-Person Cat Features.
 * Includes prominent Cat Paws, dynamic Cat Ears at screen corners,
 * and cute whiskers/muzzle that clearly establish feline POV.
 */
export class CatPawsController {
  public group: THREE.Group;
  private leftPawGroup: THREE.Group;
  private rightPawGroup: THREE.Group;

  // Cat Ears at top corners of view
  private leftEarGroup: THREE.Group;
  private rightEarGroup: THREE.Group;

  // Cat Nose & Whiskers
  private muzzleGroup: THREE.Group;

  // Materials for dynamic breed skinning
  private furMaterial: THREE.MeshStandardMaterial;
  private accentMaterial: THREE.MeshStandardMaterial;
  private padMaterial: THREE.MeshStandardMaterial;
  private innerEarMaterial: THREE.MeshStandardMaterial;
  private clawMaterial: THREE.MeshStandardMaterial;
  private whiskerMaterial: THREE.LineBasicMaterial;

  private leftClaws: THREE.Mesh[] = [];
  private rightClaws: THREE.Mesh[] = [];

  // Animation states
  private walkPhase: number = 0;
  private walkWeight: number = 0;
  private idleTime: number = 0;
  public isSwiping: boolean = false;
  private swipeProgress: number = 0;
  private landSquash: number = 0;
  private jumpExtension: number = 0;
  private wetPawShakeTime: number = 0;
  private smoothTurnTilt: number = 0;
  private smoothPinBack: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'FirstPersonCatPOV';

    // Materials with PBR properties
    this.furMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8d8be,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.accentMaterial = new THREE.MeshStandardMaterial({
      color: 0x3a2318,
      roughness: 0.8,
      metalness: 0.05,
    });

    this.padMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a2e2b,
      roughness: 0.45,
      metalness: 0.1,
    });

    this.innerEarMaterial = new THREE.MeshStandardMaterial({
      color: 0xfca5a5, // soft pink inner ear
      roughness: 0.6,
      metalness: 0.05,
    });

    this.clawMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.2,
    });

    this.whiskerMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      linewidth: 1.5,
    });

    // 1. Build Left & Right Paws
    const leftPawData = this.buildSinglePaw(false);
    this.leftPawGroup = leftPawData.group;
    this.leftClaws = leftPawData.claws;
    this.leftPawGroup.position.set(-0.25, -0.27, -0.52);

    const rightPawData = this.buildSinglePaw(true);
    this.rightPawGroup = rightPawData.group;
    this.rightClaws = rightPawData.claws;
    this.rightPawGroup.position.set(0.25, -0.27, -0.52);

    this.group.add(this.leftPawGroup);
    this.group.add(this.rightPawGroup);

    // 2. Build Cat Ears at top corners (framing upper peripheral vision)
    this.leftEarGroup = this.buildCatEar(false);
    this.leftEarGroup.position.set(-0.29, 0.22, -0.42);
    this.leftEarGroup.rotation.set(0.08, 0.12, 0.22);

    this.rightEarGroup = this.buildCatEar(true);
    this.rightEarGroup.position.set(0.29, 0.22, -0.42);
    this.rightEarGroup.rotation.set(0.08, -0.12, -0.22);

    this.group.add(this.leftEarGroup);
    this.group.add(this.rightEarGroup);

    // 3. Build Cat Muzzle & Whiskers
    this.muzzleGroup = this.buildMuzzleAndWhiskers();
    this.muzzleGroup.position.set(0, -0.24, -0.42);
    this.group.add(this.muzzleGroup);
  }

  /**
   * Constructs a cute 3D cat ear with outer fur and inner pink flap
   */
  private buildCatEar(isRight: boolean): THREE.Group {
    const earGroup = new THREE.Group();

    // Outer triangular ear shell (apex points upwards, subtly flattened)
    const earGeo = new THREE.ConeGeometry(0.045, 0.085, 4);
    earGeo.scale(0.85, 1.0, 0.28);
    earGeo.rotateZ(isRight ? -0.12 : 0.12);
    const earMesh = new THREE.Mesh(earGeo, this.accentMaterial);
    earGroup.add(earMesh);

    // Inner pink ear tuft
    const innerGeo = new THREE.ConeGeometry(0.032, 0.065, 4);
    innerGeo.scale(0.8, 1.0, 0.18);
    innerGeo.rotateZ(isRight ? -0.12 : 0.12);
    const innerMesh = new THREE.Mesh(innerGeo, this.innerEarMaterial);
    innerMesh.position.set(0, -0.006, 0.012);
    earGroup.add(innerMesh);

    return earGroup;
  }

  /**
   * Constructs cat nose and whisker lines
   */
  private buildMuzzleAndWhiskers(): THREE.Group {
    const muzzle = new THREE.Group();

    // Cute pink/dark nose tip
    const noseGeo = new THREE.ConeGeometry(0.022, 0.025, 4);
    noseGeo.rotateX(Math.PI);
    const noseMesh = new THREE.Mesh(noseGeo, this.innerEarMaterial);
    noseMesh.position.set(0, 0, 0);
    muzzle.add(noseMesh);

    // Left and Right Whiskers
    [-1, 1].forEach((side) => {
      for (let i = 0; i < 3; i++) {
        const yOffset = (i - 1) * 0.012;
        const whiskerPoints = [
          new THREE.Vector3(side * 0.02, yOffset, 0),
          new THREE.Vector3(side * 0.14, yOffset - 0.015, -0.05),
          new THREE.Vector3(side * 0.22, yOffset - 0.035, -0.1),
        ];
        const whiskerGeo = new THREE.BufferGeometry().setFromPoints(whiskerPoints);
        const whisker = new THREE.Line(whiskerGeo, this.whiskerMaterial);
        muzzle.add(whisker);
      }
    });

    return muzzle;
  }

  /**
   * Constructs a multi-part feline paw
   */
  private buildSinglePaw(isRight: boolean): { group: THREE.Group; claws: THREE.Mesh[] } {
    const pawRoot = new THREE.Group();
    const claws: THREE.Mesh[] = [];

    // 1. Forearm (tapered limb)
    const armGeo = new THREE.CylinderGeometry(0.068, 0.052, 0.48, 16);
    armGeo.rotateX(Math.PI / 3.6);
    const armMesh = new THREE.Mesh(armGeo, this.furMaterial);
    armMesh.position.set(0, -0.05, 0.12);
    pawRoot.add(armMesh);

    // 2. Wrist / Sock Accent
    const sockGeo = new THREE.CylinderGeometry(0.054, 0.062, 0.15, 16);
    sockGeo.rotateX(Math.PI / 3.6);
    const sockMesh = new THREE.Mesh(sockGeo, this.accentMaterial);
    sockMesh.position.set(0, -0.16, -0.03);
    pawRoot.add(sockMesh);

    // 3. Main Paw Mitt
    const mittGeo = new THREE.SphereGeometry(0.068, 16, 14);
    mittGeo.scale(1.05, 0.75, 1.25);
    const mittMesh = new THREE.Mesh(mittGeo, this.accentMaterial);
    mittMesh.position.set(0, -0.19, -0.14);
    pawRoot.add(mittMesh);

    // 4. Large Central Paw Pad
    const mainPadGeo = new THREE.SphereGeometry(0.042, 14, 12);
    mainPadGeo.scale(1.2, 0.45, 1.0);
    const mainPadMesh = new THREE.Mesh(mainPadGeo, this.padMaterial);
    mainPadMesh.position.set(0, -0.22, -0.14);
    mainPadMesh.rotateX(0.2);
    pawRoot.add(mainPadMesh);

    // 5. Four Round Toe Beans & Retractable Claws
    const toeAngles = [-0.042, -0.014, 0.014, 0.042];
    const toeZ = [-0.19, -0.21, -0.21, -0.19];
    const toeY = [-0.20, -0.205, -0.205, -0.20];

    for (let i = 0; i < 4; i++) {
      const toeGroup = new THREE.Group();
      toeGroup.position.set(toeAngles[i], toeY[i], toeZ[i]);

      // Toe fur cap
      const toeFurGeo = new THREE.SphereGeometry(0.024, 12, 10);
      toeFurGeo.scale(0.95, 0.9, 1.15);
      const toeFurMesh = new THREE.Mesh(toeFurGeo, this.accentMaterial);
      toeGroup.add(toeFurMesh);

      // Toe pad bean (underneath)
      const beanGeo = new THREE.SphereGeometry(0.018, 12, 10);
      beanGeo.scale(1.0, 0.5, 1.0);
      const beanMesh = new THREE.Mesh(beanGeo, this.padMaterial);
      beanMesh.position.set(0, -0.015, 0);
      toeGroup.add(beanMesh);

      // Sharp retractable claw hook
      const clawGeo = new THREE.ConeGeometry(0.008, 0.028, 8);
      clawGeo.rotateX(Math.PI / 2 + 0.35);
      const clawMesh = new THREE.Mesh(clawGeo, this.clawMaterial);
      clawMesh.position.set(0, -0.006, -0.024);
      clawMesh.scale.set(0.6, 0.6, 0.6);
      toeGroup.add(clawMesh);
      claws.push(clawMesh);

      pawRoot.add(toeGroup);
    }

    pawRoot.rotation.z = isRight ? -0.12 : 0.12;
    return { group: pawRoot, claws };
  }

  /**
   * Dynamically restyles paws & ears based on selected breed
   */
  public updateBreedStyle(style: PawStyle) {
    this.furMaterial.color.set(style.furColor);
    this.accentMaterial.color.set(style.accentColor);
    this.padMaterial.color.set(style.padColor);
    this.clawMaterial.color.set(style.clawColor);

    if (style.patternType === 'hairless') {
      this.furMaterial.roughness = 0.5;
      this.accentMaterial.roughness = 0.5;
      this.innerEarMaterial.color.set(0xfb7185);
    } else if (style.patternType === 'fluffy') {
      this.furMaterial.roughness = 0.95;
      this.accentMaterial.roughness = 0.9;
      this.innerEarMaterial.color.set(0xfca5a5);
    } else {
      this.furMaterial.roughness = 0.85;
      this.accentMaterial.roughness = 0.8;
      this.innerEarMaterial.color.set(style.padColor);
    }
  }

  public swipe() {
    this.isSwiping = true;
    this.swipeProgress = 0;
  }

  public triggerLandSquash() {
    this.landSquash = 1.0;
  }

  public triggerWetShake() {
    this.wetPawShakeTime = 1.5;
  }

  /**
   * Update per-frame animations
   */
  public update(
    delta: number,
    isMoving: boolean,
    isSprinting: boolean,
    isGrounded: boolean,
    velocity: THREE.Vector3,
    turningYaw: number = 0
  ) {
    this.idleTime += delta;

    // Movement speeds
    const speedMult = isSprinting ? 1.6 : 1.0;
    const moveSpeed = velocity.length();

    // Rhythmic gait cycle - advance only when moving, damped weight smoothly decays
    if (isMoving && isGrounded) {
      this.walkPhase += delta * 9.0 * speedMult;
    }
    this.walkWeight = THREE.MathUtils.damp(this.walkWeight, isMoving && isGrounded ? 1.0 : 0.0, 8, delta);

    this.jumpExtension = THREE.MathUtils.damp(this.jumpExtension, !isGrounded ? 1.0 : 0.0, 10, delta);
    this.landSquash = THREE.MathUtils.damp(this.landSquash, 0.0, 10, delta);

    if (this.isSwiping) {
      this.swipeProgress += delta * 4.5;
      if (this.swipeProgress >= 1.0) {
        this.isSwiping = false;
        this.swipeProgress = 0;
      }
    }

    if (this.wetPawShakeTime > 0) {
      this.wetPawShakeTime = Math.max(0, this.wetPawShakeTime - delta);
    }

    // Retractable claws
    const clawScale = !isGrounded || isSprinting || this.isSwiping ? 1.4 : 0.65;
    for (const claw of this.leftClaws) claw.scale.setScalar(clawScale);
    for (const claw of this.rightClaws) claw.scale.setScalar(clawScale);

    // Quadruped rhythmic stepping - fully damped to zero jitter when stopping
    const leftStep = Math.sin(this.walkPhase);
    const rightStep = Math.sin(this.walkPhase + Math.PI);
    const stepIntensity = Math.min(moveSpeed / 10, 1.0) * 0.045 * this.walkWeight;

    // Idle breathing (gentle, smooth)
    const idleBreath = Math.sin(this.idleTime * 2.0) * 0.006;

    // Wet paw shake (smooth, cute, non-shaking)
    const wetShake = this.wetPawShakeTime > 0 ? Math.sin(this.wetPawShakeTime * 20) * 0.015 : 0;

    // Base positions
    const baseLeftX = -0.24 + wetShake;
    const baseRightX = 0.24;
    const baseY = -0.27 - this.landSquash * 0.06;
    const baseZ = -0.50 - this.jumpExtension * 0.08;

    // Left Paw
    this.leftPawGroup.position.set(
      baseLeftX,
      baseY + idleBreath + (leftStep > 0 ? leftStep * stepIntensity : 0),
      baseZ + leftStep * stepIntensity * 0.7
    );
    this.leftPawGroup.rotation.x = leftStep * 0.22 * this.walkWeight - this.jumpExtension * 0.32 + this.landSquash * 0.2;

    // Right Paw
    let rightY = baseY + idleBreath + (rightStep > 0 ? rightStep * stepIntensity : 0);
    let rightZ = baseZ + rightStep * stepIntensity * 0.7;
    let rightRotX = rightStep * 0.22 * this.walkWeight - this.jumpExtension * 0.32 + this.landSquash * 0.2;
    let rightRotY = 0;

    if (this.isSwiping) {
      const swipeArc = Math.sin(this.swipeProgress * Math.PI);
      rightY += swipeArc * 0.16;
      rightZ -= swipeArc * 0.22;
      rightRotX += swipeArc * 0.85;
      rightRotY -= swipeArc * 0.95;
    }

    this.rightPawGroup.position.set(baseRightX, rightY, rightZ);
    this.rightPawGroup.rotation.x = rightRotX;
    this.rightPawGroup.rotation.y = rightRotY;

    // Cat Ears Dynamics (rock solid, smooth, zero trembling)
    this.smoothTurnTilt = THREE.MathUtils.damp(this.smoothTurnTilt, turningYaw * 0.08, 8, delta);
    this.smoothPinBack = THREE.MathUtils.damp(this.smoothPinBack, (!isGrounded || isSprinting) ? 0.14 : 0.0, 6, delta);

    this.leftEarGroup.rotation.set(0.08 + this.smoothPinBack, 0.12 + this.smoothTurnTilt, 0.22);
    this.rightEarGroup.rotation.set(0.08 + this.smoothPinBack, -0.12 + this.smoothTurnTilt, -0.22);

    // Muzzle & Whiskers subtle breathing
    this.muzzleGroup.rotation.y = this.smoothTurnTilt * 0.3;
    this.muzzleGroup.position.y = -0.24 + idleBreath * 0.4;
  }
}
