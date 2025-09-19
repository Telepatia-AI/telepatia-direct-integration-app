'use client'

import { useEffect } from 'react'
import { TelepatiaProvider, useTelepatia } from './context/TelepatiaContext'
import RecordingView from './views/recording/RecordingView'
import SessionsListView from './views/sessions/SessionsListView'
import ConfirmPatientModal from './views/modals/ConfirmPatientModal'
import ReassignPatientModal from './views/modals/ReassignPatientModal'
import ErrorModal from './views/modals/ErrorModal'
import { Session, PatientInfo, WorkflowStep } from '@/app/types'

interface TelepatiaInterfaceProps {
  currentStep: WorkflowStep
  setCurrentStep: (step: WorkflowStep) => void
  patientInfo: PatientInfo | null
  onSessionCreated: (session: Session) => void
}

function TelepatiaInterfaceContent({ 
  currentStep, 
  setCurrentStep, 
  patientInfo,
  onSessionCreated 
}: TelepatiaInterfaceProps) {
  const {
    showConfirmModal,
    setShowConfirmModal,
    showErrorModal,
    showSessionsList,
    showReassignModal
  } = useTelepatia()

  // Auto-show ConfirmPatientModal when reaching CONFIRM_PATIENT step
  useEffect(() => {
    if (currentStep === WorkflowStep.CONFIRM_PATIENT) {
      setShowConfirmModal(true)
    }
  }, [currentStep, setShowConfirmModal])

  return (
    <div className="relative">
      <h1 className="text-xl font-semibold mb-6 text-gray-800">Telepatia Interface</h1>
      
      {/* Modals */}
      {showConfirmModal && (
        <ConfirmPatientModal 
          patientInfo={patientInfo}
          setCurrentStep={setCurrentStep}
          onSessionCreated={onSessionCreated}
        />
      )}
      
      {showErrorModal && <ErrorModal />}
      
      {showReassignModal && (
        <ReassignPatientModal patientInfo={patientInfo} />
      )}
      
      {showSessionsList && (
        <SessionsListView setCurrentStep={setCurrentStep} />
      )}
      
      {/* Main Recording View */}
      <RecordingView 
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
      />
    </div>
  )
}

export default function TelepatiaInterface(props: TelepatiaInterfaceProps) {
  return (
    <TelepatiaProvider>
      <TelepatiaInterfaceContent {...props} />
    </TelepatiaProvider>
  )
}