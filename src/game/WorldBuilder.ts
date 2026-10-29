import * as THREE from 'three';
import { BuildingData, LevelConfig } from '../types/game';

export interface CollisionBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
  topY: number;
}

export interface RailingBoundary {
  bX: number;
  bZ: number;
  halfW: number;
  halfD: number;
  roofY: number;
  gapSide: 'north' | 'east';
  gapWidth: number;
}

/**
 * Procedural City Rooftops Builder.
 * Generates realistic urban parkour structures, materials, rooftop props,
 * goal cat baskets, and collision volumes.
 */
export class WorldBuilder {
  public group: THREE.Group;
  public collisionBoxes: CollisionBox[] = [];
  public railingBoundaries: RailingBoundary[] = [];
  public goalBasketPosition: THREE.Vector3;
  private goalBasketGroup: THREE.Group;
  private maxAnisotropy: number = 4;

  constructor(renderer?: THREE.WebGLRenderer) {
    this.group = new THREE.Group();
    this.group.name = 'CityWorld';
    this.goalBasketPosition = new THREE.Vector3();
    this.goalBasketGroup = new THREE.Group();
    if (renderer) {
      this.maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    }
  }

  /**
   * Generates procedural rooftop brick / tile texture canvas
   */
  private createRoofTileTexture(tileColorHex: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = tileColorHex;
    ctx.fillRect(0, 0, 256, 256);

    // Subtle tile ridges
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.lineWidth = 3;
    for (let y = 0; y < 256; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(256, y);
      ctx.stroke();
    }
    for (let x = 0; x < 256; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    return texture;
  }

  /**
   * Generates procedural wall facade with windows texture canvas
   */
  private createBuildingWallTexture(wallColorHex: string, windowColorHex: string): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = wallColorHex;
    ctx.fillRect(0, 0, 256, 256);

    // Windows grid
    ctx.fillStyle = windowColorHex;
    for (let y = 30; y < 240; y += 50) {
      for (let x = 30; x < 240; x += 55) {
        ctx.fillRect(x, y, 32, 28);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 32, 28);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = this.maxAnisotropy;
    return texture;
  }

  /**
   * Build complete level environment
   */
  public buildLevel(config: LevelConfig) {
    // Clear previous objects
    while (this.group.children.length > 0) {
      const obj = this.group.children[0];
      this.group.remove(obj);
    }
    this.collisionBoxes = [];
    this.railingBoundaries = [];

    // 1. Build Buildings
    for (const b of config.buildings) {
      this.buildBuilding(b);
    }

    // 2. Build Goal Basket at destination
    this.goalBasketPosition.set(...config.targetBasketPosition);
    this.buildGoalCatBasket(this.goalBasketPosition);

    // 3. Build Distant Cityscape Scenery
    this.buildDistantSkyline(config.skyTheme);

    // 4. Ground base (street level below)
    const groundGeo = new THREE.PlaneGeometry(500, 500);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      roughness: 0.9,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.position.y = -1;
    this.group.add(ground);

    // Street ground collision box so the cat lands safely below and can scale walls back up!
    this.collisionBoxes.push({
      minX: -250,
      maxX: 250,
      minY: -10,
      maxY: -1,
      minZ: -250,
      maxZ: 250,
      topY: -1,
    });
  }

  /**
   * Constructs single building with parapets, roof, windows, and props
   */
  private buildBuilding(b: BuildingData) {
    const buildingGroup = new THREE.Group();
    buildingGroup.position.set(b.x, b.y, b.z);

    const wallTex = this.createBuildingWallTexture(b.wallColor, b.windowColor);
    const roofTex = this.createRoofTileTexture(b.roofColor);

    // Main Body
    const bodyGeo = new THREE.BoxGeometry(b.width, b.height, b.depth);
    const bodyMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.8,
      metalness: 0.1,
    });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.y = b.height / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    buildingGroup.add(bodyMesh);

    // Rooftop Surface
    const roofY = b.height;
    const roofSlabGeo = new THREE.BoxGeometry(b.width + 0.4, 0.4, b.depth + 0.4);
    const roofSlabMat = new THREE.MeshStandardMaterial({
      map: roofTex,
      roughness: 0.7,
      metalness: 0.15,
    });
    const roofSlab = new THREE.Mesh(roofSlabGeo, roofSlabMat);
    roofSlab.position.y = roofY + 0.2;
    roofSlab.receiveShadow = true;
    buildingGroup.add(roofSlab);

    // Build Authentic Rooftop Safety Railings with Strategic Jump Gaps
    const totalTopY = roofY + 0.4;
    this.buildRooftopRailingsWithGaps(buildingGroup, b, totalTopY);

    // Register primary roof floor collision box
    this.collisionBoxes.push({
      minX: b.x - b.width / 2,
      maxX: b.x + b.width / 2,
      minY: 0,
      maxY: totalTopY,
      minZ: b.z - b.depth / 2,
      maxZ: b.z + b.depth / 2,
      topY: totalTopY,
    });

    // Rooftop Accents & Props
    if (b.hasChimney) {
      this.addChimney(buildingGroup, b.width, totalTopY, b.depth, b.x, b.z);
    }
    if (b.hasWaterTank) {
      this.addWaterTank(buildingGroup, b.width, totalTopY, b.depth, b.x, b.z);
    }
    if (b.hasVent) {
      this.addACVent(buildingGroup, b.width, totalTopY, b.depth, b.x, b.z);
    }
    if (b.hasAntenna) {
      this.addAntenna(buildingGroup, b.width, totalTopY, b.depth);
    }
    if (b.hasSolarPanels) {
      this.addSolarPanels(buildingGroup, b.width, totalTopY, b.depth);
    }
    if (b.hasPlanter) {
      this.addPlanter(buildingGroup, b.width, totalTopY, b.depth);
    }
    if (b.planksTo) {
      this.addPlankBridge(b.x, totalTopY, b.z, b.planksTo[0], b.planksTo[1] + 0.4, b.planksTo[2]);
    }

    this.group.add(buildingGroup);
  }

  /**
   * Constructs authentic rooftop safety railings with designated parkour jump gaps
   * (Partes con baranda para proteger contra caídas, y partes sin baranda para saltar)
   */
  private buildRooftopRailingsWithGaps(parent: THREE.Group, b: BuildingData, roofY: number) {
    const railingHeight = 0.95;
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.7, roughness: 0.3 });
    const barMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.6, roughness: 0.4 });
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Bright yellow jump indicator

    const halfW = b.width / 2;
    const halfD = b.depth / 2;

    const gapSide = b.id.includes('right') || b.id.includes('step') ? 'east' : 'north';
    const gapWidth = 4.2;

    // Register clean boundary barrier
    this.railingBoundaries.push({
      bX: b.x,
      bZ: b.z,
      halfW,
      halfD,
      roofY,
      gapSide,
      gapWidth,
    });

    // Helper to build a railing segment along X
    const buildRailingSegmentX = (zPos: number, xStart: number, xEnd: number) => {
      const segLen = Math.abs(xEnd - xStart);
      if (segLen < 0.5) return;
      const midX = (xStart + xEnd) / 2;

      // Top Handrail
      const topGeo = new THREE.BoxGeometry(segLen, 0.08, 0.08);
      const topRail = new THREE.Mesh(topGeo, barMat);
      topRail.position.set(midX, roofY + railingHeight, zPos);
      parent.add(topRail);

      // Mid Rail
      const midGeo = new THREE.BoxGeometry(segLen, 0.05, 0.05);
      const midRail = new THREE.Mesh(midGeo, barMat);
      midRail.position.set(midX, roofY + railingHeight * 0.5, zPos);
      parent.add(midRail);

      // Vertical Posts
      const postCount = Math.max(2, Math.floor(segLen / 1.5));
      for (let i = 0; i <= postCount; i++) {
        const postX = xStart + (i / postCount) * (xEnd - xStart);
        const postGeo = new THREE.CylinderGeometry(0.04, 0.04, railingHeight, 8);
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(postX, roofY + railingHeight / 2, zPos);
        parent.add(post);
      }
    };

    // Helper to build a railing segment along Z
    const buildRailingSegmentZ = (xPos: number, zStart: number, zEnd: number) => {
      const segLen = Math.abs(zEnd - zStart);
      if (segLen < 0.5) return;
      const midZ = (zStart + zEnd) / 2;

      // Top Handrail
      const topGeo = new THREE.BoxGeometry(0.08, 0.08, segLen);
      const topRail = new THREE.Mesh(topGeo, barMat);
      topRail.position.set(xPos, roofY + railingHeight, midZ);
      parent.add(topRail);

      // Mid Rail
      const midGeo = new THREE.BoxGeometry(0.05, 0.05, segLen);
      const midRail = new THREE.Mesh(midGeo, barMat);
      midRail.position.set(xPos, roofY + railingHeight * 0.5, midZ);
      parent.add(midRail);

      // Vertical Posts
      const postCount = Math.max(2, Math.floor(segLen / 1.5));
      for (let i = 0; i <= postCount; i++) {
        const postZ = zStart + (i / postCount) * (zEnd - zStart);
        const postGeo = new THREE.CylinderGeometry(0.04, 0.04, railingHeight, 8);
        const post = new THREE.Mesh(postGeo, postMat);
        post.position.set(xPos, roofY + railingHeight / 2, postZ);
        parent.add(post);
      }
    };

    // 1. South Edge (+Z) - Full protective railing
    buildRailingSegmentX(halfD, -halfW, halfW);

    // 2. West Edge (-X) - Full protective railing
    buildRailingSegmentZ(-halfW, -halfD, halfD);

    // 3. North Edge (-Z) - either has jump gap or is full
    if (gapSide === 'north') {
      const halfGap = gapWidth / 2;
      buildRailingSegmentX(-halfD, -halfW, -halfGap);
      buildRailingSegmentX(-halfD, halfGap, halfW);

      // Yellow indicator painted strip at jump gap
      const stripeGeo = new THREE.BoxGeometry(gapWidth, 0.02, 0.4);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(0, roofY + 0.01, -halfD + 0.2);
      parent.add(stripe);
    } else {
      buildRailingSegmentX(-halfD, -halfW, halfW);
    }

    // 4. East Edge (+X) - either has jump gap or is full
    if (gapSide === 'east') {
      const halfGap = gapWidth / 2;
      buildRailingSegmentZ(halfW, -halfD, -halfGap);
      buildRailingSegmentZ(halfW, halfGap, halfD);

      const stripeGeo = new THREE.BoxGeometry(0.4, 0.02, gapWidth);
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.position.set(halfW - 0.2, roofY + 0.01, 0);
      parent.add(stripe);
    } else {
      buildRailingSegmentZ(halfW, -halfD, halfD);
    }
  }

  /**
   * Adds a climbable brick chimney
   */
  private addChimney(parent: THREE.Group, w: number, roofY: number, d: number, worldX: number, worldZ: number) {
    const chX = (Math.random() > 0.5 ? 1 : -1) * (w * 0.28);
    const chZ = (Math.random() > 0.5 ? 1 : -1) * (d * 0.28);
    const chHeight = 1.6;
    const chWidth = 1.2;

    const chimneyGeo = new THREE.BoxGeometry(chWidth, chHeight, chWidth);
    const chimneyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.9 });
    const chimney = new THREE.Mesh(chimneyGeo, chimneyMat);
    chimney.position.set(chX, roofY + chHeight / 2, chZ);
    chimney.castShadow = true;
    parent.add(chimney);

    // Terracotta smoke pot
    const potGeo = new THREE.CylinderGeometry(0.22, 0.28, 0.45, 12);
    const potMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.8 });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.set(chX, roofY + chHeight + 0.22, chZ);
    parent.add(pot);

    // Chimney top collision
    this.collisionBoxes.push({
      minX: worldX + chX - chWidth / 2,
      maxX: worldX + chX + chWidth / 2,
      minY: roofY,
      maxY: roofY + chHeight,
      minZ: worldZ + chZ - chWidth / 2,
      maxZ: worldZ + chZ + chWidth / 2,
      topY: roofY + chHeight,
    });
  }

  /**
   * Adds an industrial wooden/metal water cooling tower
   */
  private addWaterTank(parent: THREE.Group, w: number, roofY: number, d: number, worldX: number, worldZ: number) {
    const tankX = (w * 0.22);
    const tankZ = -(d * 0.22);
    const tankGroup = new THREE.Group();
    tankGroup.position.set(tankX, roofY, tankZ);

    // Wooden barrel
    const barrelGeo = new THREE.CylinderGeometry(1.4, 1.4, 2.2, 16);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 });
    const barrel = new THREE.Mesh(barrelGeo, barrelMat);
    barrel.position.y = 1.6;
    barrel.castShadow = true;
    tankGroup.add(barrel);

    // Conical roof cap
    const capGeo = new THREE.ConeGeometry(1.6, 0.8, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.7 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 3.1;
    tankGroup.add(cap);

    // Metal stilts
    const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.6 });
    for (let i = 0; i < 4; i++) {
      const leg = new THREE.Mesh(legGeo, legMat);
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      leg.position.set(Math.cos(angle) * 1.1, 0.3, Math.sin(angle) * 1.1);
      tankGroup.add(leg);
    }

    parent.add(tankGroup);

    this.collisionBoxes.push({
      minX: worldX + tankX - 1.4,
      maxX: worldX + tankX + 1.4,
      minY: roofY,
      maxY: roofY + 2.7,
      minZ: worldZ + tankZ - 1.4,
      maxZ: worldZ + tankZ + 1.4,
      topY: roofY + 2.7,
    });
  }

  /**
   * Adds an AC Ventilation Unit
   */
  private addACVent(parent: THREE.Group, w: number, roofY: number, d: number, worldX: number, worldZ: number) {
    const ventX = -(w * 0.25);
    const ventZ = (d * 0.2);
    const ventGeo = new THREE.BoxGeometry(1.8, 1.0, 1.2);
    const ventMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.6, roughness: 0.3 });
    const vent = new THREE.Mesh(ventGeo, ventMat);
    vent.position.set(ventX, roofY + 0.5, ventZ);
    vent.castShadow = true;
    parent.add(vent);

    // Fan grille circle
    const grilleGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.04, 16);
    grilleGeo.rotateX(Math.PI / 2);
    const grilleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const grille = new THREE.Mesh(grilleGeo, grilleMat);
    grille.position.set(ventX, roofY + 0.5, ventZ + 0.61);
    parent.add(grille);

    this.collisionBoxes.push({
      minX: worldX + ventX - 0.9,
      maxX: worldX + ventX + 0.9,
      minY: roofY,
      maxY: roofY + 1.0,
      minZ: worldZ + ventZ - 0.6,
      maxZ: worldZ + ventZ + 0.6,
      topY: roofY + 1.0,
    });
  }

  /**
   * Adds TV antenna
   */
  private addAntenna(parent: THREE.Group, w: number, roofY: number, d: number) {
    const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 3.2, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.set(w * 0.35, roofY + 1.6, -d * 0.35);
    parent.add(pole);

    // Cross bars
    const barGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.2, 8);
    barGeo.rotateZ(Math.PI / 2);
    const bar1 = new THREE.Mesh(barGeo, poleMat);
    bar1.position.set(w * 0.35, roofY + 2.4, -d * 0.35);
    const bar2 = new THREE.Mesh(barGeo, poleMat);
    bar2.position.set(w * 0.35, roofY + 2.8, -d * 0.35);
    parent.add(bar1);
    parent.add(bar2);
  }

  /**
   * Adds solar panel array
   */
  private addSolarPanels(parent: THREE.Group, w: number, roofY: number, d: number) {
    const panelGeo = new THREE.BoxGeometry(2.4, 0.08, 1.4);
    panelGeo.rotateX(-Math.PI / 8);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x1e1b4b,
      metalness: 0.8,
      roughness: 0.15,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, roofY + 0.35, d * 0.25);
    parent.add(panel);
  }

  /**
   * Adds flower & herb planter box
   */
  private addPlanter(parent: THREE.Group, w: number, roofY: number, d: number) {
    const boxGeo = new THREE.BoxGeometry(2.2, 0.45, 0.6);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const box = new THREE.Mesh(boxGeo, boxMat);
    box.position.set(-w * 0.28, roofY + 0.22, -d * 0.28);
    parent.add(box);

    // Leaves
    const bushGeo = new THREE.SphereGeometry(0.32, 8, 8);
    bushGeo.scale(1.8, 0.6, 0.8);
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.7 });
    const bush = new THREE.Mesh(bushGeo, bushMat);
    bush.position.set(-w * 0.28, roofY + 0.5, -d * 0.28);
    parent.add(bush);
  }

  /**
   * Adds a wooden plank bridge connecting two roofs
   */
  private addPlankBridge(x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) {
    const v1 = new THREE.Vector3(x1, y1, z1);
    const v2 = new THREE.Vector3(x2, y2, z2);
    const length = v1.distanceTo(v2);
    const midPoint = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);

    const plankGeo = new THREE.BoxGeometry(0.8, 0.12, length);
    const plankMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.9 });
    const plank = new THREE.Mesh(plankGeo, plankMat);
    plank.position.copy(midPoint);
    plank.lookAt(v2);
    this.group.add(plank);

    // Collision box for plank
    this.collisionBoxes.push({
      minX: Math.min(x1, x2) - 0.5,
      maxX: Math.max(x1, x2) + 0.5,
      minY: Math.min(y1, y2) - 0.2,
      maxY: Math.max(y1, y2) + 0.2,
      minZ: Math.min(z1, z2) - 0.5,
      maxZ: Math.max(z1, z2) + 0.5,
      topY: Math.max(y1, y2) + 0.06,
    });
  }

  /**
   * Builds the Cozy Cat Nap Basket (Level Completion Podium)
   */
  private buildGoalCatBasket(pos: THREE.Vector3) {
    this.goalBasketGroup = new THREE.Group();
    this.goalBasketGroup.position.copy(pos);

    // 1. Woven Wicker Basket Base
    const basketGeo = new THREE.CylinderGeometry(1.2, 0.9, 0.5, 24);
    const basketMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.85 });
    const basket = new THREE.Mesh(basketGeo, basketMat);
    basket.position.y = 0.25;
    this.goalBasketGroup.add(basket);

    // 2. Soft Red Plush Cushion
    const cushionGeo = new THREE.CylinderGeometry(1.1, 1.1, 0.25, 24);
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.95 });
    const cushion = new THREE.Mesh(cushionGeo, cushionMat);
    cushion.position.y = 0.4;
    this.goalBasketGroup.add(cushion);

    // 3. Cat Ear Crest / Sign
    const signGeo = new THREE.TorusGeometry(0.7, 0.08, 12, 24);
    signGeo.rotateX(Math.PI / 2);
    const signMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.y = 1.0;
    this.goalBasketGroup.add(sign);

    // 4. Glowing Vertical Beacon Light Pillar (points to the sky so player sees where to go!)
    const beamGeo = new THREE.CylinderGeometry(0.3, 0.3, 30, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.y = 15;
    this.goalBasketGroup.add(beam);

    this.group.add(this.goalBasketGroup);
  }

  /**
   * Generates distant cityscape skyline
   */
  private buildDistantSkyline(skyTheme: string) {
    const skylineMat = new THREE.MeshBasicMaterial({
      color: skyTheme === 'sunset' ? 0x4a044e :
             skyTheme === 'night_neon' ? 0x090514 :
             skyTheme === 'twilight' ? 0x1e1b4b : 0x64748b,
      transparent: true,
      opacity: 0.8,
    });

    const towerCount = 35;
    for (let i = 0; i < towerCount; i++) {
      const angle = (i / towerCount) * Math.PI * 2;
      const dist = 140 + Math.random() * 50;
      const height = 40 + Math.random() * 60;
      const width = 12 + Math.random() * 16;
      const depth = 12 + Math.random() * 16;

      const towerGeo = new THREE.BoxGeometry(width, height, depth);
      const tower = new THREE.Mesh(towerGeo, skylineMat);
      tower.position.set(Math.cos(angle) * dist, height / 2 - 10, Math.sin(angle) * dist);
      this.group.add(tower);
    }
  }

  /**
   * Find closest roof top beneath a given (x, z) coordinate
   */
  public getRoofHeightAt(x: number, z: number, currentY: number): { topY: number; onRoof: boolean } {
    let bestTopY = -999;
    let onRoof = false;

    // Check all collision boxes
    for (const box of this.collisionBoxes) {
      if (x >= box.minX && x <= box.maxX && z >= box.minZ && z <= box.maxZ) {
        // Can only land on this roof if our feet are near or above its top
        if (box.topY > bestTopY && currentY >= box.topY - 0.4) {
          bestTopY = box.topY;
          onRoof = true;
        }
      }
    }

    return { topY: bestTopY, onRoof };
  }

  /**
   * Check horizontal wall collisions to prevent walking through building sides
   */
  public resolveWallCollision(pos: THREE.Vector3, radius: number = 0.4): boolean {
    let hitWall = false;
    for (const box of this.collisionBoxes) {
      // Only collides horizontally if player Y is below the roof top
      if (pos.y < box.topY - 0.1 && pos.y >= box.minY) {
        if (
          pos.x + radius > box.minX &&
          pos.x - radius < box.maxX &&
          pos.z + radius > box.minZ &&
          pos.z - radius < box.maxZ
        ) {
          hitWall = true;
          // Push out along closest edge
          const overlapLeft = (pos.x + radius) - box.minX;
          const overlapRight = box.maxX - (pos.x - radius);
          const overlapFront = (pos.z + radius) - box.minZ;
          const overlapBack = box.maxZ - (pos.z - radius);

          const minOverlap = Math.min(overlapLeft, overlapRight, overlapFront, overlapBack);
          if (minOverlap === overlapLeft) pos.x = box.minX - radius;
          else if (minOverlap === overlapRight) pos.x = box.maxX + radius;
          else if (minOverlap === overlapFront) pos.z = box.minZ - radius;
          else pos.z = box.maxZ + radius;
        }
      }
    }
    return hitWall;
  }

  /**
   * Safely contains the cat on the roof along edges with railings,
   * while allowing the cat to jump through open parkour gaps!
   */
  public resolveRailingCollision(pos: THREE.Vector3, radius: number = 0.35) {
    const feetY = pos.y - 0.55;
    for (const b of this.railingBoundaries) {
      if (feetY >= b.roofY - 0.25 && feetY <= b.roofY + 0.85) {
        if (
          pos.x >= b.bX - b.halfW - radius &&
          pos.x <= b.bX + b.halfW + radius &&
          pos.z >= b.bZ - b.halfD - radius &&
          pos.z <= b.bZ + b.halfD + radius
        ) {
          // South edge (+Z)
          if (pos.z + radius > b.bZ + b.halfD && pos.z < b.bZ + b.halfD + 0.5) {
            pos.z = b.bZ + b.halfD - radius;
          }
          // West edge (-X)
          if (pos.x - radius < b.bX - b.halfW && pos.x > b.bX - b.halfW - 0.5) {
            pos.x = b.bX - b.halfW + radius;
          }
          // North edge (-Z)
          if (pos.z - radius < b.bZ - b.halfD && pos.z > b.bZ - b.halfD - 0.5) {
            const inGap = b.gapSide === 'north' && Math.abs(pos.x - b.bX) < b.gapWidth / 2;
            if (!inGap) {
              pos.z = b.bZ - b.halfD + radius;
            }
          }
          // East edge (+X)
          if (pos.x + radius > b.bX + b.halfW && pos.x < b.bX + b.halfW + 0.5) {
            const inGap = b.gapSide === 'east' && Math.abs(pos.z - b.bZ) < b.gapWidth / 2;
            if (!inGap) {
              pos.x = b.bX + b.halfW - radius;
            }
          }
        }
      }
    }
  }

  /**
   * Check if position is near a building wall for wall jumping / climbing
   */
  public isNearWall(pos: THREE.Vector3, threshold: number = 0.85): {
    near: boolean;
    wallTopY: number;
    normal: THREE.Vector3;
    dist: number;
  } {
    let nearestDist = Infinity;
    let bestBox: CollisionBox | null = null;
    let bestNormal = new THREE.Vector3(0, 0, 0);

    for (const box of this.collisionBoxes) {
      // Ignore ground plane box
      if (box.maxX - box.minX > 100) continue;

      // Only check if player is at or along building facade height
      if (pos.y <= box.topY + 0.6 && pos.y >= box.minY - 0.5) {
        const dx = Math.max(box.minX - pos.x, 0, pos.x - box.maxX);
        const dz = Math.max(box.minZ - pos.z, 0, pos.z - box.maxZ);
        const dist = Math.hypot(dx, dz);

        if (dist <= threshold && dist < nearestDist) {
          nearestDist = dist;
          bestBox = box;

          // Compute outward normal vector from wall center
          const centerX = (box.minX + box.maxX) / 2;
          const centerZ = (box.minZ + box.maxZ) / 2;
          const nx = pos.x - centerX;
          const nz = pos.z - centerZ;
          const len = Math.hypot(nx, nz);
          if (len > 0.001) {
            bestNormal.set(nx / len, 0, nz / len);
          } else {
            bestNormal.set(0, 0, 1);
          }
        }
      }
    }

    if (bestBox) {
      return {
        near: true,
        wallTopY: bestBox.topY,
        normal: bestNormal,
        dist: nearestDist,
      };
    }

    return { near: false, wallTopY: 0, normal: new THREE.Vector3(), dist: Infinity };
  }
}

