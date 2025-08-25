'use client'

import { useState } from 'react'
import Header from './components/shared/Header'
import WorkflowChecklist from './components/shared/WorkflowChecklist'
import LanguageSwitcher from './components/shared/LanguageSwitcher'
import TelepatiaInterface from './components/telepatia/TelepatiaInterface'
import ExternalSystemInterface from './components/external-system/ExternalSystemInterface'
import { WorkflowStep, PatientInfo, Session } from './types'

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WorkflowStep.AUTHENTICATE)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [bearerToken, setBearerToken] = useState('')
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const handleAuthenticate = () => {
    if (bearerToken.trim() && currentStep === WorkflowStep.AUTHENTICATE) {
      setIsAuthenticated(true)
      setCurrentStep(WorkflowStep.INITIALIZE_CONSULTATION)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setBearerToken('')
    setCurrentStep(WorkflowStep.AUTHENTICATE)
  }

  const handleSessionCreated = (session: Session) => {
    setSelectedSession(session)
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header with warning */}
      <Header />

      {/* Workflow Checklist with Language Switcher and Admin Link */}
      <div className="relative">
        <WorkflowChecklist currentStep={currentStep} />
        <div className="absolute top-4 right-4 flex items-center gap-4">
          {/* <a
            href="/admin"
            className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
          >
            Admin Panel
          </a> */}
          <LanguageSwitcher />
        </div>
      </div>

      <div className="flex flex-1">
        {/* Left Screen - Telepatia Interface */}
        <TelepatiaInterface
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          patientInfo={patientInfo}
          onSessionCreated={handleSessionCreated}
        />

        {/* Right Screen - External System Interface */}
        <ExternalSystemInterface
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          patientInfo={patientInfo}
          setPatientInfo={setPatientInfo}
          selectedSession={selectedSession}
          bearerToken={bearerToken}
          setBearerToken={setBearerToken}
          isAuthenticated={isAuthenticated}
          handleAuthenticate={handleAuthenticate}
          handleLogout={handleLogout}
        />
      </div>
    </div>
  )
}