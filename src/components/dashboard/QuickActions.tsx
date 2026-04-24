'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ClipboardList, FileText, BookOpen, MessageCircle, ArrowRight, Target } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

const actions = [
  { id: 'onboarding', label: 'Continue Onboarding', icon: ClipboardList, color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
  { id: 'playbook', label: 'Solution Owner Playbook', icon: Target, color: 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' },
  { id: 'templates', label: 'Browse Templates', icon: FileText, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
  { id: 'knowledge', label: 'Knowledge Hub', icon: BookOpen, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  { id: 'chat', label: 'AI Assistant', icon: MessageCircle, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
] as const;

export default function QuickActions() {
  const router = useRouter();
  const { currentStepHref } = useOnboarding();

  const handleAction = (id: string) => {
    if (id === 'chat') {
      window.dispatchEvent(new CustomEvent('toggle-chat'));
    } else if (id === 'onboarding') {
      router.push(currentStepHref);
    } else {
      router.push(`/app/${id}`);
    }
  };

  return (
    <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
      {actions.map((action, i) => {
        const Icon = action.icon;
        return (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(action.id)}
            className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow text-left group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${action.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 transition-colors" />
          </motion.button>
        );
      })}
    </div>
  );
}
