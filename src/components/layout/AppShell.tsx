'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import StickyProgressBar from './StickyProgressBar';
import CommandPalette from './CommandPalette';
import BottomTabBar from './BottomTabBar';
import GuidedTour from './GuidedTour';
import ChatWindow from '@/components/chat/ChatWindow';
import ToastContainer from '@/components/ui/Toast';
import RoleSelection from './RoleSelection';
import { useToast } from '@/context/ToastContext';
import { useOnboarding } from '@/context/OnboardingContext';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.2 },
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { selectedRole, isHydrated } = useOnboarding();
  const { toasts, removeToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!isHydrated) {
    return <div className="min-h-screen bg-gray-50 dark:bg-gray-950" />;
  }

  if (!selectedRole) {
    return <RoleSelection />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      <StickyProgressBar />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        data-tour="sidebar"
        className={`fixed md:static z-40 h-full transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar onMobileClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setMobileMenuOpen(true)} />

        <main data-tour="dashboard" className="flex-1 overflow-y-auto p-6 pb-20 md:pb-6">
          <AnimatePresence mode="wait">
            <motion.div key={pathname} {...pageTransition}>
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating elements */}
      <CommandPalette />
      <ChatWindow />
      <BottomTabBar />
      <GuidedTour />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
