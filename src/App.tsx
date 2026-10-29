import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { CAT_BREEDS } from './data/breeds';
import { LEVELS } from './data/levels';
import { CatBreed, LevelConfig } from './types/game';
import { TopHUD } from './components/TopHUD';
import { CinemaBottomDock } from './components/CinemaBottomDock';
import { TouchControls } from './components/TouchControls';
import { ClickToPlayOverlay } from './components/ClickToPlayOverlay';
import { BreedSelectorModal } from './components/BreedSelectorModal';
import { LevelSelectorModal } from './components/LevelSelectorModal';
import { ControlsHelpModal } from './components/ControlsHelpModal';
import { VictoryModal } from './components/VictoryModal';
import { MemeCatOverlay, MemeData } from './components/MemeCatOverlay';
import { sound } from './services/sound';

export default function App() {
  const mountRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // UI state
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [foodCount, setFoodCount] = useState(0);
  const [totalFood, setTotalFood] = useState(14);
  const [stamina, setStamina] = useState(100);
  const [maxStamina, setMaxStamina] = useState(100);
  const [abilityCooldown, setAbilityCooldown] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [chargePct, setChargePct] = useState(0);
  const [compassAngle, setCompassAngle] = useState(0);
  const [compassDistance, setCompassDistance] = useState(0);
  const [targetType, setTargetType] = useState<'food' | 'house' | 'mouse'>('food');
  const [isInsideHouse, setIsInsideHouse] = useState(false);
  const [pickupNotice, setPickupNotice] = useState<{ name: string; points: number; color: string } | null>(null);

  // Meme state
  const [memeData, setMemeData] = useState<MemeData>({
    isOpen: false,
    title: '',
    subtitle: '',
    reason: 'fall',
  });

  const [currentBreed, setCurrentBreed] = useState<CatBreed>(CAT_BREEDS[0]);
  const [currentLevel, setCurrentLevel] = useState<LevelConfig>(LEVELS[0]);
  const [unlockedBreeds, setUnlockedBreeds] = useState<string[]>(['siamese']);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]);
  const [completedLevels, setCompletedLevels] = useState<number[]>([]);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  // Modals state
  const [isPointerLocked, setIsPointerLocked] = useState(false);
  const [showBreedModal, setShowBreedModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [victoryData, setVictoryData] = useState<{
    isOpen: boolean;
    levelId: number;
    bonusScore: number;
    stars: number;
  }>({
    isOpen: false,
    levelId: 1,
    bonusScore: 0,
    stars: 1,
  });

  // Initialize Game Engine
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(mountRef.current, {
      onScoreUpdate: (newScore, count, total) => {
        setScore(newScore);
        setFoodCount(count);
        setTotalFood(total);
      },
      onStaminaUpdate: (curStamina, maxStam) => {
        setStamina(curStamina);
        setMaxStamina(maxStam);
      },
      onAbilityUpdate: (cooldown, charging, pct) => {
        setAbilityCooldown(cooldown);
        setIsCharging(charging);
        setChargePct(pct);
      },
      onLevelComplete: (lvlId, bonus, stars) => {
        setVictoryData({
          isOpen: true,
          levelId: lvlId,
          bonusScore: bonus,
          stars,
        });
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      },
      onFoodCollectedNotification: (name, points, color) => {
        setPickupNotice({ name, points, color });
        setTimeout(() => {
          setPickupNotice(null);
        }, 1800);
      },
      onCompassUpdate: (deg, dist, type) => {
        setCompassAngle(deg);
        setCompassDistance(dist);
        if (type) setTargetType(type);
      },
      onLocationChange: (isInside) => {
        setIsInsideHouse(isInside);
      },
      onMemeTrigger: (reason, title, subtitle) => {
        setMemeData({
          isOpen: true,
          reason: reason as MemeData['reason'],
          title,
          subtitle,
        });
      },
    });

    engineRef.current = engine;
    setCurrentBreed(engine.selectedBreed);
    setCurrentLevel(engine.currentLevel);
    setUnlockedBreeds(engine.stats.unlockedBreeds);
    setUnlockedLevels(engine.stats.unlockedLevels);
    setCompletedLevels(engine.stats.completedLevels);
    setHighScore(engine.stats.highScore);

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const player = engineRef.current?.player;
      if (!player) return;

      // On MacBook or PC: Command / Ctrl + ArrowUp/ArrowDown ONLY tilts vertical pitch look!
      const isCmdOrCtrl = e.metaKey || e.ctrlKey || e.altKey;

      if (isCmdOrCtrl) {
        if (e.code === 'ArrowUp') {
          e.preventDefault();
          e.stopPropagation();
          player.input.forward = false;
          player.input.pitchUp = false;
          player.adjustPitch(0.12);
          return;
        }
        if (e.code === 'ArrowDown') {
          e.preventDefault();
          e.stopPropagation();
          player.input.backward = false;
          player.input.pitchDown = false;
          player.adjustPitch(-0.12);
          return;
        }
        if (e.code === 'ArrowLeft') {
          e.preventDefault();
          e.stopPropagation();
          player.adjustYaw(0.14);
          return;
        }
        if (e.code === 'ArrowRight') {
          e.preventDefault();
          e.stopPropagation();
          player.adjustYaw(-0.14);
          return;
        }
      }

      // If modifier key itself is pressed, clear inputs to avoid stuck keys
      if (e.key === 'Meta' || e.key === 'Control' || e.key === 'Alt' || e.code === 'MetaLeft' || e.code === 'MetaRight') {
        player.resetInputs();
        return;
      }

      // Regular Arrow keys (walk and turn)
      if (e.code === 'ArrowUp') {
        player.input.forward = true;
        return;
      }
      if (e.code === 'ArrowDown') {
        player.input.backward = true;
        return;
      }
      if (e.code === 'ArrowLeft') {
        player.input.turnLeft = true;
        return;
      }
      if (e.code === 'ArrowRight') {
        player.input.turnRight = true;
        return;
      }

      switch (e.code) {
        case 'KeyW':
          player.input.forward = true;
          break;
        case 'KeyS':
          player.input.backward = true;
          break;
        case 'KeyA':
          player.input.left = true;
          break;
        case 'KeyD':
          player.input.right = true;
          break;
        case 'PageUp':
        case 'KeyR':
          player.adjustPitch(0.12);
          break;
        case 'PageDown':
        case 'KeyC':
          player.adjustPitch(-0.12);
          break;
        case 'Space':
          player.input.jump = true;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          player.input.sprint = true;
          break;
        case 'KeyE':
        case 'KeyQ':
          player.input.special = true;
          break;
        case 'KeyF':
          player.triggerPawSwipe();
          break;
        case 'KeyM':
          player.triggerMeow();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const player = engineRef.current?.player;
      if (!player) return;

      // When modifier keys are released, reset all inputs so nothing stays stuck
      if (e.key === 'Meta' || e.key === 'Control' || e.key === 'Alt' || e.code === 'MetaLeft' || e.code === 'MetaRight') {
        player.resetInputs();
        return;
      }

      if (e.code === 'ArrowUp') {
        player.input.forward = false;
        player.input.pitchUp = false;
        return;
      }

      if (e.code === 'ArrowDown') {
        player.input.backward = false;
        player.input.pitchDown = false;
        return;
      }

      if (e.code === 'ArrowLeft') {
        player.input.turnLeft = false;
        return;
      }

      if (e.code === 'ArrowRight') {
        player.input.turnRight = false;
        return;
      }

      switch (e.code) {
        case 'KeyW':
          player.input.forward = false;
          break;
        case 'KeyS':
          player.input.backward = false;
          break;
        case 'KeyA':
          player.input.left = false;
          break;
        case 'KeyD':
          player.input.right = false;
          break;
        case 'PageUp':
        case 'KeyR':
          player.input.pitchUp = false;
          break;
        case 'PageDown':
        case 'KeyC':
          player.input.pitchDown = false;
          break;
        case 'Space':
          player.input.jump = false;
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          player.input.sprint = false;
          break;
        case 'KeyE':
        case 'KeyQ':
          player.input.special = false;
          break;
      }
    };

    const handleReset = () => {
      engineRef.current?.player.resetInputs();
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        engineRef.current?.player.addLookDelta(e.movementX, e.movementY);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        if (e.button === 0) {
          // Left click: paw swipe!
          engineRef.current?.player.triggerPawSwipe();
        } else if (e.button === 2) {
          // Right click: special ability!
          if (engineRef.current?.player) {
            engineRef.current.player.input.special = true;
          }
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (document.pointerLockElement && e.button === 2) {
        if (engineRef.current?.player) {
          engineRef.current.player.input.special = false;
        }
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (document.pointerLockElement) {
        e.preventDefault();
      }
    };

    const handlePointerLockChange = () => {
      setIsPointerLocked(!!document.pointerLockElement);
      if (!document.pointerLockElement) {
        engineRef.current?.player.resetInputs();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('blur', handleReset);
    window.addEventListener('focus', handleReset);
    document.addEventListener('visibilitychange', handleReset);
    document.addEventListener('pointerlockchange', handlePointerLockChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('blur', handleReset);
      window.removeEventListener('focus', handleReset);
      document.removeEventListener('visibilitychange', handleReset);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
    };
  }, []);

  const requestPlay = useCallback(() => {
    if (mountRef.current) {
      mountRef.current.requestPointerLock?.();
    }
  }, []);

  const handleSelectBreed = (breedId: string) => {
    engineRef.current?.setBreed(breedId);
    if (engineRef.current) {
      setCurrentBreed(engineRef.current.selectedBreed);
    }
    setShowBreedModal(false);
  };

  const handleUnlockBreed = (breedId: string) => {
    const success = engineRef.current?.unlockBreed(breedId);
    if (success && engineRef.current) {
      setUnlockedBreeds([...engineRef.current.stats.unlockedBreeds]);
      setCurrentBreed(engineRef.current.selectedBreed);
      setScore(engineRef.current.stats.score);
    }
  };

  const handleSelectLevel = (levelIndex: number) => {
    engineRef.current?.loadLevel(levelIndex);
    if (engineRef.current) {
      setCurrentLevel(engineRef.current.currentLevel);
      setTotalFood(engineRef.current.currentLevel.totalFood);
      setFoodCount(0);
    }
    setShowLevelModal(false);
    requestPlay();
  };

  const handleRestartLevel = () => {
    engineRef.current?.restartCurrentLevel();
    if (engineRef.current) {
      setFoodCount(0);
    }
  };

  const handleNextLevel = () => {
    setVictoryData((prev) => ({ ...prev, isOpen: false }));
    engineRef.current?.nextLevel();
    if (engineRef.current) {
      setCurrentLevel(engineRef.current.currentLevel);
      setUnlockedLevels([...engineRef.current.stats.unlockedLevels]);
      setCompletedLevels([...engineRef.current.stats.completedLevels]);
      setTotalFood(engineRef.current.currentLevel.totalFood);
      setFoodCount(0);
    }
    requestPlay();
  };

  const handleReplayVictory = () => {
    setVictoryData((prev) => ({ ...prev, isOpen: false }));
    handleRestartLevel();
    requestPlay();
  };

  const handleToggleMute = () => {
    const nextMute = sound.toggleMute();
    setIsMuted(nextMute);
  };

  const handleTriggerMeow = () => {
    engineRef.current?.player.triggerMeow();
  };

  const handleTriggerSwipe = () => {
    engineRef.current?.player.triggerPawSwipe();
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-zinc-950 font-['Outfit',sans-serif] select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD */}
      <TopHUD
        score={score}
        highScore={highScore}
        level={currentLevel}
        foodCount={foodCount}
        totalFood={totalFood}
        stamina={stamina}
        maxStamina={maxStamina}
        currentBreed={currentBreed}
        abilityCooldown={abilityCooldown}
        isCharging={isCharging}
        chargePct={chargePct}
        compassAngle={compassAngle}
        compassDistance={compassDistance}
        targetType={targetType}
        isInsideHouse={isInsideHouse}
        isNearWall={engineRef.current?.player?.isNearWallFacade ?? false}
        pickupNotification={pickupNotice}
      />

      {/* Cinema Mode Collapsible Bottom Dock (Center, 100% viewport visible) */}
      <CinemaBottomDock
        currentBreed={currentBreed}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenBreeds={() => setShowBreedModal(true)}
        onOpenLevels={() => setShowLevelModal(true)}
        onOpenHelp={() => setShowHelpModal(true)}
        onRestartLevel={handleRestartLevel}
        onMeow={handleTriggerMeow}
      />

      {/* Touch / Mobile Controls */}
      <TouchControls
        player={engineRef.current?.player ?? null}
        onMeow={handleTriggerMeow}
        onSwipe={handleTriggerSwipe}
        abilityName={currentBreed.specialAbility.name}
        abilityCooldown={abilityCooldown}
        isCharging={isCharging}
        chargePct={chargePct}
      />

      {/* Pointer Lock Start / Resume Overlay */}
      <ClickToPlayOverlay
        isLocked={
          isPointerLocked ||
          showBreedModal ||
          showLevelModal ||
          showHelpModal ||
          victoryData.isOpen ||
          memeData.isOpen
        }
        onStartPlay={requestPlay}
        level={currentLevel}
        currentBreed={currentBreed}
      />

      {/* Viral Meme Cat Overlay ("MIAU MIAU MIAU MIAU") */}
      <MemeCatOverlay
        meme={memeData}
        onDismiss={() => setMemeData((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Breed Selector Modal */}
      <BreedSelectorModal
        isOpen={showBreedModal}
        onClose={() => setShowBreedModal(false)}
        selectedBreedId={currentBreed.id}
        unlockedBreeds={unlockedBreeds}
        totalScore={score}
        onSelectBreed={handleSelectBreed}
        onUnlockBreed={handleUnlockBreed}
      />

      {/* Level Selector Modal */}
      <LevelSelectorModal
        isOpen={showLevelModal}
        onClose={() => setShowLevelModal(false)}
        currentLevelId={currentLevel.id}
        unlockedLevels={unlockedLevels}
        completedLevels={completedLevels}
        totalScore={score}
        onSelectLevel={handleSelectLevel}
      />

      {/* Controls Guide Modal */}
      <ControlsHelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

      {/* Victory Level Completed Modal */}
      <VictoryModal
        isOpen={victoryData.isOpen}
        levelId={victoryData.levelId}
        bonusScore={victoryData.bonusScore}
        stars={victoryData.stars}
        totalFoodCollected={foodCount}
        totalLevelFood={totalFood}
        onNextLevel={handleNextLevel}
        onReplay={handleReplayVictory}
        onOpenBreeds={() => {
          setVictoryData((prev) => ({ ...prev, isOpen: false }));
          setShowBreedModal(true);
        }}
      />
    </div>
  );
}
