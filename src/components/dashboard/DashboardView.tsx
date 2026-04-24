'use client';

import { motion } from 'framer-motion';
import { useOnboarding } from '@/context/OnboardingContext';
import ContinueCard from './ContinueCard';
import StatsWidget from './StatsWidget';
import QuickActions from './QuickActions';
import ActivityFeed from './ActivityFeed';
// import AppsSection from './AppsSection'; // hidden

export default function DashboardView() {
  const { completedSteps } = useOnboarding();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {completedSteps > 0 ? 'Welcome back!' : 'Welcome!'}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          {completedSteps > 0 ? 'Continue your onboarding journey' : 'Let\'s get you started with your onboarding'}
        </p>
      </div>

      {/* Continue Card */}
      <ContinueCard />

      {/* Stats */}
      <StatsWidget />

      {/* Quick Actions + Apps (left) | Activity Feed (right) */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Quick Actions</h3>
            <QuickActions />
          </div>
          {/* AppsSection hidden: <AppsSection /> */}
        </div>
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
      </div>
    </motion.div>
  );
}
