import { CatBreed } from '../types/game';

export const CAT_BREEDS: CatBreed[] = [
  {
    id: 'siamese',
    name: 'Siamés Elegante',
    nickname: 'El Acróbata Felino',
    tagline: 'Doble Salto Ágil en el Aire',
    description: 'Ágil y esbelto. Posee un reflejo neuromuscular asombroso que le permite impulsarse de nuevo mientras aún está flotando en el aire.',
    jumpForce: 13.5,
    speed: 10,
    sprintMultiplier: 1.6,
    staminaMax: 100,
    specialAbility: {
      type: 'double_jump',
      name: 'Doble Salto Aéreo',
      description: 'Presiona ESPACIO en el aire para dar una segunda voltereta acrobática hacia arriba.',
      cooldown: 0,
      keyHint: 'ESPACIO (en el aire)',
    },
    pawStyle: {
      furColor: '#e8d8be', // Cream fur
      accentColor: '#3a2318', // Seal point dark brown paws
      padColor: '#4a2e2b', // Dark cocoa pads
      clawColor: '#ffffff',
      patternType: 'points',
    },
    unlockScore: 0, // Starts unlocked!
    unlocked: true,
    avatarIcon: '🐱',
  },
  {
    id: 'tabby',
    name: 'Atigrado Naranja',
    nickname: 'El Saltador Intrépido',
    tagline: 'Super Salto Pounce Cargado',
    description: 'Enérgico y audaz. Puede agacharse para concentrar toda su energía cinética en las patas traseras y lanzarse a través de brechas enormes entre tejados.',
    jumpForce: 13,
    speed: 10.5,
    sprintMultiplier: 1.65,
    staminaMax: 110,
    specialAbility: {
      type: 'power_pounce',
      name: 'Super Salto Cazador',
      description: 'Mantén pulsado [E] o Click Derecho para cargar un salto propulsor masivo hacia adelante.',
      cooldown: 4.5,
      keyHint: 'Mantén [E] o Click Secundario',
    },
    pawStyle: {
      furColor: '#ea8329', // Warm ginger orange
      accentColor: '#96430d', // Orange tabby stripes
      padColor: '#fca5a5', // Bubblegum pink toe beans
      clawColor: '#ffffff',
      patternType: 'stripes',
    },
    unlockScore: 120,
    unlocked: false,
    avatarIcon: '🐯',
  },
  {
    id: 'mainecoon',
    name: 'Maine Coon Gigante',
    nickname: 'El Planeador Nórdico',
    tagline: 'Planeo con Cola Esponjosa',
    description: 'Grande, fuerte y con una cola majestuosa que usa como timón y paracaídas para planear suavemente en caídas libres largas.',
    jumpForce: 12.5,
    speed: 9.5,
    sprintMultiplier: 1.5,
    staminaMax: 135,
    specialAbility: {
      type: 'feather_fall',
      name: 'Planeo con Cola Suave',
      description: 'Mantén pulsado [ESPACIO] durante una caída para abrir la cola y descender flotando con suavidad.',
      cooldown: 0,
      keyHint: 'Mantén [ESPACIO] al caer',
    },
    pawStyle: {
      furColor: '#94a3b8', // Silver tabby grey
      accentColor: '#475569', // Dark charcoal tufts
      padColor: '#64748b', // Slate bean pads
      clawColor: '#e2e8f0',
      patternType: 'fluffy',
    },
    unlockScore: 280,
    unlocked: false,
    avatarIcon: '🦁',
  },
  {
    id: 'blackcat',
    name: 'Pantera de Tejado',
    nickname: 'La Sombra Nocturna',
    tagline: 'Dash Sombra Instantáneo',
    description: 'Misterioso y veloz como un rayo. Capaz de desvanecerse en una estela de humo oscuro y aparecer metros adelante en pleno vuelo.',
    jumpForce: 13.2,
    speed: 11.2,
    sprintMultiplier: 1.75,
    staminaMax: 105,
    specialAbility: {
      type: 'shadow_dash',
      name: 'Impulso Sombra',
      description: 'Presiona [Q] o Click Secundario para un veloz impulso supersónico hacia la dirección de la cámara.',
      cooldown: 3.5,
      keyHint: 'Presiona [Q] o Click Secundario',
    },
    pawStyle: {
      furColor: '#18181b', // Pitch black
      accentColor: '#27272a', // Midnight sheen
      padColor: '#262626', // Jet pads
      clawColor: '#38bdf8', // Sleek glossy claws
      patternType: 'solid',
    },
    unlockScore: 500,
    unlocked: false,
    avatarIcon: '🐈‍⬛',
  },
  {
    id: 'calico',
    name: 'Calicó de la Suerte',
    nickname: 'El Imán de Premios',
    tagline: 'Aura Magnética y Puntos x2',
    description: 'Bendecida por la buena fortuna. El delicioso aroma de la comida vuela directamente hacia ella desde distancias lejanas y duplica sus puntos.',
    jumpForce: 13,
    speed: 10.2,
    sprintMultiplier: 1.6,
    staminaMax: 115,
    specialAbility: {
      type: 'lucky_magnet',
      name: 'Aura Atrae-Comida',
      description: 'Atrae automáticamente pescados y latas a 3 veces más distancia y genera un 50% extra de puntos.',
      cooldown: 0,
      keyHint: 'Pasiva siempre activa',
    },
    pawStyle: {
      furColor: '#f8fafc', // Pure white base
      accentColor: '#f97316', // Orange & black patches
      padColor: '#fda4af', // Sweet pink pads
      clawColor: '#ffffff',
      patternType: 'calico',
    },
    unlockScore: 800,
    unlocked: false,
    avatarIcon: '✨',
  },
  {
    id: 'sphynx',
    name: 'Esfinge Acrobático',
    nickname: 'El Relámpago de Muros',
    tagline: 'Rebote en Paredes y Máxima Agilidad',
    description: 'Sin pelaje que frene su aerodinámica. Puede impulsarse directamente rebotando en las paredes de los edificios para alcanzar tejados inaccesibles.',
    jumpForce: 14.5,
    speed: 12,
    sprintMultiplier: 1.85,
    staminaMax: 125,
    specialAbility: {
      type: 'wall_spring',
      name: 'Rebote Felino en Muros',
      description: 'Salta contra cualquier pared vertical y presiona ESPACIO para hacer un salto de rebote hacia arriba.',
      cooldown: 1.5,
      keyHint: 'ESPACIO contra un muro',
    },
    pawStyle: {
      furColor: '#fed7aa', // Peach flesh tone
      accentColor: '#fdba74', // Warm rosy undertone
      padColor: '#fb7185', // Soft pink toe beans
      clawColor: '#ffffff',
      patternType: 'hairless',
    },
    unlockScore: 1200,
    unlocked: false,
    avatarIcon: '⚡',
  },
];
