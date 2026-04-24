'use client';

import { motion } from 'framer-motion';
import { ClipboardCheck, CheckSquare, Star, Clock } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { useGame } from '@/context/GameContext';

export default function StatsWidget() {
  const { completedSteps, totalSteps, completedSubTasks, totalSubTasks, estimatedTimeRemaining } = useOnboarding();
  const { gameState } = useGame();

  const stats = [
    { icon: ClipboardCheck, label: 'Steps', value: `${completedSteps}/${totalSteps}`, color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' },
    { icon: CheckSquare, label: 'Tasks', value: `${completedSubTasks}/${totalSubTasks}`, color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
    { icon: Star, label: 'XP', value: `${gameState.xp}`, color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30' },
    { icon: Clock, label: 'Remaining', value: estimatedTimeRemaining, color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-2 ${stat.color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}
