'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sun, Moon, ChevronDown, ChevronLeft, ChevronRight, Link2, LogOut } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { useTheme } from '@/context/ThemeContext';
import ProgressRing from '@/components/ui/ProgressRing';
import { INTERNAL_ROUTES, USEFUL_LINKS } from '@/lib/internalRoutes';

interface SidebarProps {
  onMobileClose?: () => void;
}

export default function Sidebar({ onMobileClose }: SidebarProps) {
  const { currentView, selectedRole, resetRole, progressPercentage } = useOnboarding();
  const { isDark, toggleTheme } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [usefulLinksOpen, setUsefulLinksOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('presidio-sidebar-collapsed');
    if (saved === 'true') setIsCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    localStorage.setItem('presidio-sidebar-collapsed', String(next));
  };

  return (
    <motion.aside
      className={`h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-[72px]' : 'w-[280px]'}`}
    >
      {/* Logo & Collapse */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
        {!isCollapsed && (
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400">Presidio</span>
        )}
        {isCollapsed && (
          <span className="text-xl font-bold text-primary-600 dark:text-primary-400 mx-auto">P</span>
        )}
        <button
          onClick={toggleCollapse}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 hidden md:block"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {INTERNAL_ROUTES.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onMobileClose?.()}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}

        {!isCollapsed && (
          <div className="pt-3 mt-3 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setUsefulLinksOpen((prev) => !prev)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
            >
              <Link2 className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">Useful Links</span>
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 transition-transform ${
                  usefulLinksOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {usefulLinksOpen && (
              <div className="mt-1 space-y-1 pl-5">
                {USEFUL_LINKS.map((link) => {
                  const Icon = link.icon;

                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200"
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{link.label}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
        {/* Dark Mode Toggle */}
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {isDark ? <Sun className="w-5 h-5 flex-shrink-0" /> : <Moon className="w-5 h-5 flex-shrink-0" />}
          {!isCollapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* Progress */}
        {!isCollapsed && (
          <div data-tour="progress" className="flex items-center gap-3 px-2">
            <ProgressRing progress={progressPercentage} size={44} strokeWidth={4} showLabel={false} />
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{progressPercentage}%</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Complete</div>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex justify-center">
            <ProgressRing progress={progressPercentage} size={40} strokeWidth={4} showLabel={false} />
          </div>
        )}

        {/* Role Badge & Change */}
        <div className={`flex ${isCollapsed ? 'flex-col items-center gap-2' : 'items-center justify-between'} px-2`}>
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300">
            {selectedRole}
          </span>
          {!isCollapsed && (
            <button
              onClick={resetRole}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
            >
              <LogOut className="w-3.5 h-3.5" />
              Change Role
            </button>
          )}
        </div>
      </div>
    </motion.aside>
  );
}
