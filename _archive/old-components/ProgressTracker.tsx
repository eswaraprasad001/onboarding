'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Circle, Clock } from 'lucide-react'

interface Step {
  id: string
  title: string
  completed: boolean
  current?: boolean
}

interface ProgressTrackerProps {
  steps: Step[]
  currentStep: number
}

export default function ProgressTracker({ steps, currentStep }: ProgressTrackerProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col items-center"
            >
              <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                step.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : index === currentStep
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : index === currentStep ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              <span className={`mt-2 text-xs font-medium text-center max-w-20 ${
                step.completed || index === currentStep
                  ? 'text-gray-900'
                  : 'text-gray-500'
              }`}>
                {step.title}
              </span>
            </motion.div>
            
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                steps[index + 1].completed || index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
