import React from 'react'
import { Check } from 'lucide-react'

interface ProgressIndicatorProps {
  currentStep: number
  totalSteps: number
}

export function ProgressIndicator({ currentStep, totalSteps }: ProgressIndicatorProps) {
  const steps = [
    'University',
    'Department', 
    'Semester',
    'Subjects'
  ]

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep

          return (
            <div key={step} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                ${isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent 
                    ? 'bg-white text-blue-600 border-2 border-white shadow-md' 
                    : 'bg-blue-400 text-blue-100'
                }
              `}>
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </div>
              
              {index < steps.length - 1 && (
                <div className={`
                  w-12 h-0.5 mx-2 transition-colors
                  ${stepNumber < currentStep ? 'bg-green-400' : 'bg-blue-300'}
                `} />
              )}
            </div>
          )
        })}
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-blue-100">
        {steps.map((step, index) => (
          <span key={step} className={`
            ${index + 1 === currentStep ? 'text-white font-medium' : ''}
          `}>
            {step}
          </span>
        ))}
      </div>
    </div>
  )
}