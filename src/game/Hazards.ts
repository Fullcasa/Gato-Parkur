import * as THREE from 'three';
import { sound } from '../services/sound';

export type HazardType =
  | 'dog'
  | 'mouse'
  | 'rival_cat'
  | 'puddle'
  | 'pigeons'
  | 'clothesline'
  | 'wind_turbine';

export interface HazardEventResult {
  triggered: boolean;
  type: HazardType;
  message: string;
  points: number;
  isPositive: boolean;
  pushback?: THREE.Vector3;
}

/**
 * Interactive rooftop obstacle & event system.
 * Implements dogs, mice, rival cats, water puddles, pigeons, clotheslines, and turbines.
 */
export class HazardsManager {
  public group: THREE.Group;
  private hazards: Array<{
    type: HazardType;
    mesh: THREE.Group;
    position: THREE.Vector3;
    active: boolean;
    update?: (time: number, delta: number) => void;
    checkCollision?: (playerPos: THREE.Vector3) => HazardEventResult | null;
    cooldown?: number;
  }> = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'RooftopHazards';
  }

  public clear() {
    while (this.group.children.length > 0) {
      this.group.remove(this.group.children[0]);
    }
    this.hazards = [];
  }

  /**
   * Spawns hazards tailored to level layout
   */
  public spawnHazardsForLevel(levelId: number) {
    this.clear();

    if (levelId === 1) {
      // Level 1: Friendly suburban roof with mouse chase, water puddle, pigeons, clothesline, and one sleepy dog
      this.addMouse(new THREE.Vector3(18, 8.8, -2));
      this.addWaterPuddle(new THREE.Vector3(-18, 7.8, -4), 2.2);
      this.addPigeonFlock(new THREE.Vector3(0, 9.2, -18));
      this.addClothesline(new THREE.Vector3(12, 10.2, -20), new THREE.Vector3(24, 10.2, -20));
      this.addDog(new THREE.Vector3(42, 13.2, -26));
      this.addRivalCat(new THREE.Vector3(-18, 11.2, -22));
    } else if (levelId === 2) {
      // Level 2: Historic quarter with rival cats on chimneys, dogs on terraces, water puddles, clotheslines
      this.addDog(new THREE.Vector3(22, 13.2, -18));
      this.addRivalCat(new THREE.Vector3(0, 12.2, -20));
      this.addWaterPuddle(new THREE.Vector3(10, 15.2, -38), 2.6);
      this.addMouse(new THREE.Vector3(42, 16.7, -35));
      this.addPigeonFlock(new THREE.Vector3(-16, 14.2, -26));
      this.addClothesline(new THREE.Vector3(36, 15.0, -16), new THREE.Vector3(44, 15.0, -16));
      this.addWindTurbine(new THREE.Vector3(26, 17.2, -52), new THREE.Vector3(-1, 0, 0));
    } else if (levelId === 3) {
      // Level 3: Twilight highrises with wind turbines, puddles, rival cats, dogs
      this.addWindTurbine(new THREE.Vector3(25, 18.2, -20), new THREE.Vector3(0, 0, 1));
      this.addWindTurbine(new THREE.Vector3(48, 21.2, -36), new THREE.Vector3(-1, 0, 0));
      this.addDog(new THREE.Vector3(-20, 19.2, -32));
      this.addRivalCat(new THREE.Vector3(12, 20.2, -44));
      this.addWaterPuddle(new THREE.Vector3(38, 22.7, -58), 3.0);
      this.addMouse(new THREE.Vector3(-4, 21.7, -58));
      this.addPigeonFlock(new THREE.Vector3(45, 19.7, -12));
    } else {
      // Level 4 & 5: High stakes cyber / master roofs
      this.addWindTurbine(new THREE.Vector3(0, 19.7, -26), new THREE.Vector3(0, 0, 1));
      this.addDog(new THREE.Vector3(54, 24.2, -42));
      this.addRivalCat(new THREE.Vector3(-22, 22.2, -38));
      this.addWaterPuddle(new THREE.Vector3(44, 26.2, -68), 3.2);
      this.addMouse(new THREE.Vector3(74, 26.7, -56));
      this.addPigeonFlock(new THREE.Vector3(24, 18.7, -4));
    }
  }

  /**
   * 1. 🐕 Barking Guard Dog
   */
  public addDog(pos: THREE.Vector3) {
    const dogGroup = new THREE.Group();
    dogGroup.position.copy(pos);

    // Body
    const bodyGeo = new THREE.BoxGeometry(0.7, 0.55, 1.1);
    const dogMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const body = new THREE.Mesh(bodyGeo, dogMat);
    body.position.y = 0.45;
    dogGroup.add(body);

    // Head & Snout
    const headGeo = new THREE.BoxGeometry(0.45, 0.45, 0.5);
    const head = new THREE.Mesh(headGeo, dogMat);
    head.position.set(0, 0.75, 0.6);
    dogGroup.add(head);

    const snoutGeo = new THREE.BoxGeometry(0.3, 0.22, 0.35);
    const snoutMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
    const snout = new THREE.Mesh(snoutGeo, snoutMat);
    snout.position.set(0, 0.68, 0.95);
    dogGroup.add(snout);

    // Floppy ears
    const earGeo = new THREE.BoxGeometry(0.12, 0.25, 0.14);
    const earL = new THREE.Mesh(earGeo, snoutMat);
    earL.position.set(-0.25, 0.75, 0.6);
    const earR = new THREE.Mesh(earGeo, snoutMat);
    earR.position.set(0.25, 0.75, 0.6);
    dogGroup.add(earL);
    dogGroup.add(earR);

    // Collar
    const collarGeo = new THREE.TorusGeometry(0.28, 0.04, 8, 16);
    collarGeo.rotateX(Math.PI / 2);
    const collarMat = new THREE.MeshStandardMaterial({ color: 0xdc2626 });
    const collar = new THREE.Mesh(collarGeo, collarMat);
    collar.position.set(0, 0.6, 0.45);
    dogGroup.add(collar);

    // 4 Legs
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 8);
    [[-0.25, 0.2, 0.35], [0.25, 0.2, 0.35], [-0.25, 0.2, -0.35], [0.25, 0.2, -0.35]].forEach((lp) => {
      const leg = new THREE.Mesh(legGeo, dogMat);
      leg.position.set(lp[0], lp[1], lp[2]);
      dogGroup.add(leg);
    });

    this.group.add(dogGroup);

    this.hazards.push({
      type: 'dog',
      mesh: dogGroup,
      position: pos,
      active: true,
      cooldown: 0,
      update: (time, delta) => {
        // Subtle breathing & head turn
        head.rotation.y = Math.sin(time * 2) * 0.2;
      },
      checkCollision: (playerPos) => {
        const dist = playerPos.distanceTo(pos);
        if (dist < 3.8) {
          sound.dogBark();
          // Push player back
          const push = new THREE.Vector3().subVectors(playerPos, pos).normalize().multiplyScalar(12);
          push.y = 4;
          return {
            triggered: true,
            type: 'dog',
            message: '¡¡MIAU MIAU!! ¡Un perro guardián empezó a ladrar y te asustó!',
            points: -15,
            isPositive: false,
            pushback: push,
          };
        }
        return null;
      },
    });
  }

  /**
   * 2. 🐭 Scurrying Mouse Chase
   */
  public addMouse(pos: THREE.Vector3) {
    const mouseGroup = new THREE.Group();
    mouseGroup.position.copy(pos);

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.16, 12, 10);
    bodyGeo.scale(1.4, 0.9, 0.9);
    const mouseMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.7 });
    const body = new THREE.Mesh(bodyGeo, mouseMat);
    mouseGroup.add(body);

    // Pink Ears
    const earGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const earMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5 });
    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(0.12, 0.12, 0.08);
    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(0.12, 0.12, -0.08);
    mouseGroup.add(earL);
    mouseGroup.add(earR);

    // Long thin tail
    const tailGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.35, 6);
    tailGeo.rotateZ(Math.PI / 2);
    const tail = new THREE.Mesh(tailGeo, earMat);
    tail.position.set(-0.25, -0.02, 0);
    mouseGroup.add(tail);

    this.group.add(mouseGroup);

    const startPos = pos.clone();
    let isCaught = false;

    this.hazards.push({
      type: 'mouse',
      mesh: mouseGroup,
      position: pos,
      active: true,
      cooldown: 0,
      update: (time) => {
        if (isCaught) return;
        // Fast zigzag run across rooftop
        const runDist = 4.5;
        const offsetX = Math.sin(time * 3.5) * runDist;
        const offsetZ = Math.cos(time * 2.5) * 2.5;
        mouseGroup.position.set(startPos.x + offsetX, startPos.y, startPos.z + offsetZ);
        mouseGroup.rotation.y = Math.atan2(Math.cos(time * 3.5), -Math.sin(time * 2.5));
      },
      checkCollision: (playerPos) => {
        if (isCaught) return null;
        const dist = playerPos.distanceTo(mouseGroup.position);
        if (dist < 1.6) {
          isCaught = true;
          mouseGroup.visible = false;
          sound.mouseSqueak();
          sound.eatFood('chicken');
          return {
            triggered: true,
            type: 'mouse',
            message: '¡¡MIAU GENIAL!! ¡Cazaste al ratón travieso! (+120 pts)',
            points: 120,
            isPositive: true,
          };
        }
        return null;
      },
    });
  }

  /**
   * 3. 😾 Territorial Rival Street Cat
   */
  public addRivalCat(pos: THREE.Vector3) {
    const catGroup = new THREE.Group();
    catGroup.position.copy(pos);

    // Arched Back Body
    const bodyGeo = new THREE.CylinderGeometry(0.2, 0.24, 0.7, 12);
    bodyGeo.rotateZ(Math.PI / 3.5);
    const catMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.85 });
    const body = new THREE.Mesh(bodyGeo, catMat);
    body.position.y = 0.35;
    catGroup.add(body);

    // Head
    const headGeo = new THREE.SphereGeometry(0.18, 12, 10);
    const head = new THREE.Mesh(headGeo, catMat);
    head.position.set(0.32, 0.5, 0);
    catGroup.add(head);

    // Pointy Ears
    const earGeo = new THREE.ConeGeometry(0.07, 0.12, 4);
    const earL = new THREE.Mesh(earGeo, catMat);
    earL.position.set(0.32, 0.65, 0.1);
    const earR = new THREE.Mesh(earGeo, catMat);
    earR.position.set(0.32, 0.65, -0.1);
    catGroup.add(earL);
    catGroup.add(earR);

    // Fluffy Puffed Tail
    const tailGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8);
    tailGeo.rotateZ(-Math.PI / 3);
    const tail = new THREE.Mesh(tailGeo, catMat);
    tail.position.set(-0.35, 0.45, 0);
    catGroup.add(tail);

    this.group.add(catGroup);

    this.hazards.push({
      type: 'rival_cat',
      mesh: catGroup,
      position: pos,
      active: true,
      cooldown: 0,
      update: (time) => {
        catGroup.rotation.y = Math.sin(time * 1.5) * 0.15;
      },
      checkCollision: (playerPos) => {
        const dist = playerPos.distanceTo(pos);
        if (dist < 3.2) {
          sound.catHiss();
          const push = new THREE.Vector3().subVectors(playerPos, pos).normalize().multiplyScalar(9);
          push.y = 3;
          return {
            triggered: true,
            type: 'rival_cat',
            message: '¡¡MIAU MIAU!! ¡Un gato rival territorial te bufó y dio un zarpazo!',
            points: -10,
            isPositive: false,
            pushback: push,
          };
        }
        return null;
      },
    });
  }

  /**
   * 4. 💧 Water Puddle (Charco de agua)
   */
  public addWaterPuddle(pos: THREE.Vector3, radius: number = 2.4) {
    const puddleGeo = new THREE.CircleGeometry(radius, 24);
    puddleGeo.rotateX(-Math.PI / 2);
    const puddleMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.05,
      metalness: 0.9,
      transparent: true,
      opacity: 0.75,
    });
    const puddle = new THREE.Mesh(puddleGeo, puddleMat);
    puddle.position.set(pos.x, pos.y + 0.02, pos.z);
    this.group.add(puddle);

    this.hazards.push({
      type: 'puddle',
      mesh: new THREE.Group(),
      position: pos,
      active: true,
      cooldown: 0,
      checkCollision: (playerPos) => {
        const dist2D = Math.hypot(playerPos.x - pos.x, playerPos.z - pos.z);
        if (dist2D < radius && Math.abs(playerPos.y - pos.y) < 0.6) {
          sound.waterSplash();
          return {
            triggered: true,
            type: 'puddle',
            message: '¡¡MIAU MIAU!! ¡Caíste a un charco de agua helada! ¡Patas mojadas!',
            points: -5,
            isPositive: false,
          };
        }
        return null;
      },
    });
  }

  /**
   * 5. 🐦 Pigeon Flock
   */
  public addPigeonFlock(pos: THREE.Vector3) {
    const flockGroup = new THREE.Group();
    flockGroup.position.copy(pos);

    for (let i = 0; i < 4; i++) {
      const pigeon = new THREE.Group();
      const angle = (i / 4) * Math.PI * 2;
      pigeon.position.set(Math.cos(angle) * 0.8, 0.15, Math.sin(angle) * 0.8);

      const pBodyGeo = new THREE.SphereGeometry(0.14, 8, 8);
      pBodyGeo.scale(1.2, 0.9, 0.8);
      const pMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.8 });
      const pBody = new THREE.Mesh(pBodyGeo, pMat);
      pigeon.add(pBody);

      const pHeadGeo = new THREE.SphereGeometry(0.07, 8, 8);
      const pHead = new THREE.Mesh(pHeadGeo, pMat);
      pHead.position.set(0.12, 0.12, 0);
      pigeon.add(pHead);

      flockGroup.add(pigeon);
    }
    this.group.add(flockGroup);

    let isFlown = false;

    this.hazards.push({
      type: 'pigeons',
      mesh: flockGroup,
      position: pos,
      active: true,
      cooldown: 0,
      update: (time, delta) => {
        if (isFlown) {
          flockGroup.position.y += delta * 7;
          flockGroup.scale.multiplyScalar(0.96);
        }
      },
      checkCollision: (playerPos) => {
        if (isFlown) return null;
        const dist = playerPos.distanceTo(pos);
        if (dist < 3.0) {
          isFlown = true;
          sound.pigeonFlap();
          return {
            triggered: true,
            type: 'pigeons',
            message: '¡¡MIAU!! ¡Las palomas salieron volando y te llenaron de plumas!',
            points: 20,
            isPositive: true,
          };
        }
        return null;
      },
    });
  }

  /**
   * 6. 🧺 Clothesline with Hanging Sheets
   */
  public addClothesline(p1: THREE.Vector3, p2: THREE.Vector3) {
    const lineGroup = new THREE.Group();
    const length = p1.distanceTo(p2);
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    // Rope
    const ropeGeo = new THREE.CylinderGeometry(0.015, 0.015, length, 6);
    ropeGeo.rotateZ(Math.PI / 2);
    const ropeMat = new THREE.MeshBasicMaterial({ color: 0xd4d4d8 });
    const rope = new THREE.Mesh(ropeGeo, ropeMat);
    rope.position.copy(mid);
    rope.position.y += 1.4;
    rope.lookAt(p2);
    rope.rotateY(Math.PI / 2);
    lineGroup.add(rope);

    // Hanging White Sheet
    const sheetGeo = new THREE.PlaneGeometry(1.6, 1.2);
    const sheetMat = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      side: THREE.DoubleSide,
      roughness: 0.9,
    });
    const sheet = new THREE.Mesh(sheetGeo, sheetMat);
    sheet.position.copy(mid);
    sheet.position.y += 0.8;
    sheet.lookAt(p2);
    sheet.rotateY(Math.PI / 2);
    lineGroup.add(sheet);

    this.group.add(lineGroup);

    this.hazards.push({
      type: 'clothesline',
      mesh: lineGroup,
      position: mid,
      active: true,
      cooldown: 0,
      checkCollision: (playerPos) => {
        const dist = playerPos.distanceTo(mid);
        if (dist < 1.8 && Math.abs(playerPos.y - mid.y) < 1.2) {
          sound.pigeonFlap();
          return {
            triggered: true,
            type: 'clothesline',
            message: '¡¡MIAU MIAU!! ¡Te enredaste en las sábanas tendidas como un taco!',
            points: -5,
            isPositive: false,
          };
        }
        return null;
      },
    });
  }

  /**
   * 7. 💨 Industrial AC Wind Turbine Blast
   */
  public addWindTurbine(pos: THREE.Vector3, direction: THREE.Vector3) {
    const turbineGroup = new THREE.Group();
    turbineGroup.position.copy(pos);

    // Turbine Box
    const boxGeo = new THREE.BoxGeometry(2.0, 1.6, 1.6);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.7, roughness: 0.3 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.y = 0.8;
    turbineGroup.add(box);

    // Spinning Blades Grille
    const fanGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.05, 16);
    fanGeo.rotateX(Math.PI / 2);
    const fanMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5 });
    const fan = new THREE.Mesh(fanGeo, fanMat);
    fan.position.set(0, 0.8, 0.82);
    turbineGroup.add(fan);

    this.group.add(turbineGroup);

    const normDir = direction.clone().normalize();

    this.hazards.push({
      type: 'wind_turbine',
      mesh: turbineGroup,
      position: pos,
      active: true,
      cooldown: 0,
      update: (time) => {
        fan.rotation.z = time * 25; // rapidly spinning fan
      },
      checkCollision: (playerPos) => {
        const toPlayer = new THREE.Vector3().subVectors(playerPos, pos);
        const dist = toPlayer.length();
        const dot = toPlayer.clone().normalize().dot(normDir);

        if (dist < 4.5 && dot > 0.6) {
          sound.windBlast();
          const push = normDir.clone().multiplyScalar(14);
          push.y = 3;
          return {
            triggered: true,
            type: 'wind_turbine',
            message: '¡¡MIAU MIAU!! ¡Una ráfaga de aire caliente te empujó!',
            points: -10,
            isPositive: false,
            pushback: push,
          };
        }
        return null;
      },
    });
  }

  /**
   * Updates all hazards and returns any triggered event
   */
  public update(time: number, delta: number, playerPos: THREE.Vector3): HazardEventResult | null {
    for (const h of this.hazards) {
      if (h.cooldown !== undefined && h.cooldown > 0) {
        h.cooldown = Math.max(0, h.cooldown - delta);
      }
      if (h.update) {
        h.update(time, delta);
      }
      if (h.checkCollision && (h.cooldown === undefined || h.cooldown <= 0)) {
        const res = h.checkCollision(playerPos);
        if (res && res.triggered) {
          h.cooldown = 4.0; // 4 second cooldown per hazard
          return res;
        }
      }
    }
    return null;
  }
}
