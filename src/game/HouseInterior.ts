import * as THREE from 'three';
import { sound } from '../services/sound';

export interface MouseCatchCallback {
  (): void;
}

/**
 * 3D Living Room & Attic Interior of the Target House.
 * Features cozy furniture, jumpable surfaces, climbable bookshelves,
 * fireplace, cardboard boxes, and the scurrying Mouse entity to hunt.
 */
export class HouseInterior {
  public group: THREE.Group;
  public isPlayerInside: boolean = false;
  public entranceSkylightPos: THREE.Vector3; // Outdoor roof coordinates
  public interiorRoomCenter: THREE.Vector3; // 3D coordinates where room is built
  public skylightRadius: number = 2.2;

  // Collision volumes for interior furniture
  private interiorColliders: Array<{
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
    minZ: number;
    maxZ: number;
    topY: number;
  }> = [];

  // Mouse entity
  public mouseGroup: THREE.Group;
  private mouseBody!: THREE.Mesh;
  private mouseTail!: THREE.Group;
  private mouseWhiskers!: THREE.Group;
  public mousePosition: THREE.Vector3;
  private mouseTargetWaypoint: THREE.Vector3;
  private mouseSpeed: number = 5.2;
  private mouseState: 'nibble' | 'scurry' | 'hiding' = 'nibble';
  private mouseStateTimer: number = 0;
  public isMouseCaught: boolean = false;
  private onMouseCaught?: MouseCatchCallback;

  // Waypoints inside the room
  private waypoints: THREE.Vector3[] = [];

  // Room bounds
  public readonly roomSize = 16;
  public readonly roomHeight = 5.5;

  constructor(targetRoofPos: [number, number, number], onMouseCaught?: MouseCatchCallback) {
    this.group = new THREE.Group();
    this.group.name = 'HouseInterior';
    this.onMouseCaught = onMouseCaught;

    // Outdoor skylight entrance location on target building roof
    this.entranceSkylightPos = new THREE.Vector3(targetRoofPos[0], targetRoofPos[1], targetRoofPos[2]);

    // The interior room is positioned right below the skylight or offset
    // Let's place the interior room floor at y = 0 inside the building footprint!
    this.interiorRoomCenter = new THREE.Vector3(targetRoofPos[0], 0.2, targetRoofPos[2]);

    // Mouse setup
    this.mouseGroup = new THREE.Group();
    this.mousePosition = new THREE.Vector3();
    this.mouseTargetWaypoint = new THREE.Vector3();

    // Build the room architecture and furniture
    this.buildRoomStructure();
    this.buildFurniture();
    this.buildSkylightOutdoorIndicator();
    this.buildMouseEntity();
    this.setupWaypoints();
  }

  /**
   * Outdoor beacon & open roof skylight hatch on the building roof
   */
  private buildSkylightOutdoorIndicator() {
    const skylightGroup = new THREE.Group();
    skylightGroup.position.copy(this.entranceSkylightPos);

    // Skylight raised wooden frame
    const frameGeo = new THREE.BoxGeometry(3.6, 0.45, 3.6);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x5c3a21,
      roughness: 0.8,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    skylightGroup.add(frameMesh);

    // Open skylight hole (dark interior void with warm light shining out)
    const voidGeo = new THREE.PlaneGeometry(3.1, 3.1);
    voidGeo.rotateX(-Math.PI / 2);
    const voidMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.85,
    });
    const voidMesh = new THREE.Mesh(voidGeo, voidMat);
    voidMesh.position.y = 0.23;
    skylightGroup.add(voidMesh);

    // Open hinged glass pane
    const glassGeo = new THREE.BoxGeometry(3.2, 0.08, 1.6);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xa5f3fc,
      transmission: 0.9,
      opacity: 0.7,
      transparent: true,
      roughness: 0.1,
    });
    const glassPane = new THREE.Mesh(glassGeo, glassMat);
    glassPane.position.set(0, 1.1, -1.2);
    glassPane.rotation.x = -Math.PI / 3.5;
    skylightGroup.add(glassPane);

    // Golden Beacon Light Beam shooting into the sky
    const beamGeo = new THREE.CylinderGeometry(0.3, 1.8, 45, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.y = 22.5;
    skylightGroup.add(beamMesh);

    // Floating Golden Cheese Icon above skylight
    const cheeseGroup = new THREE.Group();
    cheeseGroup.position.set(0, 3.5, 0);

    const cheeseGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.45, 3);
    const cheeseMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      roughness: 0.3,
      metalness: 0.1,
      emissive: 0xd97706,
      emissiveIntensity: 0.4,
    });
    const cheeseMesh = new THREE.Mesh(cheeseGeo, cheeseMat);
    cheeseMesh.rotation.x = Math.PI / 4;
    cheeseGroup.add(cheeseMesh);

    // Floating Signboard
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const sctx = signCanvas.getContext('2d')!;
    sctx.fillStyle = '#b45309';
    sctx.fillRect(0, 0, 512, 128);
    sctx.lineWidth = 6;
    sctx.strokeStyle = '#fef08a';
    sctx.strokeRect(4, 4, 504, 120);

    sctx.fillStyle = '#ffffff';
    sctx.font = 'bold 34px sans-serif';
    sctx.textAlign = 'center';
    sctx.fillText('🧀 CASA DEL RATÓN 🧀', 256, 52);
    sctx.font = 'bold 26px sans-serif';
    sctx.fillStyle = '#fef08a';
    sctx.fillText('¡Entra por la claraboya abierta!', 256, 96);

    const signTex = new THREE.CanvasTexture(signCanvas);
    signTex.colorSpace = THREE.SRGBColorSpace;
    const signPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.6, 0.9),
      new THREE.MeshBasicMaterial({ map: signTex, side: THREE.DoubleSide })
    );
    signPlane.position.set(0, 2.2, 1.8);
    skylightGroup.add(signPlane);
    skylightGroup.add(cheeseGroup);

    this.group.add(skylightGroup);
  }

  /**
   * Builds walls, hardwood parquet flooring, ceiling with exposed beams
   */
  private buildRoomStructure() {
    const room = new THREE.Group();
    room.position.copy(this.interiorRoomCenter);

    const half = this.roomSize / 2;
    const h = this.roomHeight;

    // 1. Hardwood Parquet Floor Texture
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 256;
    floorCanvas.height = 256;
    const fctx = floorCanvas.getContext('2d')!;
    fctx.fillStyle = '#8b5a2b';
    fctx.fillRect(0, 0, 256, 256);

    // Planks pattern
    fctx.fillStyle = '#a06a37';
    for (let y = 0; y < 256; y += 32) {
      fctx.fillRect(0, y, 256, 28);
      fctx.strokeStyle = 'rgba(0,0,0,0.3)';
      fctx.lineWidth = 2;
      fctx.strokeRect(0, y, 256, 32);
      // Vertical seams
      for (let x = (y % 64 === 0 ? 0 : 64); x < 256; x += 128) {
        fctx.beginPath();
        fctx.moveTo(x, y);
        fctx.lineTo(x, y + 32);
        fctx.stroke();
      }
    }

    const floorTex = new THREE.CanvasTexture(floorCanvas);
    floorTex.wrapS = THREE.RepeatWrapping;
    floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(8, 8);
    floorTex.colorSpace = THREE.SRGBColorSpace;

    const floorGeo = new THREE.PlaneGeometry(this.roomSize, this.roomSize);
    floorGeo.rotateX(-Math.PI / 2);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTex,
      roughness: 0.45,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.receiveShadow = true;
    room.add(floorMesh);

    // 2. Wallpapered Walls
    const wallCanvas = document.createElement('canvas');
    wallCanvas.width = 128;
    wallCanvas.height = 128;
    const wctx = wallCanvas.getContext('2d')!;
    wctx.fillStyle = '#f8fafc';
    wctx.fillRect(0, 0, 128, 128);
    wctx.fillStyle = '#e2e8f0';
    for (let x = 0; x < 128; x += 16) {
      wctx.fillRect(x, 0, 8, 128);
    }
    const wallTex = new THREE.CanvasTexture(wallCanvas);
    wallTex.wrapS = THREE.RepeatWrapping;
    wallTex.wrapT = THREE.RepeatWrapping;
    wallTex.repeat.set(4, 2);
    wallTex.colorSpace = THREE.SRGBColorSpace;

    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.85,
    });

    // North Wall (-Z)
    const nWall = new THREE.Mesh(new THREE.BoxGeometry(this.roomSize, h, 0.4), wallMat);
    nWall.position.set(0, h / 2, -half);
    room.add(nWall);

    // South Wall (+Z)
    const sWall = new THREE.Mesh(new THREE.BoxGeometry(this.roomSize, h, 0.4), wallMat);
    sWall.position.set(0, h / 2, half);
    room.add(sWall);

    // West Wall (-X)
    const wWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, this.roomSize), wallMat);
    wWall.position.set(-half, h / 2, 0);
    room.add(wWall);

    // East Wall (+X)
    const eWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, h, this.roomSize), wallMat);
    eWall.position.set(half, h / 2, 0);
    room.add(eWall);

    // Ceiling with open Skylight cutout
    const ceilingGeo = new THREE.BoxGeometry(this.roomSize, 0.4, this.roomSize);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
    });
    const ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingMesh.position.set(0, h, 0);
    room.add(ceilingMesh);

    // Exposed Timber Rafter Beams
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x4a2e18, roughness: 0.7 });
    for (let z = -half + 2.5; z <= half - 2.5; z += 3.2) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(this.roomSize - 0.2, 0.35, 0.3), beamMat);
      beam.position.set(0, h - 0.2, z);
      room.add(beam);
    }

    // Warm Interior Point Light
    const warmChandelier = new THREE.PointLight(0xffedd5, 1.6, 22, 1.2);
    warmChandelier.position.set(0, h - 1.2, 0);
    room.add(warmChandelier);

    this.group.add(room);
  }

  /**
   * Builds jumpable furniture inside: Sofa, Coffee Table, Bookshelf,
   * Fireplace, Rug, Cardboard box, and Cat Scratching Post
   */
  private buildFurniture() {
    const furniture = new THREE.Group();
    furniture.position.copy(this.interiorRoomCenter);

    // 1. Large Cozy Persian Rug in Center
    const rugCanvas = document.createElement('canvas');
    rugCanvas.width = 256;
    rugCanvas.height = 256;
    const rctx = rugCanvas.getContext('2d')!;
    rctx.fillStyle = '#991b1b'; // deep crimson
    rctx.fillRect(0, 0, 256, 256);
    rctx.strokeStyle = '#fef08a';
    rctx.lineWidth = 12;
    rctx.strokeRect(16, 16, 224, 224);
    rctx.fillStyle = '#1e3a8a';
    rctx.beginPath();
    rctx.arc(128, 128, 64, 0, Math.PI * 2);
    rctx.fill();
    const rugTex = new THREE.CanvasTexture(rugCanvas);
    rugTex.colorSpace = THREE.SRGBColorSpace;

    const rugGeo = new THREE.PlaneGeometry(7.5, 6.0);
    rugGeo.rotateX(-Math.PI / 2);
    const rugMesh = new THREE.Mesh(
      rugGeo,
      new THREE.MeshStandardMaterial({ map: rugTex, roughness: 0.9 })
    );
    rugMesh.position.set(0, 0.02, 0.5);
    furniture.add(rugMesh);

    // 2. Large Plush Modular Sofa (Jumpable!)
    const sofaGroup = new THREE.Group();
    sofaGroup.position.set(0, 0, 3.8);

    const sofaMat = new THREE.MeshStandardMaterial({
      color: 0x1e3a8a, // dark navy fabric
      roughness: 0.85,
    });

    // Base cushion
    const sofaBase = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.7, 2.0), sofaMat);
    sofaBase.position.set(0, 0.35, 0);
    sofaGroup.add(sofaBase);

    // Backrest
    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1.2, 0.55), sofaMat);
    sofaBack.position.set(0, 1.0, 0.75);
    sofaGroup.add(sofaBack);

    // Armrests
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 2.1), sofaMat);
    leftArm.position.set(-2.6, 0.55, 0);
    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.9, 2.1), sofaMat);
    rightArm.position.set(2.6, 0.55, 0);
    sofaGroup.add(leftArm, rightArm);

    // Comfy yellow cushions
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.75 });
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.3), cushionMat);
    c1.position.set(-1.6, 0.85, 0.5);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.65, 0.3), cushionMat);
    c2.position.set(1.6, 0.85, 0.5);
    sofaGroup.add(c1, c2);

    furniture.add(sofaGroup);
    this.addInteriorCollider(
      this.interiorRoomCenter.x - 2.8,
      this.interiorRoomCenter.x + 2.8,
      0,
      1.6,
      this.interiorRoomCenter.z + 2.6,
      this.interiorRoomCenter.z + 4.9,
      0.75 // Jumpable seat height
    );

    // 3. Wooden Coffee Table in Front of Sofa
    const tableGroup = new THREE.Group();
    tableGroup.position.set(0, 0, 1.4);
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 });
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.12, 1.5), tableMat);
    tableTop.position.set(0, 0.55, 0);
    tableGroup.add(tableTop);

    // Table legs
    const legGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.55);
    const legPositions = [
      [-1.3, 0.27, -0.6],
      [1.3, 0.27, -0.6],
      [-1.3, 0.27, 0.6],
      [1.3, 0.27, 0.6],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, tableMat);
      leg.position.set(lx, ly, lz);
      tableGroup.add(leg);
    });

    // Spilled milk saucer + cheese wedges on table
    const saucer = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.2, 0.05, 16),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
    );
    saucer.position.set(0.6, 0.63, 0.2);
    tableGroup.add(saucer);

    const milkPuddle = new THREE.Mesh(
      new THREE.CircleGeometry(0.24, 16),
      new THREE.MeshBasicMaterial({ color: 0xfffbeb })
    );
    milkPuddle.rotateX(-Math.PI / 2);
    milkPuddle.position.set(0.6, 0.66, 0.2);
    tableGroup.add(milkPuddle);

    const cheeseWedge = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.12, 3),
      new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.3 })
    );
    cheeseWedge.position.set(-0.5, 0.68, -0.15);
    tableGroup.add(cheeseWedge);

    furniture.add(tableGroup);
    this.addInteriorCollider(
      this.interiorRoomCenter.x - 1.6,
      this.interiorRoomCenter.x + 1.6,
      0,
      0.65,
      this.interiorRoomCenter.z + 0.6,
      this.interiorRoomCenter.z + 2.2,
      0.62 // Table top height
    );

    // 4. Climbable Multi-Tier Wooden Bookshelf along West Wall
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(-this.roomSize / 2 + 1.1, 0, -1.5);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.6 });

    // Side frame
    const sideA = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.4, 0.1), shelfMat);
    sideA.position.set(0, 2.2, -2.4);
    const sideB = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.4, 0.1), shelfMat);
    sideB.position.set(0, 2.2, 2.4);
    shelfGroup.add(sideA, sideB);

    // 4 Tiers of shelves (cat can jump tier by tier!)
    const tierHeights = [0.9, 1.8, 2.7, 3.6];
    tierHeights.forEach((th, idx) => {
      const shelfPlank = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.1, 4.8), shelfMat);
      shelfPlank.position.set(0, th, 0);
      shelfGroup.add(shelfPlank);

      // Books in various colors
      const bookColors = [0xef4444, 0x3b82f6, 0x10b981, 0xf59e0b, 0x8b5cf6];
      for (let bz = -2.0; bz <= 2.0; bz += 0.35) {
        if (Math.random() > 0.3) {
          const bColor = bookColors[Math.floor(Math.random() * bookColors.length)];
          const book = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.55 + Math.random() * 0.2, 0.2),
            new THREE.MeshStandardMaterial({ color: bColor, roughness: 0.8 })
          );
          book.position.set(0.1, th + 0.3, bz);
          shelfGroup.add(book);
        }
      }

      this.addInteriorCollider(
        shelfGroup.position.x - 0.8 + this.interiorRoomCenter.x,
        shelfGroup.position.x + 0.8 + this.interiorRoomCenter.x,
        th - 0.1,
        th + 0.6,
        shelfGroup.position.z - 2.4 + this.interiorRoomCenter.z,
        shelfGroup.position.z + 2.4 + this.interiorRoomCenter.z,
        th + 0.1
      );
    });
    furniture.add(shelfGroup);

    // 5. Cozy Stone Fireplace on North Wall
    const fireGroup = new THREE.Group();
    fireGroup.position.set(0, 0, -this.roomSize / 2 + 1.0);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0x57534e, roughness: 0.9 });
    const fireSurround = new THREE.Mesh(new THREE.BoxGeometry(4.2, 2.5, 1.2), stoneMat);
    fireSurround.position.set(0, 1.25, 0);
    fireGroup.add(fireSurround);

    // Fireplace hearth cavity
    const cavity = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 1.4, 1.0),
      new THREE.MeshBasicMaterial({ color: 0x1c1917 })
    );
    cavity.position.set(0, 0.8, 0.2);
    fireGroup.add(cavity);

    // Glowing fire embers
    const embers = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.4),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xf97316,
        emissiveIntensity: 2.2,
      })
    );
    embers.position.set(0, 0.35, 0.25);
    fireGroup.add(embers);

    // Fireplace mantle shelf (jumpable!)
    const mantleMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.5 });
    const mantle = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 1.4), mantleMat);
    mantle.position.set(0, 2.55, 0);
    fireGroup.add(mantle);

    // Fireplace warm light
    const fireLight = new THREE.PointLight(0xf97316, 2.2, 10, 1.4);
    fireLight.position.set(0, 0.8, 0.8);
    fireGroup.add(fireLight);

    furniture.add(fireGroup);
    this.addInteriorCollider(
      this.interiorRoomCenter.x - 2.4,
      this.interiorRoomCenter.x + 2.4,
      0,
      2.65,
      this.interiorRoomCenter.z - this.roomSize / 2,
      this.interiorRoomCenter.z - this.roomSize / 2 + 1.8,
      2.64 // Fireplace mantle height
    );

    // 6. Cat Cardboard Box ("Caja Michi") with entry holes
    const boxGroup = new THREE.Group();
    boxGroup.position.set(4.2, 0, -1.8);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.9 });
    const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.8, 1.6), boxMat);
    boxMesh.position.set(0, 0.4, 0);
    boxGroup.add(boxMesh);

    // Box entrance hole
    const holeMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.3, 16),
      new THREE.MeshBasicMaterial({ color: 0x1c1917 })
    );
    holeMesh.position.set(0, 0.4, 0.81);
    boxGroup.add(holeMesh);

    furniture.add(boxGroup);
    this.addInteriorCollider(
      boxGroup.position.x - 0.9 + this.interiorRoomCenter.x,
      boxGroup.position.x + 0.9 + this.interiorRoomCenter.x,
      0,
      0.9,
      boxGroup.position.z - 0.9 + this.interiorRoomCenter.z,
      boxGroup.position.z + 0.9 + this.interiorRoomCenter.z,
      0.82
    );

    // 7. Cat Scratching Tower in the Corner
    const catTree = new THREE.Group();
    catTree.position.set(5.5, 0, 5.0);
    const sisalMat = new THREE.MeshStandardMaterial({ color: 0xd4b483, roughness: 0.95 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 2.8, 12), sisalMat);
    post.position.set(0, 1.4, 0);
    catTree.add(post);

    const platformMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.8 });
    const plat1 = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.1, 16), platformMat);
    plat1.position.set(0, 1.5, 0);
    const plat2 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 16), platformMat);
    plat2.position.set(0, 2.8, 0);
    catTree.add(plat1, plat2);

    furniture.add(catTree);
    this.addInteriorCollider(
      catTree.position.x - 0.8 + this.interiorRoomCenter.x,
      catTree.position.x + 0.8 + this.interiorRoomCenter.x,
      0,
      2.9,
      catTree.position.z - 0.8 + this.interiorRoomCenter.z,
      catTree.position.z + 0.8 + this.interiorRoomCenter.z,
      2.85
    );

    this.group.add(furniture);
  }

  private addInteriorCollider(minX: number, maxX: number, minY: number, maxY: number, minZ: number, maxZ: number, topY: number) {
    this.interiorColliders.push({ minX, maxX, minY, maxY, minZ, maxZ, topY });
  }

  /**
   * Builds the 3D animated Mouse model
   */
  private buildMouseEntity() {
    const mouseMat = new THREE.MeshStandardMaterial({
      color: 0x78716c, // warm mouse grey fur
      roughness: 0.7,
    });
    const pinkMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6, // pink inner ears & paws
      roughness: 0.6,
    });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x000000 });

    // Body
    const bodyGeo = new THREE.SphereGeometry(0.24, 14, 14);
    bodyGeo.scale(1.0, 0.75, 1.4);
    this.mouseBody = new THREE.Mesh(bodyGeo, mouseMat);
    this.mouseBody.position.y = 0.18;
    this.mouseGroup.add(this.mouseBody);

    // Head
    const headGeo = new THREE.ConeGeometry(0.18, 0.36, 12);
    headGeo.rotateX(Math.PI / 2);
    const head = new THREE.Mesh(headGeo, mouseMat);
    head.position.set(0, 0.2, 0.32);
    this.mouseGroup.add(head);

    // Beady black eyes
    const eye1 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
    eye1.position.set(0.09, 0.23, 0.38);
    const eye2 = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), eyeMat);
    eye2.position.set(-0.09, 0.23, 0.38);
    this.mouseGroup.add(eye1, eye2);

    // Big round pink ears
    const earGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 12);
    earGeo.rotateX(Math.PI / 2);
    const ear1 = new THREE.Mesh(earGeo, pinkMat);
    ear1.position.set(0.15, 0.34, 0.24);
    ear1.rotation.z = -0.3;
    const ear2 = new THREE.Mesh(earGeo, pinkMat);
    ear2.position.set(-0.15, 0.34, 0.24);
    ear2.rotation.z = 0.3;
    this.mouseGroup.add(ear1, ear2);

    // Whiskers
    this.mouseWhiskers = new THREE.Group();
    const whiskerMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const w1 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.24), whiskerMat);
    w1.rotateZ(Math.PI / 2.3);
    w1.position.set(0.14, 0.18, 0.45);
    const w2 = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.24), whiskerMat);
    w2.rotateZ(-Math.PI / 2.3);
    w2.position.set(-0.14, 0.18, 0.45);
    this.mouseWhiskers.add(w1, w2);
    this.mouseGroup.add(this.mouseWhiskers);

    // Long flexible curved pink tail
    this.mouseTail = new THREE.Group();
    this.mouseTail.position.set(0, 0.14, -0.32);
    const tailSegmentGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.45, 8);
    tailSegmentGeo.rotateX(-Math.PI / 3);
    const tailMesh = new THREE.Mesh(tailSegmentGeo, pinkMat);
    tailMesh.position.set(0, 0.1, -0.18);
    this.mouseTail.add(tailMesh);
    this.mouseGroup.add(this.mouseTail);

    // Floating Target Indicator (Above Mouse)
    const markerGeo = new THREE.ConeGeometry(0.2, 0.4, 4);
    markerGeo.rotateX(Math.PI);
    const markerMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const marker = new THREE.Mesh(markerGeo, markerMat);
    marker.position.y = 0.95;
    this.mouseGroup.add(marker);

    // Initial position on the rug
    this.mousePosition.set(
      this.interiorRoomCenter.x + 0.5,
      this.interiorRoomCenter.y + 0.05,
      this.interiorRoomCenter.z + 0.5
    );
    this.mouseGroup.position.copy(this.mousePosition);
    this.group.add(this.mouseGroup);
  }

  private setupWaypoints() {
    const cx = this.interiorRoomCenter.x;
    const cy = this.interiorRoomCenter.y;
    const cz = this.interiorRoomCenter.z;

    this.waypoints = [
      new THREE.Vector3(cx - 0.5, cy + 0.05, cz + 0.5), // Center rug
      new THREE.Vector3(cx + 1.8, cy + 0.05, cz + 1.2), // Near coffee table
      new THREE.Vector3(cx, cy + 0.05, cz + 4.5), // Under sofa
      new THREE.Vector3(cx + 4.2, cy + 0.05, cz - 1.8), // Cardboard box
      new THREE.Vector3(cx - 5.5, cy + 0.9, cz - 1.5), // Bookshelf lower tier
      new THREE.Vector3(cx - 5.5, cy + 1.8, cz - 1.5), // Bookshelf mid tier
      new THREE.Vector3(cx + 2.5, cy + 0.05, cz - 4.5), // Fireplace side
      new THREE.Vector3(cx - 3.5, cy + 0.05, cz + 3.0), // West floor
      new THREE.Vector3(cx + 4.5, cy + 0.05, cz + 4.0), // Scratching post
    ];
    this.mouseTargetWaypoint.copy(this.waypoints[0]);
  }

  /**
   * Check if player enters skylight hatch from roof
   */
  public checkSkylightEntry(playerPos: THREE.Vector3): boolean {
    if (this.isPlayerInside) return false;

    const dx = playerPos.x - this.entranceSkylightPos.x;
    const dz = playerPos.z - this.entranceSkylightPos.z;
    const distH = Math.hypot(dx, dz);

    // If cat is above or stepping into skylight
    if (distH < this.skylightRadius && playerPos.y <= this.entranceSkylightPos.y + 1.8 && playerPos.y >= this.entranceSkylightPos.y - 1.5) {
      this.transitionPlayerInside(playerPos);
      return true;
    }
    return false;
  }

  /**
   * Seamless transition into interior room! Cat drops down from ceiling skylight
   */
  public transitionPlayerInside(playerPos: THREE.Vector3) {
    this.isPlayerInside = true;
    // Position cat just under the ceiling skylight, falling down onto the sofa / rug
    playerPos.set(
      this.interiorRoomCenter.x,
      this.interiorRoomCenter.y + this.roomHeight - 0.8,
      this.interiorRoomCenter.z + 1.0
    );
    sound.jump();
    setTimeout(() => {
      sound.meow(1.1);
      sound.mouseSqueak();
    }, 450);
  }

  /**
   * Resolves interior room wall boundaries and furniture steps
   */
  public resolveInteriorCollisions(pos: THREE.Vector3, vel: THREE.Vector3, feetY: number, delta: number): { handled: boolean; floorY?: number; isGrounded?: boolean } {
    if (!this.isPlayerInside) {
      return { handled: false };
    }

    const cx = this.interiorRoomCenter.x;
    const cz = this.interiorRoomCenter.z;
    const half = this.roomSize / 2 - 0.6;

    // 1. Clamp to room perimeter walls
    pos.x = THREE.MathUtils.clamp(pos.x, cx - half, cx + half);
    pos.z = THREE.MathUtils.clamp(pos.z, cz - half, cz + half);

    // 2. Default floor collision (y = 0.2 + 0.55 eye height)
    const baseFloorY = this.interiorRoomCenter.y;
    let targetGroundY = baseFloorY;
    let isOnFurniture = false;

    // Check climbable furniture boxes
    for (const box of this.interiorColliders) {
      if (
        pos.x >= box.minX &&
        pos.x <= box.maxX &&
        pos.z >= box.minZ &&
        pos.z <= box.maxZ
      ) {
        if (feetY >= box.topY - 0.4 && feetY <= box.topY + 0.6) {
          if (box.topY > targetGroundY) {
            targetGroundY = box.topY;
            isOnFurniture = true;
          }
        }
      }
    }

    // Grounding check
    if (feetY <= targetGroundY && vel.y <= 0) {
      pos.y = targetGroundY + 0.55; // cat eye height
      vel.y = 0;
      return { handled: true, isGrounded: true, floorY: targetGroundY };
    }

    return { handled: true, isGrounded: false };
  }

  /**
   * Updates Mouse AI, scurrying path, audio squeaks, and catch detection
   */
  public update(elapsedTime: number, delta: number, playerPos: THREE.Vector3, onCatch?: () => void) {
    if (this.isMouseCaught) {
      // Caught mouse animation: rotate slowly and celebrate
      this.mouseGroup.rotation.y += 3.0 * delta;
      return;
    }

    // Distance between cat and mouse
    const distToCat = this.mousePosition.distanceTo(playerPos);

    // Subtle breathing / tail swish
    if (this.mouseTail) {
      this.mouseTail.rotation.z = Math.sin(elapsedTime * 9) * 0.35;
    }
    if (this.mouseWhiskers) {
      this.mouseWhiskers.rotation.y = Math.sin(elapsedTime * 14) * 0.15;
    }

    // State machine
    this.mouseStateTimer -= delta;

    if (distToCat < 4.2) {
      // Cat is dangerously close! Flee immediately to another waypoint
      if (this.mouseState !== 'scurry') {
        this.mouseState = 'scurry';
        sound.mouseSqueak();
        this.pickFarthestWaypoint(playerPos);
      }
    }

    if (this.mouseState === 'scurry') {
      // Scurry towards target waypoint
      const toTarget = new THREE.Vector3().subVectors(this.mouseTargetWaypoint, this.mousePosition);
      toTarget.y = 0;
      const dist = toTarget.length();

      if (dist > 0.25) {
        toTarget.normalize();
        this.mousePosition.addScaledVector(toTarget, this.mouseSpeed * delta);
        // Face moving direction
        const angle = Math.atan2(toTarget.x, toTarget.z);
        this.mouseGroup.rotation.y = angle;
        // Scampering feet hop
        this.mouseGroup.position.y = this.mousePosition.y + Math.abs(Math.sin(elapsedTime * 22)) * 0.08;
      } else {
        // Arrived at destination
        this.mouseState = 'nibble';
        this.mouseStateTimer = 2.0 + Math.random() * 2.5;
      }
    } else {
      // Nibbling / looking around
      if (this.mouseStateTimer <= 0) {
        this.pickRandomWaypoint();
        this.mouseState = 'scurry';
      }
      this.mouseGroup.rotation.y += Math.sin(elapsedTime * 3) * 0.8 * delta;
    }

    this.mouseGroup.position.x = this.mousePosition.x;
    this.mouseGroup.position.z = this.mousePosition.z;

    // Check catch condition! (Cat gets within 1.25 meters or pounces)
    if (this.isPlayerInside && distToCat < 1.35) {
      this.catchMouse();
      if (onCatch) onCatch();
      if (this.onMouseCaught) this.onMouseCaught();
    }
  }

  private pickFarthestWaypoint(playerPos: THREE.Vector3) {
    let bestWp = this.waypoints[0];
    let maxDist = -1;
    for (const wp of this.waypoints) {
      const d = wp.distanceTo(playerPos);
      if (d > maxDist) {
        maxDist = d;
        bestWp = wp;
      }
    }
    this.mouseTargetWaypoint.copy(bestWp);
    this.mousePosition.y = bestWp.y;
  }

  private pickRandomWaypoint() {
    const idx = Math.floor(Math.random() * this.waypoints.length);
    this.mouseTargetWaypoint.copy(this.waypoints[idx]);
    this.mousePosition.y = this.waypoints[idx].y;
  }

  /**
   * Cat catches the mouse!
   */
  public catchMouse() {
    if (this.isMouseCaught) return;
    this.isMouseCaught = true;
    sound.mouseSqueak();
    sound.eatFood('catnip');
    sound.levelComplete();
  }
}
