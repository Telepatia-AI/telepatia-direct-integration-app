'use client'

import { createContext, useContext, useState, useRef, ReactNode } from 'react'
import { Session, PatientInfo, WorkflowStep } from '@/app/types'

interface TelepatiaContextType {
  // Recording states
  isRecording: boolean
  setIsRecording: (value: boolean) => void
  isPaused: boolean
  setIsPaused: (value: boolean) => void
  recordingTime: number
  setRecordingTime: (value: number) => void
  recordingStartTime: Date | null
  setRecordingStartTime: (value: Date | null) => void
  
  // Modal states
  showConfirmModal: boolean
  setShowConfirmModal: (value: boolean) => void
  showErrorModal: boolean
  setShowErrorModal: (value: boolean) => void
  errorMessage: string
  setErrorMessage: (value: string) => void
  showSessionsList: boolean
  setShowSessionsList: (value: boolean) => void
  showReassignModal: boolean
  setShowReassignModal: (value: boolean) => void
  showCreateNewPatient: boolean
  setShowCreateNewPatient: (value: boolean) => void
  
  // Session states
  sessions: Session[]
  setSessions: (value: Session[]) => void
  selectedSession: Session | null
  setSelectedSession: (value: Session | null) => void
  reassignSession: Session | null
  setReassignSession: (value: Session | null) => void
  
  // Form states
  newPatientForm: {
    name: string
    idCountry: string
    idType: string
    idValue: string
  }
  setNewPatientForm: (value: any) => void
  
  // Timer ref
  intervalRef: React.MutableRefObject<NodeJS.Timeout | null>
}

const TelepatiaContext = createContext<TelepatiaContextType | undefined>(undefined)

export const useTelepatia = () => {
  const context = useContext(TelepatiaContext)
  if (!context) {
    throw new Error('useTelepatia must be used within TelepatiaProvider')
  }
  return context
}

interface TelepatiaProviderProps {
  children: ReactNode
}

export function TelepatiaProvider({ children }: TelepatiaProviderProps) {
  // Recording states
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null)
  
  // Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [showSessionsList, setShowSessionsList] = useState(false)
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [showCreateNewPatient, setShowCreateNewPatient] = useState(false)
  
  // Session states
  const [sessions, setSessions] = useState<Session[]>(() => {
    // Generate mock sessions
    const mockSessions: Session[] = []
    const baseTime = new Date()
    
    for (let i = 1; i <= 9; i++) {
      const sessionTime = new Date(baseTime.getTime() - (i * 3600000))
      mockSessions.push({
        id: `mock-${i}`,
        patientName: `Patient ${sessionTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`,
        startTime: sessionTime.toISOString(),
        duration: Math.floor(Math.random() * 600) + 120,
        patientInfo: undefined
      })
    }
    
    return mockSessions
  })
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [reassignSession, setReassignSession] = useState<Session | null>(null)
  
  // Form states
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    idCountry: '',
    idType: '',
    idValue: ''
  })
  
  // Timer ref
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  
  const value: TelepatiaContextType = {
    isRecording,
    setIsRecording,
    isPaused,
    setIsPaused,
    recordingTime,
    setRecordingTime,
    recordingStartTime,
    setRecordingStartTime,
    showConfirmModal,
    setShowConfirmModal,
    showErrorModal,
    setShowErrorModal,
    errorMessage,
    setErrorMessage,
    showSessionsList,
    setShowSessionsList,
    showReassignModal,
    setShowReassignModal,
    showCreateNewPatient,
    setShowCreateNewPatient,
    sessions,
    setSessions,
    selectedSession,
    setSelectedSession,
    reassignSession,
    setReassignSession,
    newPatientForm,
    setNewPatientForm,
    intervalRef
  }
  
  return (
    <TelepatiaContext.Provider value={value}>
      {children}
    </TelepatiaContext.Provider>
  )
}