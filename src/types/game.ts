export type SpecialAbilityType =
  | 'double_jump'
  | 'power_pounce'
  | 'feather_fall'
  | 'shadow_dash'
  | 'lucky_magnet'
  | 'wall_spring';

export interface PawStyle {
  furColor: string;
  accentColor: string;
  padColor: string;
  clawColor: string;
  patternType?: 'solid' | 'points' | 'stripes' | 'calico' | 'fluffy' | 'hairless';
}

export interface CatBreed {
  id: string;
  name: string;
  nickname: string;
  tagline: string;
  description: string;
  jumpForce: number;
  speed: number;
  sprintMultiplier: number;
  staminaMax: number;
  specialAbility: {
    type: SpecialAbilityType;
    name: string;
    description: string;
    cooldown: number; // in seconds
    keyHint: string;
  };
  pawStyle: PawStyle;
  unlockScore: number;
  unlocked: boolean;
  avatarIcon: string;
}

export type FoodType =
  | 'fish'
  | 'tuna_can'
  | 'chicken'
  | 'milk'
  | 'catnip'
  | 'shrimp';

export interface FoodItemData {
  id: string;
  type: FoodType;
  name: string;
  points: number;
  staminaBoost: number;
  position: [number, number, number];
  collected: boolean;
  color: string;
  scale?: number;
}

export interface BuildingData {
  id: string;
  x: number;
  y: number; // ground level
  z: number;
  width: number;
  height: number;
  depth: number;
  roofType: 'flat' | 'sloped' | 'terrace' | 'balcony';
  wallColor: string;
  roofColor: string;
  windowColor: string;
  hasChimney?: boolean;
  hasWaterTank?: boolean;
  hasVent?: boolean;
  hasAntenna?: boolean;
  hasSolarPanels?: boolean;
  hasPlanter?: boolean;
  planksTo?: [number, number, number]; // connects to another point
}

export interface LevelConfig {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  requiredFood: number;
  totalFood: number;
  targetBasketPosition: [number, number, number];
  spawnPosition: [number, number, number];
  timeLimit?: number;
  skyTheme: 'sunny' | 'sunset' | 'night_neon' | 'twilight' | 'cyberpunk';
  ambientColor: number;
  sunColor: number;
  fogColor: number;
  fogDensity: number;
  unlockScore: number;
  buildings: BuildingData[];
  foodItems: FoodItemData[];
}

export interface PlayerStats {
  score: number;
  totalFoodCollected: number;
  highScore: number;
  unlockedBreeds: string[];
  unlockedLevels: number[];
  completedLevels: number[];
}
