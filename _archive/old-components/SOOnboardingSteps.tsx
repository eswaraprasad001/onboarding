'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, User, BookOpen, Target, Users, ArrowRight, Clock, Award, Settings, FileText, Shield } from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  duration: string
  category: 'access' | 'learning' | 'practice' | 'assessment' | 'tools'
  details?: string[]
}

const soOnboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    title: 'Access Request & System Setup',
    description: 'Complete all required access requests and system configurations',
    completed: false,
    duration: '60 min',
    category: 'access',
    details: [
      'Changepoint Access for time entry',
      'Miro Access (request via IT)',
      'Lucid Access (ServiceNOW request)',
      'Add to DBSS Teams (Kudos, General) & SO Practice Teams Space',
      'Presidio Atlassian Access (JIRA, Confluence)',
      'Request to Add Team Member to Whitespace',
      'Contact IT Support for additional setup'
    ]
  },
  {
    id: '2',
    title: 'Core System Demonstrations',
    description: 'Complete walkthroughs of essential Presidio systems and processes',
    completed: false,
    duration: '90 min',
    category: 'learning',
    details: [
      'Changepoint Time Entry Walkthrough',
      'Weekly Time Sheet Expectations (Billable vs Non-Billable)',
      'Presidio Self Service Portal (Desktop App)',
      'Concur Expense System',
      'HR Portal (Demographics, Benefits, Payroll)',
      'Presidio Service Desk (ServiceNOW)',
      'Training and Time Off Request Systems'
    ]
  },
  {
    id: '3',
    title: 'Solution Owner Role Overview',
    description: 'Deep dive into SO responsibilities, core principles, and expectations',
    completed: false,
    duration: '120 min',
    category: 'learning',
    details: [
      'Solution Owner Overview with Team Lead',
      'Core Principles: Deliver Client Value, Grow Business, Lead with Excellence',
      'SO vs PO, PM, Scrum Master, Technical Liaison differentiation',
      'Statement of Work Examples (T&M, Fixed Fee, PODs)',
      'Review SO Templates and Previous Projects/Customers',
      'Understanding the Three-Tier SO Structure (ASO, SO, SSO)'
    ]
  },
  {
    id: '4',
    title: 'Templates & Project Materials',
    description: 'Explore SO templates, case studies, and delivery frameworks',
    completed: false,
    duration: '75 min',
    category: 'practice',
    details: [
      'Review Case Studies (Allied, Ardent Mills, Bank United, etc.)',
      'Explore Delivery Templates and Samples',
      'Kickoff Deck Examples',
      'Requirements Documentation Samples',
      'Status Report and SteerCo Templates',
      'Timeline and Roadmap Samples',
      'Financial Tracker Templates'
    ]
  },
  {
    id: '5',
    title: 'Team Integration & Shadowing',
    description: 'Begin team integration and shadow experienced SOs',
    completed: false,
    duration: '240 min',
    category: 'practice',
    details: [
      'Create Presidio Profile (regular template or Insights)',
      'Review Latest Presidio Org Chart',
      'Shadow Team Assignments with Team Lead',
      'Schedule 1:1 Sessions with Team Lead',
      'Add PTO to SO PTO Calendar',
      'Review "The Five Jobs You Have as a Solution Owner" article'
    ]
  },
  {
    id: '6',
    title: 'Competency Assessment',
    description: 'Validate understanding through structured interview questions and scenarios',
    completed: false,
    duration: '90 min',
    category: 'assessment',
    details: [
      'Business and Customer Focus Assessment',
      'Technical Acumen Evaluation',
      'Agile and Scrum Practices Review',
      'Leadership and Team Management Scenarios',
      'Communication and Collaboration Skills',
      'Strategic Planning and Roadmapping Exercise'
    ]
  }
]

const categoryColors = {
  access: 'bg-red-100 text-red-800',
  learning: 'bg-green-100 text-green-800',
  practice: 'bg-yellow-100 text-yellow-800',
  assessment: 'bg-purple-100 text-purple-800',
  tools: 'bg-blue-100 text-blue-800'
}

const categoryIcons = {
  access: Shield,
  learning: BookOpen,
  practice: Target,
  assessment: Award,
  tools: Settings
}

export default function SOOnboardingSteps() {
  const [steps, setSteps] = useState<OnboardingStep[]>(soOnboardingSteps)
  const [expandedStep, setExpandedStep] = useState<string | null>(null)

  const completedSteps = steps.filter((step: OnboardingStep) => step.completed).length
  const progressPercentage = (completedSteps / steps.length) * 100

  const toggleStep = (stepId: string) => {
    setSteps((prev: OnboardingStep[]) => prev.map((step: OnboardingStep) => 
      step.id === stepId ? { ...step, completed: !step.completed } : step
    ))
  }

  const toggleExpanded = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId)
  }

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Solution Owner Onboarding Progress</h2>
          <span className="text-2xl font-bold text-primary-600">
            {Math.round(progressPercentage)}%
          </span>
        </div>
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-2">
          <span>{completedSteps} of {steps.length} completed</span>
          <span>Estimated time remaining: {Math.max(0, 10.5 - (completedSteps * 1.75))}h</span>
        </div>
      </div>

      {/* Onboarding Steps */}
      {steps.map((step, index) => {
        const IconComponent = categoryIcons[step.category]
        const isExpanded = expandedStep === step.id
        
        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`card transition-all duration-200 ${
              step.completed 
                ? 'bg-green-50 border-green-200 shadow-glow' 
                : 'hover:shadow-lg hover:border-primary-200'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${
                step.completed ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <IconComponent className="w-6 h-6 text-gray-600" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-xl font-semibold ${
                    step.completed ? 'text-green-800' : 'text-gray-900'
                  }`}>
                    {step.title}
                  </h3>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryColors[step.category]}`}>
                      {step.category}
                    </span>
                    <div className="flex items-center text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      <span className="text-sm">{step.duration}</span>
                    </div>
                  </div>
                </div>
                
                <p className={`mb-3 ${
                  step.completed ? 'text-green-700' : 'text-gray-600'
                }`}>
                  {step.description}
                </p>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleStep(step.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      step.completed
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-primary-100 text-primary-800 hover:bg-primary-200'
                    }`}
                  >
                    {step.completed ? 'Completed' : 'Mark Complete'}
                  </button>
                  
                  {step.details && (
                    <button
                      onClick={() => toggleExpanded(step.id)}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                    >
                      {isExpanded ? 'Hide Details' : 'Show Details'}
                    </button>
                  )}
                </div>

                {/* Expanded Details */}
                {isExpanded && step.details && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <h4 className="font-semibold text-gray-900 mb-3">Detailed Requirements:</h4>
                    <ul className="space-y-2">
                      {step.details.map((detail, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
