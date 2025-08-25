'use client'

import { useEffect } from 'react'
import { useTelepatia } from '../../context/TelepatiaContext'
import { WorkflowStep } from '@/app/types'
import { useTranslation } from 'react-i18next'

interface RecordingViewProps {
  currentStep: WorkflowStep
  setCurrentStep: (step: WorkflowStep) => void
}

export default function RecordingView({ currentStep, setCurrentStep }: RecordingViewProps) {
  const { t } = useTranslation()
  const {
    isRecording,
    setIsRecording,
    isPaused,
    setIsPaused,
    recordingTime,
    setRecordingTime,
    setRecordingStartTime,
    setShowConfirmModal,
    intervalRef
  } = useTelepatia()

  useEffect(() => {
    if (isRecording && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRecording, isPaused, setRecordingTime, intervalRef])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    if (currentStep === WorkflowStep.START_RECORDING) {
      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      setRecordingStartTime(new Date())
      setCurrentStep(WorkflowStep.END_RECORDING)
    }
  }

  const handlePause = () => {
    setIsPaused(!isPaused)
  }

  const handleDiscard = () => {
    setIsRecording(false)
    setIsPaused(false)
    setRecordingTime(0)
    setCurrentStep(WorkflowStep.START_RECORDING)
  }

  const handleFinish = () => {
    if (currentStep === WorkflowStep.END_RECORDING) {
      setIsRecording(false)
      setIsPaused(false)
      setCurrentStep(WorkflowStep.CONFIRM_PATIENT)
      setShowConfirmModal(true)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      {/* Timer Display */}
      <div className="text-6xl font-mono text-gray-700 mb-8">
        {formatTime(recordingTime)}
      </div>

      {/* Recording Controls */}
      <div className="flex flex-col gap-4 w-full max-w-xs">
        {!isRecording ? (
          <button
            onClick={handleStart}
            disabled={currentStep !== WorkflowStep.START_RECORDING}
            className={`font-semibold py-4 px-8 rounded-lg transition-colors ${
              currentStep === WorkflowStep.START_RECORDING 
                ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {t('telepatia.recording.start')}
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
            >
              {isPaused ? t('telepatia.recording.resume') || 'Resume' : t('telepatia.recording.pause') || 'Pause'}
            </button>
            
            <button
              onClick={handleDiscard}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-8 rounded-lg transition-colors"
            >
              {t('telepatia.recording.discard') || 'Discard'}
            </button>
            
            <button
              onClick={handleFinish}
              disabled={currentStep !== WorkflowStep.END_RECORDING}
              className={`font-semibold py-4 px-8 rounded-lg transition-colors ${
                currentStep === WorkflowStep.END_RECORDING
                  ? 'bg-purple-500 hover:bg-purple-600 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {t('telepatia.recording.finish') || 'Finish'}
            </button>
          </>
        )}
      </div>

      {/* Recording Status */}
      <div className="mt-8">
        {isRecording && (
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-red-500 animate-pulse'}`}></div>
            <span className="text-gray-600">
              {isPaused ? (t('telepatia.recording.paused') || 'Paused') : (t('telepatia.recording.status') || 'Recording...')}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}