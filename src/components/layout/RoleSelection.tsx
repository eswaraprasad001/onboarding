'use client';

import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ArrowRight, ClipboardList, Target } from 'lucide-react';
import { useOnboarding } from '@/context/OnboardingContext';

export default function RoleSelection() {
  const pathname = usePathname();
  const router = useRouter();
  const { setRole } = useOnboarding();

  const handleRoleSelect = (role: 'BA' | 'SO') => {
    setRole(role);
    if (!pathname.startsWith('/app')) {
      router.replace('/app');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full text-center"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8 md:p-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent mb-4">
              Welcome to Your Onboarding Journey
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              Let&apos;s get you started with a personalized experience
            </p>
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-gray-100">Select Your Role</h2>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('BA')}
              className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <ClipboardList className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400">
                      Business Analyst (BA)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Focus on requirements gathering, stakeholder management, and process analysis
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 flex-shrink-0" />
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleRoleSelect('SO')}
              className="w-full p-6 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-primary-300 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 text-left group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                    <Target className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-400">
                      Solution Owner (SO)
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Focus on solution design, technical coordination, and delivery oversight
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 flex-shrink-0" />
              </div>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
