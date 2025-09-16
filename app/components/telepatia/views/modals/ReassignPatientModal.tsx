'use client'

import { useTelepatia } from '../../context/TelepatiaContext'
import PatientInfoCard from '../../shared/PatientInfoCard'
import CreatePatientForm from '../../shared/CreatePatientForm'
import { PatientInfo, Session } from '@/app/types'

interface ReassignPatientModalProps {
  patientInfo: PatientInfo | null
}

export default function ReassignPatientModal({ patientInfo }: ReassignPatientModalProps) {
  const {
    showCreateNewPatient,
    setShowCreateNewPatient,
    newPatientForm,
    setNewPatientForm,
    reassignSession,
    sessions,
    setSessions,
    setSelectedSession,
    setShowReassignModal,
    setShowSessionsList
  } = useTelepatia()
  
  const isAssigning = !reassignSession?.patientInfo

  const handleConfirmReassign = (useExisting: boolean) => {
    if (useExisting) {
      // Use existing patient info
      if (reassignSession) {
        const updatedSession = { ...reassignSession, patientInfo: patientInfo || undefined }
        const updatedSessions = sessions.map(s =>
          s.id === reassignSession.id ? updatedSession : s
        ) as Session[]
        setSessions(updatedSessions)
        setSelectedSession(updatedSession as Session)
      }
      setShowReassignModal(false)
      setShowSessionsList(true)
    } else {
      // Show create new patient form
      setShowCreateNewPatient(true)
    }
  }

  const handleCreateNewPatient = () => {
    if (newPatientForm.name && newPatientForm.idCountry && newPatientForm.idType && newPatientForm.idValue) {
      const newPatientInfo: PatientInfo = {
        name: newPatientForm.name,
        idCountry: newPatientForm.idCountry,
        idType: newPatientForm.idType,
        idValue: newPatientForm.idValue
      }
      
      if (reassignSession) {
        const updatedSession = { 
          ...reassignSession, 
          patientInfo: newPatientInfo,
          patientName: newPatientInfo.name 
        }
        const updatedSessions = sessions.map(s => 
          s.id === reassignSession.id ? updatedSession : s
        )
        setSessions(updatedSessions)
        setSelectedSession(updatedSession)
      }
      
      setShowReassignModal(false)
      setShowCreateNewPatient(false)
      setShowSessionsList(true)
    }
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
        {!showCreateNewPatient ? (
          <>
            <PatientInfoCard 
              patientInfo={patientInfo}
              title={isAssigning ? "Assign Patient" : "Reassign Patient"}
              description={isAssigning ? "Assign patient information for this session:" : "Reassign patient information for this session:"}
            />
            <div className="flex space-x-4">
              <button
                onClick={() => handleConfirmReassign(true)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Use this information
              </button>
              <button
                onClick={() => handleConfirmReassign(false)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Create new patient
              </button>
            </div>
            <button
              onClick={() => {
                setShowReassignModal(false)
                setShowSessionsList(true)
              }}
              className="w-full mt-4 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Create New Patient</h2>
            <p className="text-gray-600 mb-4">
              Enter patient information (all fields required):
            </p>
            <CreatePatientForm 
              formData={newPatientForm}
              onChange={setNewPatientForm}
            />
            <div className="flex space-x-4 mt-6">
              <button
                onClick={handleCreateNewPatient}
                disabled={!newPatientForm.name || !newPatientForm.idCountry || !newPatientForm.idType || !newPatientForm.idValue}
                className={`flex-1 font-semibold py-2 px-4 rounded-lg transition-colors ${
                  newPatientForm.name && newPatientForm.idCountry && newPatientForm.idType && newPatientForm.idValue
                    ? 'bg-green-500 hover:bg-green-600 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Create Patient
              </button>
              <button
                onClick={() => setShowCreateNewPatient(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}