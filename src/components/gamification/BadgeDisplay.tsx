'use client';

import { motion } from 'framer-motion';
import {
  Footprints, Rocket, Target, FileText, BookOpen,
  Zap, MessageCircle, Bookmark, Trophy,
} from 'lucide-react';
import { useGame } from '@/context/GameContext';
import { Badge } from '@/types';

const iconMap: Record<string, typeof Footprints> = {
  Footprints, Rocket, Target, FileText, BookOpen,
  Zap, MessageCircle, Bookmark, Trophy,
};

export default function BadgeDisplay() {
  const { gameState } = useGame();

  const earned = gameState.badges.filter((b) => b.earnedAt).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Badges</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">{earned}/{gameState.badges.length} earned</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {gameState.badges.map((badge, i) => (
          <BadgeItem key={badge.id} badge={badge} index={i} />
        ))}
      </div>
    </div>
  );
}

function BadgeItem({ badge, index }: { badge: Badge; index: number }) {
  const isEarned = !!badge.earnedAt;
  const Icon = iconMap[badge.icon] || Trophy;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      title={`${badge.name}: ${badge.description}${isEarned ? ' (Earned!)' : ''}`}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-colors ${
        isEarned
          ? 'bg-amber-50 dark:bg-amber-900/20'
          : 'bg-gray-50 dark:bg-gray-700/50 opacity-40'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isEarned
            ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
        }`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <span className={`text-[10px] font-medium text-center leading-tight ${
        isEarned ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
      }`}>
        {badge.name}
      </span>
    </motion.div>
  );
}
