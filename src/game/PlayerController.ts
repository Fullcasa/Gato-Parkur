import * as THREE from 'three';
import { CatBreed, SpecialAbilityType } from '../types/game';
import { WorldBuilder } from './WorldBuilder';
import { CatPawsController } from './CatPaws';
import { sound } from '../services/sound';

export interface PlayerInputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  pitchUp: boolean;
  pitchDown: boolean;
  jump: boolean;
  sprint: boolean;
  special: boolean;
}

export type PlayerMemeCallback = (
  reason: 'fall' | 'dog' | 'rival_cat' | 'puddle' | 'clothesline' | 'wind' | 'collision',
  title: string,
  subtitle: string
) => void;

/**
 * First-person feline player controller.
 * Manages movement kinematics, camera angles, breed special jumping skills,
 * stamina, and cat paw animations.
 */
export class PlayerController {
  public camera: THREE.PerspectiveCamera;
  public paws: CatPawsController;
  public world: WorldBuilder;
  public currentBreed: CatBreed;

  // Position & Velocity
  public position: THREE.Vector3;
  public velocity: THREE.Vector3;
  public lastSafePosition: THREE.Vector3;

  // Camera orientation
  public yaw: number = 0;
  public pitch: number = 0;
  private cameraBobTime: number = 0;

  // Physics & Kinematics constants
  private gravity: number = 24.0;
  public isGrounded: boolean = true;
  private catEyeHeight: number = 0.55;

  // Wall Jump / Wall Climb state
  public isNearWallFacade: boolean = false;
  private currentBobY: number = 0;
  private currentBobTilt: number = 0;

  // Breed Jump Mechanics & States
  private canDoubleJump: boolean = false;
  public isChargingPounce: boolean = false;
  public pounceChargeAmount: number = 0;
  public abilityCooldownTimer: number = 0;

  // Stamina system
  public stamina: number = 100;
  public maxStamina: number = 100;

  // Mobile / Joystick input overrides
  public joystickVector: { x: number; y: number } = { x: 0, y: 0 };
  public onMemeTrigger: PlayerMemeCallback | null = null;
  public wetTimer: number = 0;
  public interiorCollider?: (
    pos: THREE.Vector3,
    vel: THREE.Vector3,
    feetY: number,
    delta: number
  ) => { handled: boolean; floorY?: number; isGrounded?: boolean };

  public input: PlayerInputState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    turnLeft: false,
    turnRight: false,
    pitchUp: false,
    pitchDown: false,
    jump: false,
    sprint: false,
    special: false,
  };

  private prevJumpKey: boolean = false;
  private stepDistanceAccumulator: number = 0;

  constructor(
    camera: THREE.PerspectiveCamera,
    paws: CatPawsController,
    world: WorldBuilder,
    breed: CatBreed,
    onMemeTrigger?: PlayerMemeCallback
  ) {
    this.camera = camera;
    this.camera.rotation.order = 'YXZ';
    this.paws = paws;
    this.world = world;
    this.currentBreed = breed;
    if (onMemeTrigger) {
      this.onMemeTrigger = onMemeTrigger;
    }

    this.position = new THREE.Vector3(0, 10, 0);
    this.velocity = new THREE.Vector3(0, 0, 0);
    this.lastSafePosition = new THREE.Vector3(0, 10, 0);

    this.applyBreedStats(breed);
  }

  public applyBreedStats(breed: CatBreed) {
    this.currentBreed = breed;
    this.maxStamina = breed.staminaMax;
    this.stamina = Math.min(this.stamina, this.maxStamina);
    this.paws.updateBreedStyle(breed.pawStyle);
  }

  public setSpawnPosition(pos: [number, number, number]) {
    this.position.set(pos[0], pos[1] + this.catEyeHeight, pos[2]);
    this.lastSafePosition.copy(this.position);
    this.velocity.set(0, 0, 0);
    this.isGrounded = true;
  }

  public triggerWetEffect() {
    this.wetTimer = 2.5;
    this.paws.triggerWetShake();
  }

  /**
   * Directly adjust pitch (vertical look angle) without toggling movement or input flags.
   * Safe for macOS Command / Ctrl key shortcuts.
   */
  public adjustPitch(deltaAngle: number) {
    const maxPitch = Math.PI / 2 - 0.05;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch + deltaAngle));
  }

  /**
   * Directly adjust yaw (horizontal look angle)
   */
  public adjustYaw(deltaAngle: number) {
    this.yaw += deltaAngle;
  }

  /**
   * Completely clear all input states to prevent keys from sticking when modifier keys are pressed/released
   */
  public resetInputs() {
    this.input.forward = false;
    this.input.backward = false;
    this.input.left = false;
    this.input.right = false;
    this.input.jump = false;
    this.input.sprint = false;
    this.input.special = false;
    this.input.turnLeft = false;
    this.input.turnRight = false;
    this.input.pitchUp = false;
    this.input.pitchDown = false;
    this.joystickVector = { x: 0, y: 0 };
    this.isChargingPounce = false;
    this.pounceChargeAmount = 0;
  }

  /**
   * Updates camera rotation from mouse / touch delta
   */
  public addLookDelta(deltaX: number, deltaY: number) {
    const sensitivity = 0.0024;
    this.yaw -= deltaX * sensitivity;
    this.pitch -= deltaY * sensitivity;

    // Clamp pitch between looking straight down and straight up
    const maxPitch = Math.PI / 2 - 0.05;
    this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));
  }

  /**
   * Trigger primary Meow
   */
  public triggerMeow() {
    const pitch = this.currentBreed.id === 'siamese' ? 1.25 :
                  this.currentBreed.id === 'mainecoon' ? 0.8 :
                  this.currentBreed.id === 'sphynx' ? 1.15 : 1.0;
    sound.meow(pitch);
  }

  /**
   * Trigger paw swipe attack
   */
  public triggerPawSwipe() {
    this.paws.swipe();
    sound.pawStep();
  }

  /**
   * Activate Breed Special Ability
   */
  public triggerSpecialAbility() {
    if (this.abilityCooldownTimer > 0) return;

    const ability = this.currentBreed.specialAbility.type;

    if (ability === 'shadow_dash') {
      // Dash forward in camera look direction
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.velocity.x += forward.x * 24;
      this.velocity.z += forward.z * 24;
      this.velocity.y += 2.5;
      sound.specialAbility('shadow_dash');
      this.abilityCooldownTimer = this.currentBreed.specialAbility.cooldown;
      this.paws.swipe();
    } else if (ability === 'power_pounce') {
      const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
      this.velocity.x += forward.x * 20;
      this.velocity.z += forward.z * 20;
      this.velocity.y = 15;
      this.isGrounded = false;
      sound.specialAbility('power_pounce');
      sound.jump();
      this.abilityCooldownTimer = this.currentBreed.specialAbility.cooldown;
    }
  }

  /**
   * Main Physics & Locomotion Update Loop
   */
  public update(delta: number) {
    // Decrement ability cooldown
    if (this.abilityCooldownTimer > 0) {
      this.abilityCooldownTimer = Math.max(0, this.abilityCooldownTimer - delta);
    }

    // Wet paw timer
    if (this.wetTimer > 0) {
      this.wetTimer = Math.max(0, this.wetTimer - delta);
    }

    // Keyboard Turn (Left / Right arrows look and turn)
    let turningDirection = 0;
    if (this.input.turnLeft) {
      this.yaw += 2.5 * delta;
      turningDirection = 1;
    }
    if (this.input.turnRight) {
      this.yaw -= 2.5 * delta;
      turningDirection = -1;
    }

    // Keyboard Pitch (Command / Ctrl + Up/Down arrows tilt view up/down)
    if (this.input.pitchUp) {
      this.pitch = Math.min(Math.PI / 2 - 0.05, this.pitch + 2.2 * delta);
    }
    if (this.input.pitchDown) {
      this.pitch = Math.max(-Math.PI / 2 + 0.05, this.pitch - 2.2 * delta);
    }

    // Determine movement intent
    let moveX = 0;
    let moveZ = 0;

    if (this.input.forward) moveZ -= 1;
    if (this.input.backward) moveZ += 1;
    if (this.input.left) moveX -= 1;
    if (this.input.right) moveX += 1;

    // Merge mobile joystick
    if (Math.abs(this.joystickVector.x) > 0.05 || Math.abs(this.joystickVector.y) > 0.05) {
      moveX += this.joystickVector.x;
      moveZ += this.joystickVector.y;
    }

    const inputLength = Math.hypot(moveX, moveZ);
    if (inputLength > 1) {
      moveX /= inputLength;
      moveZ /= inputLength;
    }

    const isMoving = inputLength > 0.1;

    // Sprinting & Stamina
    let isSprinting = false;
    if (this.input.sprint && isMoving && this.stamina > 5) {
      isSprinting = true;
      this.stamina = Math.max(0, this.stamina - delta * 22);
    } else {
      // Regenerate stamina when not sprinting
      this.stamina = Math.min(this.maxStamina, this.stamina + delta * 18);
    }

    // Breed specific base speeds (reduced if paws are wet!)
    const wetSlowdown = this.wetTimer > 0 ? 0.6 : 1.0;
    const speed = this.currentBreed.speed * (isSprinting ? this.currentBreed.sprintMultiplier : 1.0) * wetSlowdown;

    // Transform move vector by camera yaw
    const forward = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    const targetVelocityX = (forward.x * -moveZ + right.x * moveX) * speed;
    const targetVelocityZ = (forward.z * -moveZ + right.z * moveX) * speed;

    // Smooth horizontal acceleration
    const accelRate = this.isGrounded ? 16 : 8;
    this.velocity.x = THREE.MathUtils.damp(this.velocity.x, targetVelocityX, accelRate, delta);
    this.velocity.z = THREE.MathUtils.damp(this.velocity.z, targetVelocityZ, accelRate, delta);

    // Jump Input Handling
    const jumpPressed = this.input.jump;
    const justPressedJump = jumpPressed && !this.prevJumpKey;

    // Check Wall Proximity for Wall Jump / Wall Climb ("subir los muros saltando")
    const wallInfo = this.world.isNearWall(this.position, 0.95);
    this.isNearWallFacade = wallInfo.near;

    if (justPressedJump) {
      if (wallInfo.near && (!this.isGrounded || this.position.y < wallInfo.wallTopY)) {
        // Wall Jump / Wall Climb! (Escalada felina contra la pared de cualquier edificio)
        this.velocity.y = Math.max(13.2, this.currentBreed.jumpForce * 1.08);
        // Propel slightly towards view direction so the cat climbs up and mantles onto the roof
        this.velocity.x += forward.x * 2.8;
        this.velocity.z += forward.z * 2.8;
        this.isGrounded = false;
        this.canDoubleJump = true;
        this.paws.swipe();
        sound.wallClimb();
      } else if (this.isGrounded) {
        // Normal ground jump
        this.velocity.y = this.currentBreed.jumpForce;
        this.isGrounded = false;
        this.canDoubleJump = this.currentBreed.specialAbility.type === 'double_jump';
        sound.jump();
      } else if (this.canDoubleJump && this.currentBreed.specialAbility.type === 'double_jump') {
        // Siamese Double Jump in mid-air!
        this.velocity.y = this.currentBreed.jumpForce * 0.95;
        this.canDoubleJump = false;
        sound.specialAbility('double_jump');
        this.paws.swipe();
      } else if (this.currentBreed.specialAbility.type === 'wall_spring') {
        // Sphynx Wall Spring leap!
        this.velocity.y = this.currentBreed.jumpForce * 1.1;
        this.velocity.x *= 1.3;
        this.velocity.z *= 1.3;
        sound.specialAbility('wall_spring');
      }
    }

    // Special Ability Hold (Tabby Power Pounce charge)
    if (this.currentBreed.specialAbility.type === 'power_pounce') {
      if (this.input.special && this.abilityCooldownTimer <= 0) {
        this.isChargingPounce = true;
        this.pounceChargeAmount = Math.min(1.0, this.pounceChargeAmount + delta * 1.5);
      } else if (this.isChargingPounce) {
        // Release charged leap!
        const pounceForce = 14 + this.pounceChargeAmount * 16;
        const forwardDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
        this.velocity.x = forwardDir.x * pounceForce;
        this.velocity.z = forwardDir.z * pounceForce;
        this.velocity.y = 10 + this.pounceChargeAmount * 6;
        this.isGrounded = false;
        this.isChargingPounce = false;
        this.pounceChargeAmount = 0;
        this.abilityCooldownTimer = this.currentBreed.specialAbility.cooldown;
        sound.specialAbility('power_pounce');
        sound.jump();
      }
    } else if (this.input.special && this.abilityCooldownTimer <= 0) {
      this.triggerSpecialAbility();
    }

    this.prevJumpKey = jumpPressed;

    // Maine Coon Feather Fall glide logic
    let effectiveGravity = this.gravity;
    if (!this.isGrounded && this.input.jump && this.currentBreed.specialAbility.type === 'feather_fall' && this.velocity.y < 0) {
      effectiveGravity = this.gravity * 0.28;
    }

    // Apply Gravity
    if (!this.isGrounded) {
      this.velocity.y -= effectiveGravity * delta;
    }

    // Position integration
    this.position.x += this.velocity.x * delta;
    this.position.y += this.velocity.y * delta;
    this.position.z += this.velocity.z * delta;

    // Check custom interior collider if player is inside the house
    if (this.interiorCollider) {
      const result = this.interiorCollider(this.position, this.velocity, this.position.y - this.catEyeHeight, delta);
      if (result.handled) {
        if (result.isGrounded) {
          if (!this.isGrounded) {
            this.isGrounded = true;
            this.canDoubleJump = false;
            this.paws.triggerLandSquash();
            sound.land();
          }
          this.lastSafePosition.copy(this.position);
        } else {
          this.isGrounded = false;
        }
        return;
      }
    }

    // Resolve outdoor wall & railing collisions
    this.world.resolveWallCollision(this.position, 0.42);
    this.world.resolveRailingCollision(this.position, 0.40);

    // Check rooftop landing collision
    const feetY = this.position.y - this.catEyeHeight;
    const roofCheck = this.world.getRoofHeightAt(this.position.x, this.position.z, feetY);

    if (roofCheck.onRoof && feetY <= roofCheck.topY && this.velocity.y <= 0) {
      // Land on rooftop
      this.position.y = roofCheck.topY + this.catEyeHeight;
      this.velocity.y = 0;

      if (!this.isGrounded) {
        this.isGrounded = true;
        this.canDoubleJump = false;
        this.paws.triggerLandSquash();
        sound.land();
      }

      // Record safe landing spot
      this.lastSafePosition.copy(this.position);
    } else if (feetY > (roofCheck.onRoof ? roofCheck.topY : 0.05)) {
      this.isGrounded = false;
    }

    // Fall safety recovery & Meme trigger!
    // Street level is at y = -1 (cat eye height around -0.45), so only trigger out-of-bounds rescue if falling into the deep abyss below -8.0m!
    if (this.position.y < -8.0) {
      this.position.copy(this.lastSafePosition);
      this.velocity.set(0, 0, 0);
      this.isGrounded = true;
      sound.fallRescue();

      if (this.onMemeTrigger) {
        this.onMemeTrigger(
          'fall',
          '¡¡MIAU MIAU MIAU MIAU!!',
          '¡Caíste al vacío! Tus 7 vidas te devuelven al último tejado seguro.'
        );
      }
    }

    // Footstep audio cues
    if (this.isGrounded && isMoving) {
      this.stepDistanceAccumulator += inputLength * speed * delta;
      if (this.stepDistanceAccumulator > 2.2) {
        this.stepDistanceAccumulator = 0;
        sound.pawStep();
      }
    }

    // Camera bobbing when running / walking (damped smoothly so it never snaps or trembles)
    if (this.isGrounded && isMoving) {
      this.cameraBobTime += delta * 11 * (isSprinting ? 1.3 : 1.0);
    }

    const targetBobY = this.isGrounded && isMoving ? Math.sin(this.cameraBobTime) * 0.022 : 0;
    const targetBobTilt = this.isGrounded && isMoving ? Math.cos(this.cameraBobTime * 0.5) * 0.008 : 0;
    this.currentBobY = THREE.MathUtils.damp(this.currentBobY, targetBobY, 10, delta);
    this.currentBobTilt = THREE.MathUtils.damp(this.currentBobTilt, targetBobTilt, 10, delta);

    // Sync Three.js Camera (Order YXZ prevents cross-coupling jitter)
    this.camera.position.set(this.position.x, this.position.y + this.currentBobY, this.position.z);
    this.camera.rotation.set(0, 0, 0);
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
    this.camera.rotation.z = this.currentBobTilt;

    // Update First-Person Cat Paws & Ears
    this.paws.update(delta, isMoving, isSprinting, this.isGrounded, this.velocity, turningDirection);
  }
}
