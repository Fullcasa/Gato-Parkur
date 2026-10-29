import * as THREE from 'three';
import { FoodItemData, FoodType } from '../types/game';

/**
 * Procedural 3D collectible food items for GatoParkour 3D.
 * Composite multi-part Three.js groups with rotating animations & particle auras.
 */
export class FoodItemCollectible {
  public data: FoodItemData;
  public group: THREE.Group;
  private foodMeshGroup: THREE.Group;
  private auraRing: THREE.Mesh;
  private sparkleParticles: THREE.Points;
  private basePosition: THREE.Vector3;
  private timeOffset: number;
  public isCollected: boolean = false;

  constructor(data: FoodItemData) {
    this.data = data;
    this.basePosition = new THREE.Vector3(...data.position);
    this.timeOffset = Math.random() * Math.PI * 2;

    this.group = new THREE.Group();
    this.group.position.copy(this.basePosition);

    this.foodMeshGroup = new THREE.Group();
    this.createModel(data.type, data.color);
    this.group.add(this.foodMeshGroup);

    // Floating golden glow aura ring beneath food
    const ringGeo = new THREE.RingGeometry(0.35, 0.45, 24);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    this.auraRing = new THREE.Mesh(ringGeo, ringMat);
    this.auraRing.position.y = -0.3;
    this.group.add(this.auraRing);

    // Cute rotating sparkle dust
    const particleCount = 12;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 0.45 + Math.random() * 0.25;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 0.4;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 0.08,
      transparent: true,
      opacity: 0.8,
    });
    this.sparkleParticles = new THREE.Points(particleGeo, particleMat);
    this.group.add(this.sparkleParticles);
  }

  private createModel(type: FoodType, colorHex: string) {
    const mainColor = new THREE.Color(colorHex);

    switch (type) {
      case 'fish': {
        // 1. Fish Body (smooth ellipsoid)
        const bodyGeo = new THREE.SphereGeometry(0.32, 16, 12);
        bodyGeo.scale(1.4, 0.7, 0.35);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: mainColor,
          roughness: 0.3,
          metalness: 0.25,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        this.foodMeshGroup.add(body);

        // 2. Tail Fin
        const tailGeo = new THREE.ConeGeometry(0.18, 0.28, 4);
        tailGeo.rotateZ(Math.PI / 2);
        tailGeo.scale(0.2, 1.2, 1.0);
        const tailMat = new THREE.MeshStandardMaterial({
          color: mainColor.clone().offsetHSL(0, 0, -0.1),
          roughness: 0.4,
        });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(-0.48, 0, 0);
        this.foodMeshGroup.add(tail);

        // 3. Dorsal Fin
        const dorsalGeo = new THREE.ConeGeometry(0.1, 0.2, 3);
        dorsalGeo.rotateZ(-Math.PI / 6);
        const dorsal = new THREE.Mesh(dorsalGeo, tailMat);
        dorsal.position.set(0.05, 0.25, 0);
        this.foodMeshGroup.add(dorsal);

        // 4. Fish Eye
        const eyeGeo = new THREE.SphereGeometry(0.045, 8, 8);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111827 });
        const eyeLeft = new THREE.Mesh(eyeGeo, eyeMat);
        eyeLeft.position.set(0.32, 0.05, 0.11);
        const eyeRight = new THREE.Mesh(eyeGeo, eyeMat);
        eyeRight.position.set(0.32, 0.05, -0.11);
        this.foodMeshGroup.add(eyeLeft);
        this.foodMeshGroup.add(eyeRight);
        break;
      }

      case 'tuna_can': {
        // 1. Can Metal Cylinder
        const canGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.24, 24);
        const canMat = new THREE.MeshStandardMaterial({
          color: 0xd4d4d8,
          metalness: 0.85,
          roughness: 0.25,
        });
        const can = new THREE.Mesh(canGeo, canMat);
        this.foodMeshGroup.add(can);

        // 2. Colorful Label Band
        const labelGeo = new THREE.CylinderGeometry(0.285, 0.285, 0.16, 24, 1, true);
        const labelMat = new THREE.MeshStandardMaterial({
          color: mainColor,
          roughness: 0.5,
          metalness: 0.1,
        });
        const label = new THREE.Mesh(labelGeo, labelMat);
        this.foodMeshGroup.add(label);

        // 3. Pull Ring on Top
        const ringGeo = new THREE.TorusGeometry(0.065, 0.02, 8, 16);
        ringGeo.rotateX(Math.PI / 2);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, metalness: 0.9, roughness: 0.2 });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.set(0.08, 0.13, 0);
        this.foodMeshGroup.add(ring);
        break;
      }

      case 'chicken': {
        // 1. Roasted Drumstick Meat
        const meatGeo = new THREE.SphereGeometry(0.28, 16, 14);
        meatGeo.scale(1.2, 0.9, 0.9);
        const meatMat = new THREE.MeshStandardMaterial({
          color: 0xd97706,
          roughness: 0.65,
          metalness: 0.05,
        });
        const meat = new THREE.Mesh(meatGeo, meatMat);
        meat.position.set(0.08, 0, 0);
        this.foodMeshGroup.add(meat);

        // 2. White Bone Shaft
        const boneGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.32, 12);
        boneGeo.rotateZ(Math.PI / 2);
        const boneMat = new THREE.MeshStandardMaterial({
          color: 0xfafafa,
          roughness: 0.3,
        });
        const bone = new THREE.Mesh(boneGeo, boneMat);
        bone.position.set(-0.25, -0.02, 0);
        this.foodMeshGroup.add(bone);

        // 3. Bone Knobs
        const knobGeo = new THREE.SphereGeometry(0.055, 10, 8);
        const knob1 = new THREE.Mesh(knobGeo, boneMat);
        knob1.position.set(-0.4, 0.02, 0.03);
        const knob2 = new THREE.Mesh(knobGeo, boneMat);
        knob2.position.set(-0.4, -0.04, -0.03);
        this.foodMeshGroup.add(knob1);
        this.foodMeshGroup.add(knob2);
        break;
      }

      case 'milk': {
        // 1. Ceramic Bowl
        const bowlGeo = new THREE.CylinderGeometry(0.32, 0.2, 0.2, 24);
        const bowlMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.2,
          metalness: 0.1,
        });
        const bowl = new THREE.Mesh(bowlGeo, bowlMat);
        this.foodMeshGroup.add(bowl);

        // 2. Fresh White Milk Surface
        const milkGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.02, 24);
        const milkMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.1,
          metalness: 0.05,
        });
        const milk = new THREE.Mesh(milkGeo, milkMat);
        milk.position.set(0, 0.08, 0);
        this.foodMeshGroup.add(milk);
        break;
      }

      case 'catnip': {
        // 1. Green Herb Leaves cluster
        const herbGroup = new THREE.Group();
        const leafMat = new THREE.MeshStandardMaterial({
          color: 0x22c55e,
          roughness: 0.4,
          metalness: 0.05,
        });
        for (let i = 0; i < 5; i++) {
          const leafGeo = new THREE.ConeGeometry(0.12, 0.35, 5);
          const angle = (i / 5) * Math.PI * 2;
          const leaf = new THREE.Mesh(leafGeo, leafMat);
          leaf.position.set(Math.cos(angle) * 0.1, 0.08, Math.sin(angle) * 0.1);
          leaf.rotation.z = Math.sin(angle) * 0.4;
          leaf.rotation.x = Math.cos(angle) * 0.4;
          herbGroup.add(leaf);
        }
        this.foodMeshGroup.add(herbGroup);

        // 2. Golden ribbon tying the bundle
        const ribbonGeo = new THREE.TorusGeometry(0.12, 0.025, 8, 16);
        ribbonGeo.rotateX(Math.PI / 2);
        const ribbonMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.7, roughness: 0.3 });
        const ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
        ribbon.position.set(0, 0.04, 0);
        this.foodMeshGroup.add(ribbon);
        break;
      }

      case 'shrimp': {
        // Curved succulent shrimp
        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.2, -0.1, 0),
          new THREE.Vector3(0, 0.12, 0),
          new THREE.Vector3(0.2, 0.02, 0),
          new THREE.Vector3(0.22, -0.12, 0),
        ]);
        const shrimpGeo = new THREE.TubeGeometry(curve, 16, 0.08, 8, false);
        const shrimpMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          roughness: 0.3,
          metalness: 0.15,
        });
        const shrimp = new THREE.Mesh(shrimpGeo, shrimpMat);
        this.foodMeshGroup.add(shrimp);

        // Shrimp Fan Tail
        const tailGeo = new THREE.ConeGeometry(0.14, 0.2, 4);
        tailGeo.rotateZ(-Math.PI / 3);
        const tailMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.3 });
        const tail = new THREE.Mesh(tailGeo, tailMat);
        tail.position.set(0.25, -0.16, 0);
        this.foodMeshGroup.add(tail);
        break;
      }
    }
  }

  public update(time: number) {
    if (this.isCollected) return;

    // Bobbing up and down
    const bob = Math.sin(time * 3 + this.timeOffset) * 0.12;
    this.group.position.y = this.basePosition.y + bob;

    // Smooth rotation
    this.foodMeshGroup.rotation.y = time * 1.8 + this.timeOffset;
    this.sparkleParticles.rotation.y = -time * 2.2;

    // Pulse aura ring
    const scale = 1.0 + Math.sin(time * 4) * 0.15;
    this.auraRing.scale.set(scale, scale, 1);
  }

  public collect(onCollectBonusScore: number = 0): { points: number; staminaBoost: number; name: string } {
    this.isCollected = true;
    this.data.collected = true;
    this.group.visible = false;
    return {
      points: Math.round(this.data.points * (1 + onCollectBonusScore)),
      staminaBoost: this.data.staminaBoost,
      name: this.data.name,
    };
  }
}
