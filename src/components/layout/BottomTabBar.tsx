'use client';

import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';
import { INTERNAL_ROUTES } from '@/lib/internalRoutes';

const tabs = [
  ...INTERNAL_ROUTES,
  { id: 'chat', label: 'Chat', icon: MessageCircle },
] as const;

export default function BottomTabBar() {
  const { currentView } = useOnboarding();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id !== 'chat' && currentView === tab.id;
          if (tab.id === 'chat') {
            return (
              <button
                key={tab.id}
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-chat'))}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors text-gray-400 dark:text-gray-500"
                aria-label={tab.label}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={tab.id}
              href={tab.href!}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
              aria-label={tab.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{tab.tabLabel}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
