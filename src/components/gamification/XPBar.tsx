'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { useGame } from '@/context/GameContext';

export default function XPBar() {
  const { gameState, getLevelName, getLevelProgress, getXPForNextLevel } = useGame();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500 fill-current" />
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{getLevelName()}</span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {gameState.xp} / {getXPForNextLevel()} XP
        </span>
      </div>
      <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${getLevelProgress()}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
        Level {gameState.level + 1} • {getXPForNextLevel() - gameState.xp} XP to next level
      </p>
    </div>
  );
}
