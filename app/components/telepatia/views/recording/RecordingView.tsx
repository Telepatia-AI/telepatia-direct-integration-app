'use client'

import { useTranslation } from 'react-i18next'
import { WorkflowStep } from '@/app/types'

interface RecordingViewProps {
  currentStep: WorkflowStep
  setCurrentStep: (step: WorkflowStep) => void
}

export default function RecordingView({ currentStep, setCurrentStep }: RecordingViewProps) {
  const { t } = useTranslation()

  const handleOpenScribe = () => {
    // Open scribe.dev.telepatia.ai in a new tab/window
    window.open('https://scribe.dev.telepatia.ai', '_blank', 'noopener,noreferrer')
    
    // Move to the next workflow step
    if (currentStep === WorkflowStep.START_RECORDING) {
      setCurrentStep(WorkflowStep.END_RECORDING)
    }
  }

  const handleMarkComplete = () => {
    // Mark recording as complete and move to patient confirmation
    if (currentStep === WorkflowStep.END_RECORDING) {
      setCurrentStep(WorkflowStep.CONFIRM_PATIENT)
    }
  }

  const handleSkipRecording = () => {
    // Skip recording and move directly to patient confirmation
    setCurrentStep(WorkflowStep.CONFIRM_PATIENT)
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Scribe Link Section */}
      <div className="text-center mb-8">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {t('telepatia.recording.externalTitle') || 'Record with Telepatia Scribe'}
          </h3>
          <p className="text-gray-600 mb-4">
            {t('telepatia.recording.externalDescription') || 'Click the link below to open the Telepatia Scribe interface and record your consultation.'}
          </p>
        </div>

        {/* Scribe Icon/Logo placeholder */}
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4 w-full max-w-md">
        {currentStep === WorkflowStep.START_RECORDING && (
          <button
            onClick={handleOpenScribe}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            {t('telepatia.recording.openScribe') || 'Open Telepatia Scribe'}
          </button>
        )}

        {currentStep === WorkflowStep.END_RECORDING && (
          <>
            <div className="text-center mb-4">
              <p className="text-green-600 font-medium">
                {t('telepatia.recording.recordingInProgress') || 'Recording session in progress...'}
              </p>
              <p className="text-gray-600 text-sm mt-1">
                {t('telepatia.recording.completeInstructions') || 'Complete your recording in the Scribe interface, then click the button below.'}
              </p>
            </div>
            
            <button
              onClick={handleMarkComplete}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
            >
              {t('telepatia.recording.markComplete') || 'Mark Recording Complete'}
            </button>
            
            <button
              onClick={handleOpenScribe}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              {t('telepatia.recording.reopenScribe') || 'Reopen Scribe'}
            </button>
          </>
        )}

        {/* Skip option for demo purposes */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleSkipRecording}
            className="w-full text-gray-500 hover:text-gray-700 py-2 text-sm transition-colors"
          >
            {t('telepatia.recording.skipForDemo') || 'Skip Recording (Demo Only)'}
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-8 text-center max-w-md">
        <p className="text-sm text-gray-500">
          {t('telepatia.recording.helpText') || 'The Telepatia Scribe interface will open in a new tab. Complete your recording there and return here to continue the integration workflow.'}
        </p>
      </div>
    </div>
  )
}
