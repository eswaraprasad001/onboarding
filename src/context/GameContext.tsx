'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { GameState, Badge } from '@/types';

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5000];
const LEVEL_NAMES = [
  'Newcomer',
  'Explorer',
  'Learner',
  'Practitioner',
  'Expert',
  'Master',
  'Champion',
  'Legend',
];

const BADGE_DEFINITIONS: Badge[] = [
  { id: 'first-steps', name: 'First Steps', description: 'Complete your first sub-task', icon: 'Footprints', requirement: 'Complete your first sub-task' },
  { id: 'getting-started', name: 'Getting Started', description: 'Complete your first onboarding step', icon: 'Rocket', requirement: 'Complete your first onboarding step' },
  { id: 'halfway', name: 'Halfway There', description: 'Reach 50% progress', icon: 'Target', requirement: 'Reach 50% progress' },
  { id: 'template-explorer', name: 'Template Explorer', description: 'View 5 templates', icon: 'FileText', requirement: 'View 5 templates' },
  { id: 'knowledge-seeker', name: 'Knowledge Seeker', description: 'Read 3 articles', icon: 'BookOpen', requirement: 'Read 3 articles' },
  { id: 'speed-runner', name: 'Speed Runner', description: 'Complete 3 steps', icon: 'Zap', requirement: 'Complete 3 steps' },
  { id: 'chat-pro', name: 'Chat Pro', description: 'Ask 10 questions', icon: 'MessageCircle', requirement: 'Ask 10 questions' },
  { id: 'bookworm', name: 'Bookworm', description: 'Bookmark 3 articles', icon: 'Bookmark', requirement: 'Bookmark 3 articles' },
  { id: 'completionist', name: 'Completionist', description: 'Finish all onboarding steps', icon: 'Trophy', requirement: 'Finish all onboarding steps' },
];

const STORAGE_KEY = 'presidio-game';

function createInitialState(): GameState {
  return {
    xp: 0,
    level: 0,
    badges: BADGE_DEFINITIONS.map((b) => ({ ...b, earnedAt: undefined })),
    milestonesReached: [],
  };
}

function computeLevel(xp: number): number {
  let level = 0;
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      level = i;
      break;
    }
  }
  return level;
}

interface GameContextValue {
  gameState: GameState;
  addXP: (amount: number, reason: string) => boolean;
  checkBadge: (badgeId: string) => boolean;
  getLevelName: () => string;
  getXPForNextLevel: () => number;
  getLevelProgress: () => number;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, setGameState] = useState<GameState>(createInitialState);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as GameState;
        const mergedBadges = BADGE_DEFINITIONS.map((def) => {
          const savedBadge = saved.badges?.find((b) => b.id === def.id);
          return savedBadge ? { ...def, earnedAt: savedBadge.earnedAt } : { ...def, earnedAt: undefined };
        });
        setGameState({ ...saved, badges: mergedBadges });
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // Persist to localStorage on state change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const addXP = useCallback((amount: number, _reason: string): boolean => {
    let leveledUp = false;

    setGameState((prev) => {
      const newXP = prev.xp + amount;
      const newLevel = computeLevel(newXP);
      leveledUp = newLevel > prev.level;

      return {
        ...prev,
        xp: newXP,
        level: newLevel,
      };
    });

    return leveledUp;
  }, []);

  const checkBadge = useCallback((badgeId: string): boolean => {
    let newlyEarned = false;

    setGameState((prev) => {
      const badgeIndex = prev.badges.findIndex((b) => b.id === badgeId);
      if (badgeIndex === -1) return prev;
      if (prev.badges[badgeIndex].earnedAt) return prev;

      newlyEarned = true;
      const updatedBadges = prev.badges.map((b, i) =>
        i === badgeIndex ? { ...b, earnedAt: new Date().toISOString() } : b
      );

      return { ...prev, badges: updatedBadges };
    });

    return newlyEarned;
  }, []);

  const getLevelName = useCallback((): string => {
    return LEVEL_NAMES[gameState.level] ?? LEVEL_NAMES[LEVEL_NAMES.length - 1];
  }, [gameState.level]);

  const getXPForNextLevel = useCallback((): number => {
    const nextLevel = gameState.level + 1;
    if (nextLevel >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    return LEVEL_THRESHOLDS[nextLevel];
  }, [gameState.level]);

  const getLevelProgress = useCallback((): number => {
    const currentThreshold = LEVEL_THRESHOLDS[gameState.level] ?? 0;
    const nextLevel = gameState.level + 1;
    if (nextLevel >= LEVEL_THRESHOLDS.length) return 100;

    const nextThreshold = LEVEL_THRESHOLDS[nextLevel];
    const range = nextThreshold - currentThreshold;
    if (range <= 0) return 100;

    const progress = ((gameState.xp - currentThreshold) / range) * 100;
    return Math.min(100, Math.max(0, Math.round(progress)));
  }, [gameState.xp, gameState.level]);

  return (
    <GameContext.Provider
      value={{
        gameState,
        addXP,
        checkBadge,
        getLevelName,
        getXPForNextLevel,
        getLevelProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
