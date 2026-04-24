'use client';

import { Menu, Search, Sun, Moon, Star } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { useTheme } from '@/context/ThemeContext';
import { useGame } from '@/context/GameContext';
import { getInternalRouteById } from '@/lib/internalRoutes';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { currentView } = useOnboarding();
  const { isDark, toggleTheme } = useTheme();
  const { gameState, getLevelName } = useGame();
  const currentRoute = getInternalRouteById(currentView);

  const openCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'));
  };

  return (
    <header className="sticky top-1 z-20 h-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden"
        >
          <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {currentRoute.title}
        </h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Command Palette Trigger */}
        <button
          data-tour="search"
          onClick={openCommandPalette}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="hidden lg:inline px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Dark Mode */}
        <button
          data-tour="dark-mode"
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* XP Display */}
        <div data-tour="xp" className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
          <Star className="w-4 h-4 fill-current" />
          <span>{gameState.xp} XP</span>
          <span className="hidden sm:inline text-xs opacity-70">• {getLevelName()}</span>
        </div>
      </div>
    </header>
  );
}
