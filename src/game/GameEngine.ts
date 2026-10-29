import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import confetti from 'canvas-confetti';
import { CatBreed, LevelConfig, PlayerStats } from '../types/game';
import { CAT_BREEDS } from '../data/breeds';
import { LEVELS } from '../data/levels';
import { WorldBuilder } from './WorldBuilder';
import { FoodItemCollectible } from './FoodGenerator';
import { CatPawsController } from './CatPaws';
import { PlayerController } from './PlayerController';
import { HazardsManager } from './Hazards';
import { HouseInterior } from './HouseInterior';
import { sound } from '../services/sound';

export interface GameEngineCallbacks {
  onScoreUpdate: (score: number, foodCount: number, totalFood: number) => void;
  onStaminaUpdate: (stamina: number, maxStamina: number) => void;
  onAbilityUpdate: (cooldown: number, isCharging: boolean, chargePct: number) => void;
  onLevelComplete: (levelId: number, score: number, stars: number) => void;
  onFoodCollectedNotification: (name: string, points: number, color: string) => void;
  onCompassUpdate: (angleDeg: number, distanceM: number, targetType: 'food' | 'house' | 'mouse') => void;
  onMemeTrigger: (reason: string, title: string, subtitle: string) => void;
  onLocationChange?: (isInside: boolean) => void;
}

/**
 * Master 3D Game Engine for GatoParkour 3D.
 */
export class GameEngine {
  private container: HTMLElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private world: WorldBuilder;
  private paws: CatPawsController;
  private hazards: HazardsManager;
  public houseInterior!: HouseInterior;
  public player: PlayerController;
  private foodItems: FoodItemCollectible[] = [];

  private currentLevelIndex: number = 0;
  public currentLevel: LevelConfig;
  public selectedBreed: CatBreed;

  private clock: THREE.Clock;
  private animFrameId: number = 0;
  private isDestroyed: boolean = false;
  private isSoftwareGl: boolean = false;

  // Game Stats
  public stats: PlayerStats;
  public levelFoodCollected: number = 0;
  private callbacks: GameEngineCallbacks;

  // Lighting & Environment
  private sunLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;

  constructor(container: HTMLElement, callbacks: GameEngineCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.clock = new THREE.Clock();

    // 1. Detect Software WebGL (as mandated by Three.js skill)
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Initialize Three.js Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(this.renderer.domElement);

    // 3. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 800);

    // 4. Studio Environment Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Key Sun Light
    this.sunLight = new THREE.DirectionalLight(0xfff7ed, 1.4);
    this.sunLight.position.set(45, 60, 30);
    this.sunLight.castShadow = !this.isSoftwareGl;
    this.sunLight.shadow.mapSize.width = 1024;
    this.sunLight.shadow.mapSize.height = 1024;
    this.sunLight.shadow.bias = -0.0005;
    this.sunLight.shadow.normalBias = 0.02;
    const d = 50;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;
    this.scene.add(this.sunLight);

    // Hemisphere Ambient Fill
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x334155, 0.7);
    this.scene.add(this.hemiLight);

    // 5. First-Person Cat Paws & Ears
    this.paws = new CatPawsController();
    this.camera.add(this.paws.group);
    this.scene.add(this.camera);

    // 6. World Builder
    this.world = new WorldBuilder(this.renderer);
    this.scene.add(this.world.group);

    // 7. Hazards & Obstacles
    this.hazards = new HazardsManager();
    this.scene.add(this.hazards.group);

    // 8. Load Player Stats from LocalStorage
    this.stats = this.loadStats();

    // 9. Default Breed & Level
    this.selectedBreed = CAT_BREEDS[0];
    this.currentLevel = LEVELS[0];

    // 10. Player Controller with meme callback
    this.player = new PlayerController(
      this.camera,
      this.paws,
      this.world,
      this.selectedBreed,
      (reason, title, subtitle) => {
        this.callbacks.onMemeTrigger(reason, title, subtitle);
      }
    );

    // 11. Load Initial Level
    this.loadLevel(this.currentLevelIndex);

    // 12. Handle window resize
    window.addEventListener('resize', this.onWindowResize);

    // 13. Start Game Loop
    this.tick = this.tick.bind(this);
    this.animFrameId = requestAnimationFrame(this.tick);
  }

  private loadStats(): PlayerStats {
    try {
      const saved = localStorage.getItem('gatoparkour_stats_v1');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      score: 0,
      totalFoodCollected: 0,
      highScore: 0,
      unlockedBreeds: ['siamese'],
      unlockedLevels: [1],
      completedLevels: [],
    };
  }

  private saveStats() {
    try {
      localStorage.setItem('gatoparkour_stats_v1', JSON.stringify(this.stats));
    } catch {
      // ignore
    }
  }

  public setBreed(breedId: string) {
    const found = CAT_BREEDS.find((b) => b.id === breedId);
    if (found) {
      this.selectedBreed = found;
      this.player.applyBreedStats(found);
      this.player.triggerMeow();
    }
  }

  public unlockBreed(breedId: string): boolean {
    const breed = CAT_BREEDS.find((b) => b.id === breedId);
    if (!breed) return false;
    if (this.stats.score >= breed.unlockScore && !this.stats.unlockedBreeds.includes(breedId)) {
      this.stats.unlockedBreeds.push(breedId);
      this.saveStats();
      this.setBreed(breedId);
      confetti({ particleCount: 40, spread: 60 });
      return true;
    }
    return false;
  }

  public loadLevel(levelIndex: number) {
    if (levelIndex < 0 || levelIndex >= LEVELS.length) return;
    this.currentLevelIndex = levelIndex;
    this.currentLevel = LEVELS[levelIndex];
    this.levelFoodCollected = 0;

    // Apply Level Atmosphere & Fog
    this.scene.fog = new THREE.FogExp2(this.currentLevel.fogColor, this.currentLevel.fogDensity);
    this.scene.background = new THREE.Color(this.currentLevel.fogColor);
    this.sunLight.color.set(this.currentLevel.sunColor);
    this.hemiLight.color.set(this.currentLevel.ambientColor);

    // Build World Architecture
    this.world.buildLevel(this.currentLevel);

    // Build Target House Interior & Living Room (with skylight entrance & mouse)
    if (this.houseInterior) {
      this.scene.remove(this.houseInterior.group);
    }
    this.houseInterior = new HouseInterior(this.currentLevel.targetBasketPosition, () => {
      this.handleLevelCompleted();
    });
    this.scene.add(this.houseInterior.group);
    this.player.interiorCollider = this.houseInterior.resolveInteriorCollisions.bind(this.houseInterior);
    this.callbacks.onLocationChange?.(false);

    // Spawn Hazards for this level (dogs, mice, rival cats, puddles, pigeons, etc.)
    this.hazards.spawnHazardsForLevel(this.currentLevel.id);

    // Spawn Food Items
    this.foodItems.forEach((f) => {
      this.scene.remove(f.group);
    });
    this.foodItems = this.currentLevel.foodItems.map((foodData) => {
      const item = new FoodItemCollectible(foodData);
      this.scene.add(item.group);
      return item;
    });

    // Spawn Player
    this.player.setSpawnPosition(this.currentLevel.spawnPosition);

    // Update initial callbacks
    this.callbacks.onScoreUpdate(this.stats.score, 0, this.currentLevel.totalFood);
    this.callbacks.onStaminaUpdate(this.player.stamina, this.player.maxStamina);
  }

  public restartCurrentLevel() {
    this.loadLevel(this.currentLevelIndex);
  }

  public nextLevel() {
    if (this.currentLevelIndex + 1 < LEVELS.length) {
      this.loadLevel(this.currentLevelIndex + 1);
    }
  }

  private onWindowResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  /**
   * Main Animation Loop
   */
  private tick() {
    if (this.isDestroyed) return;

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsedTime = this.clock.getElapsedTime();

    // 1. Update Player Controller Kinematics
    this.player.update(delta);

    // 2. Check Skylight entry from rooftop
    if (!this.houseInterior.isPlayerInside) {
      const entered = this.houseInterior.checkSkylightEntry(this.player.position);
      if (entered) {
        this.callbacks.onLocationChange?.(true);
        this.callbacks.onFoodCollectedNotification('¡Entraste a la Casa del Ratón!', 100, '#fbbf24');
      }
    }

    // 3. Update Rooftop Hazards & Check Collisions (only when outside)
    if (!this.houseInterior.isPlayerInside) {
      const hazardEvent = this.hazards.update(elapsedTime, delta, this.player.position);
      if (hazardEvent) {
        if (hazardEvent.isPositive) {
          this.stats.score += hazardEvent.points;
          this.saveStats();
          this.callbacks.onFoodCollectedNotification(hazardEvent.message, hazardEvent.points, '#10b981');
        } else {
          if (hazardEvent.pushback) {
            this.player.velocity.add(hazardEvent.pushback);
          }
          if (hazardEvent.type === 'puddle') {
            this.player.triggerWetEffect();
          }
          this.callbacks.onMemeTrigger(hazardEvent.type, '¡¡MIAU MIAU MIAU MIAU!!', hazardEvent.message);
        }
      }
    }

    // 4. Update Food Items & Check Pickup
    const isCalico = this.selectedBreed.id === 'calico';
    const pickupRadius = isCalico ? 3.8 : 1.7; // Calico has lucky magnetic aura!
    const playerPos = this.player.position;

    let nearestFoodDist = Infinity;
    let nearestTargetPos = this.houseInterior.entranceSkylightPos;
    let targetType: 'food' | 'house' | 'mouse' = 'food';

    if (!this.houseInterior.isPlayerInside) {
      for (const food of this.foodItems) {
        if (!food.isCollected) {
          food.update(elapsedTime);

          const dist = food.group.position.distanceTo(playerPos);

          // Track nearest food for compass
          if (dist < nearestFoodDist) {
            nearestFoodDist = dist;
            nearestTargetPos = food.group.position;
          }

          // Magnetism pull if close (Calico passive)
          if (isCalico && dist < pickupRadius + 1.5) {
            food.group.position.lerp(playerPos, delta * 3.5);
          }

          // Collect food when touched
          if (dist < pickupRadius) {
            const bonusMult = isCalico ? 0.5 : 0;
            const collectedResult = food.collect(bonusMult);

            this.levelFoodCollected += 1;
            this.stats.score += collectedResult.points;
            this.stats.totalFoodCollected += 1;
            if (this.stats.score > this.stats.highScore) {
              this.stats.highScore = this.stats.score;
            }
            this.saveStats();

            // Stamina boost
            this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + collectedResult.staminaBoost);

            // Audio & Visual notification
            sound.eatFood(food.data.type);
            this.callbacks.onFoodCollectedNotification(collectedResult.name, collectedResult.points, food.data.color);
            this.callbacks.onScoreUpdate(this.stats.score, this.levelFoodCollected, this.currentLevel.totalFood);
          }
        }
      }

      // If all required food collected, compass points directly to Target House Skylight!
      if (this.levelFoodCollected >= this.currentLevel.requiredFood) {
        nearestTargetPos = this.houseInterior.entranceSkylightPos;
        nearestFoodDist = playerPos.distanceTo(nearestTargetPos);
        targetType = 'house';
      } else {
        targetType = 'food';
      }
    } else {
      // Inside House: update Mouse AI & hunt
      this.houseInterior.update(elapsedTime, delta, this.player.position, () => {
        this.handleLevelCompleted();
      });

      const distToMouse = this.player.position.distanceTo(this.houseInterior.mousePosition);
      // Paw swipe within reach also catches the mouse!
      if (this.paws.isSwiping && distToMouse < 2.0 && !this.houseInterior.isMouseCaught) {
        this.houseInterior.catchMouse();
        this.handleLevelCompleted();
      }

      nearestTargetPos = this.houseInterior.mousePosition;
      nearestFoodDist = distToMouse;
      targetType = 'mouse';
    }

    // 5. Compute Compass Angle & Distance to Target
    const dx = nearestTargetPos.x - playerPos.x;
    const dz = nearestTargetPos.z - playerPos.z;
    const targetAngle = Math.atan2(dx, -dz);
    let relativeAngle = targetAngle - this.player.yaw;
    while (relativeAngle > Math.PI) relativeAngle -= Math.PI * 2;
    while (relativeAngle < -Math.PI) relativeAngle += Math.PI * 2;
    this.callbacks.onCompassUpdate((relativeAngle * 180) / Math.PI, Math.round(nearestFoodDist), targetType);

    // 6. Update UI HUD Callbacks
    this.callbacks.onStaminaUpdate(this.player.stamina, this.player.maxStamina);
    this.callbacks.onAbilityUpdate(
      this.player.abilityCooldownTimer,
      this.player.isChargingPounce,
      this.player.pounceChargeAmount
    );

    // 7. Render Scene
    this.renderer.render(this.scene, this.camera);

    this.animFrameId = requestAnimationFrame(this.tick);
  }

  private handleLevelCompleted() {
    // Avoid double firing
    if (this.stats.completedLevels.includes(this.currentLevel.id)) {
      // already cleared, award small bonus
    } else {
      this.stats.completedLevels.push(this.currentLevel.id);
      // Unlock next level if available
      const nextLevelId = this.currentLevel.id + 1;
      if (!this.stats.unlockedLevels.includes(nextLevelId) && nextLevelId <= LEVELS.length) {
        this.stats.unlockedLevels.push(nextLevelId);
      }
    }

    // Calculate stars: 3 stars if all food collected, 2 stars if >= required + 2, else 1 star
    const stars = this.levelFoodCollected >= this.currentLevel.totalFood ? 3 :
                  this.levelFoodCollected >= this.currentLevel.requiredFood + 2 ? 2 : 1;

    // Bonus points for level clear
    const levelBonus = 150 * stars;
    this.stats.score += levelBonus;
    this.saveStats();

    // Celebration sounds and confetti!
    sound.levelComplete();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
    });

    this.callbacks.onLevelComplete(this.currentLevel.id, levelBonus, stars);
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.animFrameId);
    window.removeEventListener('resize', this.onWindowResize);

    if (this.renderer) {
      this.renderer.dispose();
      if (this.container && this.renderer.domElement) {
        this.container.removeChild(this.renderer.domElement);
      }
    }
  }
}
