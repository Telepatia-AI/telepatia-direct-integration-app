'use client'

import { useTelepatia } from '../../context/TelepatiaContext'
import PatientInfoCard from '../../shared/PatientInfoCard'
import { PatientInfo, Session, WorkflowStep } from '@/app/types'
import { useTranslation } from 'react-i18next'

interface ConfirmPatientModalProps {
  patientInfo: PatientInfo | null
  setCurrentStep: (step: WorkflowStep) => void
  onSessionCreated: (session: Session) => void
}

export default function ConfirmPatientModal({ 
  patientInfo, 
  setCurrentStep,
  onSessionCreated 
}: ConfirmPatientModalProps) {
  const { t } = useTranslation()
  const {
    sessions,
    setSessions,
    setSelectedSession,
    setShowConfirmModal
  } = useTelepatia()

  const handleConfirmPatient = (useInfo: boolean) => {
    setShowConfirmModal(false)
    
    const currentTime = new Date()
    const newSession: Session = {
      id: Date.now().toString(),
      patientName: useInfo && patientInfo ? patientInfo.name : `Patient ${currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
      startTime: currentTime.toISOString(),
      duration: 0, // Duration will be set by external scribe
      patientInfo: useInfo && patientInfo ? patientInfo : undefined
    }
    
    setSessions([newSession, ...sessions])
    setSelectedSession(newSession)
    onSessionCreated(newSession)
    
    // Move directly to the next step after confirming patient
    setCurrentStep(WorkflowStep.IMPORT_SCRIBE)
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <PatientInfoCard 
          patientInfo={patientInfo}
          title={t('telepatia.patient.confirmTitle')}
          description={t('telepatia.patient.confirmMessage')}
        />
        <div className="flex space-x-4">
          <button
            onClick={() => handleConfirmPatient(true)}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {t('telepatia.patient.confirm')}
          </button>
          <button
            onClick={() => handleConfirmPatient(false)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {t('telepatia.patient.cancel')}
          </button>
        </div>
      </div>
    </div>
  )
}