'use client'

import { useState } from 'react'
import { PatientInfo, Session, WorkflowStep } from '@/app/types'
import { useTranslation } from 'react-i18next'
import ExternalSystemAPI, { validateBearerToken } from '@/app/services/api'
import { CountryNames } from '@/app/enums/countryNamesEnum'
import { IdentificationTypes } from '@/app/enums/identificationTypesEnum'

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
  
  // Editable patient form fields
  const [patientName, setPatientName] = useState('John Doe')
  const [patientCountry, setPatientCountry] = useState('COLOMBIA')
  const [patientIdType, setPatientIdType] = useState('CC')
  const [patientIdValue, setPatientIdValue] = useState('abcd1234efg5678')

  const api = bearerToken ? new ExternalSystemAPI(bearerToken) : null

  // Helper functions for form options
  const getCountryDisplayName = (countryCode: string) => {
    return t(`countries.${countryCode.toLowerCase()}`) || countryCode
  }

  const getIdTypeDisplayName = (idType: string) => {
    return t(`idTypes.${idType.toLowerCase()}`) || idType
  }

  // Get commonly used countries for Latin America focus
  const getCommonCountries = () => {
    return [
      CountryNames.COLOMBIA,
      CountryNames.MEXICO,
      CountryNames.PERU,
      CountryNames.ARGENTINA,
      CountryNames.CHILE,
      CountryNames.ECUADOR,
      CountryNames.VENEZUELA
    ]
  }

  // Get common ID types
  const getCommonIdTypes = () => {
    return [
      IdentificationTypes.CC, // Cédula de Ciudadanía
      IdentificationTypes.CE, // Cédula de Extranjería  
      IdentificationTypes.PASSPORT,
      IdentificationTypes.TI, // Tarjeta de Identidad
      IdentificationTypes.RC, // Registro Civil
      IdentificationTypes.NIT // Tax ID
    ]
  }

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
      // Validate form fields
      if (!patientName.trim() || !patientIdValue.trim()) {
        setApiError('Please fill in all required fields')
        return
      }
      
      setIsLoading(true)
      setApiError(null)
      
      const patient: PatientInfo = {
        name: patientName.trim(),
        idCountry: patientCountry,
        idType: patientIdType,
        idValue: patientIdValue.trim()
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
    // Reset form fields to defaults
    setPatientName('John Doe')
    setPatientCountry('COLOMBIA')
    setPatientIdType('CC')
    setPatientIdValue('abcd1234efg5678')
  }

  return (
    <div className="relative">
      <h1 className="text-xl font-semibold mb-6 text-gray-800">{t('externalSystem.title')}</h1>
      
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
              <p className="text-sm text-gray-600 mb-4">{t('externalSystem.clickToInitialize')}</p>
              
              {/* Editable Patient Form */}
              <div className="space-y-4">
                {/* Patient Name */}
                <div>
                  <label htmlFor="patient-name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('externalSystem.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="patient-name"
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter patient name"
                  />
                </div>

                {/* Patient Country */}
                <div>
                  <label htmlFor="patient-country" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('externalSystem.country')}
                  </label>
                  <select
                    id="patient-country"
                    value={patientCountry}
                    onChange={(e) => setPatientCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {getCommonCountries().map((country) => (
                      <option key={country} value={country}>
                        {getCountryDisplayName(country)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient ID Type */}
                <div>
                  <label htmlFor="patient-id-type" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('externalSystem.idType')}
                  </label>
                  <select
                    id="patient-id-type"
                    value={patientIdType}
                    onChange={(e) => setPatientIdType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {getCommonIdTypes().map((idType) => (
                      <option key={idType} value={idType}>
                        {getIdTypeDisplayName(idType)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Patient ID Value */}
                <div>
                  <label htmlFor="patient-id-value" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('externalSystem.idValue')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="patient-id-value"
                    type="text"
                    value={patientIdValue}
                    onChange={(e) => setPatientIdValue(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter patient ID"
                  />
                </div>
              </div>
            </div>
            {apiError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p className="text-sm">{apiError}</p>
              </div>
            )}
            <button
              onClick={handleInitializeConsult}
              disabled={currentStep !== WorkflowStep.INITIALIZE_CONSULTATION || isLoading || !isAuthenticated || !patientName.trim() || !patientIdValue.trim()}
              className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors ${
                currentStep === WorkflowStep.INITIALIZE_CONSULTATION && !isLoading && isAuthenticated && patientName.trim() && patientIdValue.trim()
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