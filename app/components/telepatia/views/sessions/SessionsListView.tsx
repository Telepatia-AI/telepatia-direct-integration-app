'use client'

import { useTelepatia } from '../../context/TelepatiaContext'
import { Session, WorkflowStep } from '@/app/types'

interface SessionsListViewProps {
  setCurrentStep: (step: WorkflowStep) => void
}

export default function SessionsListView({ setCurrentStep }: SessionsListViewProps) {
  const {
    sessions,
    setSelectedSession,
    setShowSessionsList,
    setReassignSession,
    setShowReassignModal,
    setShowCreateNewPatient,
    setNewPatientForm,
    recordingTime
  } = useTelepatia()

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session)
    setShowSessionsList(false)
    setCurrentStep(WorkflowStep.IMPORT_SCRIBE)
  }

  const handleReassignPatient = (session: Session) => {
    setReassignSession(session)
    setShowSessionsList(false)
    setShowReassignModal(true)
    setShowCreateNewPatient(false)
    setNewPatientForm({
      name: '',
      idCountry: '',
      idType: '',
      idValue: ''
    })
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Session</h2>
        <p className="text-gray-600 mb-4">
          Choose the session to import:
        </p>
        <div className="space-y-2">
          {sessions.map((session, index) => (
            <div
              key={session.id}
              className={`border-2 rounded-lg p-4 transition-colors ${
                index === 0 ? 'border-purple-500' : 'border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded"
                  onClick={() => handleSelectSession(session)}
                >
                  <h3 className="font-semibold text-gray-800">
                    {session.patientName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Started: {new Date(session.startTime).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Duration: {formatTime(session.duration)}
                  </p>
                  {session.patientInfo && (
                    <p className="text-xs text-gray-500 mt-1">
                      ID: {session.patientInfo.idType} - {session.patientInfo.idValue}
                    </p>
                  )}
                </div>
                {session.patientInfo ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReassignPatient(session)
                    }}
                    className="ml-2 p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
                    title="Reassign Patient"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleReassignPatient(session)
                    }}
                    className="ml-2 px-3 py-1 text-sm bg-red-400 hover:bg-red-500 text-white rounded-lg transition-colors"
                  >
                    Assign Patient
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}