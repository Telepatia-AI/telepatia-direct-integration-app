'use client'

import { useState } from 'react'
import { PatientInfo, Session, WorkflowStep } from '@/app/types'
import { useTranslation } from 'react-i18next'
import ExternalSystemAPI, { validateBearerToken } from '@/app/services/api'

interface ExternalSystemInterfaceProps {
  currentStep: WorkflowStep
  setCurrentStep: (step: WorkflowStep) => void
  patientInfo: PatientInfo | null
  setPatientInfo: (info: PatientInfo | null) => void
  selectedSession: Session | null
  bearerToken: string
  setBearerToken: (token: string) => void
  isAuthenticated: boolean
  handleAuthenticate: () => void
  handleLogout: () => void
}

export default function ExternalSystemInterface({ 
  currentStep, 
  setCurrentStep,
  patientInfo,
  setPatientInfo,
  selectedSession,
  bearerToken,
  setBearerToken,
  isAuthenticated,
  handleAuthenticate,
  handleLogout
}: ExternalSystemInterfaceProps) {
  const { t } = useTranslation()
  const [showPatientForm, setShowPatientForm] = useState(true)
  const [medicalNotes, setMedicalNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const api = bearerToken ? new ExternalSystemAPI(bearerToken) : null

  const maskToken = (token: string) => {
    if (!token) return ''
    const numAsterisks = Math.floor(Math.random() * 10) + 5
    return '*'.repeat(numAsterisks)
  }

  const handleAuthenticateClick = async () => {
    if (!bearerToken.trim() || currentStep !== WorkflowStep.AUTHENTICATE) return
    
    setIsValidating(true)
    setValidationError(null)
    
    const result = await validateBearerToken(bearerToken)
    
    if (result.success) {
      handleAuthenticate()
    } else {
      setValidationError(result.error || 'Invalid token')
    }
    
    setIsValidating(false)
  }

  const handleInitializeConsult = async () => {
    if (currentStep === WorkflowStep.INITIALIZE_CONSULTATION && isAuthenticated && api) {
      setIsLoading(true)
      setApiError(null)
      
      const patient: PatientInfo = {
        name: 'John Doe',
        idCountry: 'Colombia',
        idType: 'CC',
        idValue: 'abcd1234efg5678'
      }
      
      // Call the API to update the current patient in the external system
      const result = await api.updateCurrentPatient(patient)
      
      if (result.success) {
        setPatientInfo(patient)
        setShowPatientForm(false)
        setCurrentStep(WorkflowStep.START_RECORDING)
      } else {
        setApiError(result.error || 'Failed to update patient information')
      }
      
      setIsLoading(false)
    }
  }

  const handleImportScribe = async () => {
    if (currentStep === WorkflowStep.IMPORT_SCRIBE && patientInfo && api) {
      setIsLoading(true)
      setApiError(null)
      
      const result = await api.fetchScribeSession(patientInfo)
      
      if (result.success && result.data) {
        setMedicalNotes(result.data)
        setCurrentStep(WorkflowStep.COMPLETED)
      } else {
        setApiError(result.error || 'Failed to fetch scribe session')
        setCurrentStep(WorkflowStep.CONFIRM_PATIENT)
      }
      
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setShowPatientForm(true)
    setPatientInfo(null)
    setMedicalNotes('')
    setApiError(null)
    setCurrentStep(WorkflowStep.AUTHENTICATE)
  }

  return (
    <div className="w-1/2 p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">{t('externalSystem.title')}</h1>
      
      {/* Bearer Token Authentication */}
      <div className={`mb-6 p-4 rounded-lg ${isAuthenticated ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'}`}>
        <div className="flex items-center gap-2">
          <label htmlFor="bearer-token" className="text-sm font-semibold text-gray-700">
            {t('header.bearerToken')}:
          </label>
          {!isAuthenticated ? (
            <>
              <input
                id="bearer-token"
                type="text"
                value={bearerToken}
                onChange={(e) => {
                  setBearerToken(e.target.value)
                  setValidationError(null)
                }}
                placeholder={t('header.enterToken')}
                className={`flex-1 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  validationError ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              <button
                onClick={handleAuthenticateClick}
                disabled={currentStep !== WorkflowStep.AUTHENTICATE || isValidating || !bearerToken.trim()}
                className={`px-3 py-1 rounded transition-colors border ${
                  currentStep === WorkflowStep.AUTHENTICATE && !isValidating && bearerToken.trim()
                    ? 'bg-indigo-500 text-white hover:bg-indigo-600 border-indigo-500 cursor-pointer'
                    : 'bg-gray-300 text-gray-500 border-gray-300 cursor-not-allowed'
                }`}
                title={currentStep === WorkflowStep.AUTHENTICATE ? t('header.authenticate') : t('header.completePreviousSteps')}
              >
                {isValidating ? '⏳' : '🔒'} {t('header.authenticate')}
              </button>
            </>
          ) : (
            <>
              <span className="flex-1 px-3 py-1 text-sm bg-green-200 border border-green-400 rounded font-mono">
                {maskToken(bearerToken)}
              </span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 bg-red-500 text-white hover:bg-red-600 rounded transition-colors"
                title={t('header.logout')}
              >
                🔓 {t('header.logout')}
              </button>
            </>
          )}
        </div>
        {validationError && !isAuthenticated && (
          <div className="mt-2 text-sm text-red-600">
            {validationError}
          </div>
        )}
      </div>
      
      {showPatientForm ? (
        /* Patient Initialization Form */
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('externalSystem.initializeConsult')}</h2>
          <div className="space-y-4">
            <div className="border border-gray-300 p-4 rounded">
              <p className="text-sm text-gray-600 mb-2">{t('externalSystem.clickToInitialize')}</p>
              <ul className="text-sm space-y-1 mb-4">
                <li><strong>{t('externalSystem.name')}:</strong> John Doe</li>
                <li><strong>{t('externalSystem.country')}:</strong> Colombia</li>
                <li><strong>{t('externalSystem.idType')}:</strong> CC</li>
                <li><strong>{t('externalSystem.idValue')}:</strong> abcd1234efg5678</li>
              </ul>
            </div>
            {apiError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="text-sm">{apiError}</p>
              </div>
            )}
            <button
              onClick={handleInitializeConsult}
              disabled={currentStep !== WorkflowStep.INITIALIZE_CONSULTATION || isLoading || !isAuthenticated}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors ${
                currentStep === WorkflowStep.INITIALIZE_CONSULTATION && !isLoading && isAuthenticated
                  ? 'bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Updating...' : t('externalSystem.initializeButton')}
            </button>
          </div>
        </div>
      ) : (
        /* Medical Record View */
        <div className="space-y-6">
          {/* Patient Information Section */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">{t('externalSystem.patientInformation')}</h2>
            {patientInfo && (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-gray-600">{t('externalSystem.name')}:</span>
                  <p className="text-gray-800">{patientInfo.name}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">{t('externalSystem.idCountry')}:</span>
                  <p className="text-gray-800">{patientInfo.idCountry}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">{t('externalSystem.idType')}:</span>
                  <p className="text-gray-800">{patientInfo.idType}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-600">{t('externalSystem.idValue')}:</span>
                  <p className="text-gray-800">{patientInfo.idValue}</p>
                </div>
              </div>
            )}
          </div>

          {/* Medical Notes Section */}
          <div className="bg-white p-6 rounded-lg shadow-md flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">{t('externalSystem.medicalRecord')}</h2>
              <button
                onClick={handleImportScribe}
                disabled={currentStep !== WorkflowStep.IMPORT_SCRIBE || isLoading}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                  currentStep === WorkflowStep.IMPORT_SCRIBE && !isLoading
                    ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Importing...' : t('externalSystem.importScribeSession')}
              </button>
            </div>
            {apiError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="text-sm">{apiError}</p>
              </div>
            )}
            <textarea
              value={medicalNotes}
              readOnly
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none bg-gray-50 text-gray-700"
              placeholder={t('externalSystem.medicalNotesPlaceholder')}
            />
          </div>

          {/* Reset Workflow Button */}
          <button
            onClick={handleReset}
            className={`font-semibold py-2 px-4 rounded-lg transition-colors ${
              currentStep === WorkflowStep.COMPLETED
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
          >
            {currentStep === WorkflowStep.COMPLETED ? t('externalSystem.startNewWorkflow') : t('externalSystem.resetWorkflow')}
          </button>
        </div>
      )}
    </div>
  )
}