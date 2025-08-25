'use client'

import { WorkflowStep, STEP_LABELS } from '@/app/types'
import { useTranslation } from 'react-i18next'

interface WorkflowChecklistProps {
  currentStep: WorkflowStep
}

export default function WorkflowChecklist({ currentStep }: WorkflowChecklistProps) {
  const { t } = useTranslation()
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white border-b border-gray-300 p-4 shadow-sm">
      <h3 className="text-sm font-semibold mb-3 text-gray-700">{t('workflow.title')}</h3>
      <div className="space-y-2">
        {Object.entries(STEP_LABELS).map(([step, label]) => {
          const stepNum = parseInt(step)
          if (stepNum === WorkflowStep.COMPLETED) return null
          const isCompleted = currentStep > stepNum
          const isCurrent = currentStep === stepNum
          return (
            <div key={step} className="flex items-start space-x-3">
              <div className={`w-5 h-5 border-2 flex items-center justify-center mt-0.5 ${
                isCompleted ? 'bg-green-500 border-green-500' : 
                isCurrent ? 'bg-white border-gray-700' : 
                'bg-white border-gray-700'
              }`}>
                {isCompleted && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <span className={`text-sm ${
                  isCompleted ? 'text-green-700 line-through' : 
                  isCurrent ? 'text-blue-700 font-semibold' : 
                  'text-gray-500'
                }`}>
                  {t(label)}
                </span>
                {isCurrent && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                    {t('workflow.currentStep')}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}