'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, BookOpen, Target, Users, ArrowRight, Award, Home } from 'lucide-react'
import UnifiedOnboarding from '@/components/UnifiedOnboarding'
import TemplateLibrary from '@/components/TemplateLibrary'
import KnowledgeHub from '@/components/KnowledgeHub'
import TeamsIntegration from '@/components/TeamsIntegration'
import AIChat from '@/components/AIChat'
import Login from '@/components/Login/Login'
import { useMsal } from '@azure/msal-react'

interface OnboardingStep {
    id: string
    title: string
    description: string
    completed: boolean
    duration: string
    category: 'setup' | 'learning' | 'practice' | 'assessment'
}

const initialSteps: OnboardingStep[] = [
    {
        id: '1',
        title: 'System Access Setup',
        description: 'Configure Jira, Confluence, Teams, and VPN access',
        completed: false,
        duration: '30 min',
        category: 'setup'
    },
    {
        id: '2',
        title: 'Role Introduction',
        description: 'Understanding BA/SO responsibilities and expectations',
        completed: false,
        duration: '45 min',
        category: 'learning'
    },
    {
        id: '3',
        title: 'Process Overview',
        description: 'Learn discovery to delivery workflow',
        completed: false,
        duration: '60 min',
        category: 'learning'
    },
    {
        id: '4',
        title: 'Template Library',
        description: 'Explore BRDs, PRDs, and process mapping templates',
        completed: false,
        duration: '40 min',
        category: 'practice'
    },
    {
        id: '5',
        title: 'First Assignment',
        description: 'Complete a sample requirements document',
        completed: false,
        duration: '120 min',
        category: 'practice'
    },
    {
        id: '6',
        title: 'Knowledge Assessment',
        description: 'Validate understanding of key concepts',
        completed: false,
        duration: '30 min',
        category: 'assessment'
    }
]

const categoryColors = {
    setup: 'bg-blue-100 text-blue-800',
    learning: 'bg-green-100 text-green-800',
    practice: 'bg-yellow-100 text-yellow-800',
    assessment: 'bg-purple-100 text-purple-800'
}

const categoryIcons = {
    setup: User,
    learning: BookOpen,
    practice: Target,
    assessment: Award
}

export default function HomePage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [username, setUsername] = useState('');

    const [steps, setSteps] = useState<OnboardingStep[]>(initialSteps)
    const [selectedRole, setSelectedRole] = useState<'BA' | 'SO' | null>(null)
    const [currentView, setCurrentView] = useState<'dashboard' | 'templates' | 'knowledge'>('dashboard')

    const completedSteps = steps.filter((step: OnboardingStep) => step.completed).length
    const progressPercentage = (completedSteps / steps.length) * 100

    useEffect(() => {
        const idToken = localStorage.getItem('onboarding_id_token');
        const accessToken = localStorage.getItem('onboarding_access_token');
        const storedUsername = localStorage.getItem('onboarding_username');
        if (idToken && accessToken && storedUsername) {
            setIsLoggedIn(true);
            setUsername(storedUsername);
        }
    }, []);

    const toggleStep = (stepId: string) => {
        setSteps((prev: OnboardingStep[]) => prev.map((step: OnboardingStep) =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
        ))
    }

    const { instance } = useMsal();

    const handleLogout = () => {
        instance.logout();

        localStorage.removeItem('onboarding_id_token');
        localStorage.removeItem('onboarding_access_token');
        localStorage.removeItem('onboarding_username');

        setIsLoggedIn(false);
    }

    if (!isLoggedIn) {
        return <Login setIsLoggedIn={setIsLoggedIn} setUsername={setUsername} />
    }

    if (!selectedRole) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl w-full text-center"
                >
                    <div className="card">
                        <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8"
                        >
                            <div className='grid grid-cols-3'>
                                <div className="col-span-1 col-start-2">
                                    <span className="font-bold">{username}</span>
                                </div>
                                <div className="col-span-1 col-start-3 flex justify-end">
                                    <motion.button
                                        onClick={handleLogout}
                                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                                    >
                                    Logout
                                    </motion.button>
                                </div>
                            </div>
                            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-10 h-10 text-primary-600" />
                            </div>
                            <h1 className="text-4xl font-bold text-gradient mb-4">
                                Welcome to Your Onboarding Journey
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Let's get you started with a personalized onboarding experience
                            </p>
                        </motion.div>

                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold mb-6">Select Your Role</h2>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedRole('BA')}
                                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700">
                                            Business Analyst (BA)
                                        </h3>
                                        <p className="text-gray-600 mt-2">
                                            Focus on requirements gathering, stakeholder management, and process analysis
                                        </p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                                </div>
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedRole('SO')}
                                className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 text-left group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-700">
                                            Solution Owner (SO)
                                        </h3>
                                        <p className="text-gray-600 mt-2">
                                            Focus on solution design, technical coordination, and delivery oversight
                                        </p>
                                    </div>
                                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
                                </div>
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* AI Chat Component - Available from role selection */}
                <AIChat selectedRole={selectedRole} currentView="role-selection" />
            </div>
        )
    }

    // Render different views based on currentView
    const renderCurrentView = () => {
        switch (currentView) {
            case 'templates':
                return <TemplateLibrary />
            case 'knowledge':
                return <KnowledgeHub />
            default:
                return <UnifiedOnboarding selectedRole={selectedRole} />
        }
    }

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                {selectedRole} {currentView === 'templates' ? 'Template Library' : currentView === 'knowledge' ? 'Knowledge Hub' : 'Onboarding Dashboard'}
                            </h1>
                            <p className="text-gray-600 mt-2">
                                {currentView === 'templates'
                                    ? 'Access real Solution Owner templates and case studies'
                                    : currentView === 'knowledge'
                                        ? 'Learn from comprehensive knowledge resources'
                                        : 'Complete your personalized onboarding journey'
                                }
                            </p>
                        </div>
                        <div className="flex space-x-3">
                            {currentView !== 'dashboard' && (
                                <button
                                    onClick={() => setCurrentView('dashboard')}
                                    className="btn-secondary flex items-center space-x-2"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Dashboard</span>
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedRole(null)}
                                className="btn-secondary"
                            >
                                Change Role
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Main Content */}
                {renderCurrentView()}

                {/* Quick Actions - Only show on dashboard */}
                {currentView === 'dashboard' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8"
                    >
                        <div className="card">
                            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button
                                    onClick={() => setCurrentView('knowledge')}
                                    className="btn-primary flex items-center justify-center space-x-2"
                                >
                                    <BookOpen className="w-5 h-5" />
                                    <span>Knowledge Hub</span>
                                </button>
                                <button
                                    onClick={() => setCurrentView('templates')}
                                    className="btn-secondary flex items-center justify-center space-x-2"
                                >
                                    <Target className="w-5 h-5" />
                                    <span>Template Library</span>
                                </button>
                                <TeamsIntegration selectedRole={selectedRole} />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* AI Chat Component */}
            <AIChat selectedRole={selectedRole} currentView={currentView} />
        </div>
    )
}
