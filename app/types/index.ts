export interface PatientInfo {
  name: string
  idCountry: string
  idType: string
  idValue: string
}

export interface Session {
  id: string
  patientName: string
  startTime: string
  duration: number
  patientInfo?: PatientInfo
}

// Doctor management types for uzui API integration
export interface Doctor {
  documentId: string
  email: string
  nameFull: string
  doctorSpecialties: string[]
  isEnabled: boolean
  createdAt: string
  disabledAt?: string | null
  disabledReason?: string | null
  disabledBy?: string | null
}

export interface DoctorListResponse {
  doctors: Doctor[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface DoctorListFilters {
  status?: 'active' | 'inactive' | 'all'
  specialty?: string
  page?: number
  limit?: number
  search?: string
}

export interface UpdateDoctorStatusRequest {
  enabled: boolean
  reason?: string
}

export interface UpdateDoctorStatusResponse {
  accountId: string
  enabled: boolean
  disabledAt?: Date | null
  message: string
}

// Create doctor account types
export interface CreateDoctorAccountRequest {
  email: string
  password: string
  doctorSpecialty?: string
  doctorSpecialties?: string[]
  nameFull?: string
  institutionalBranchName?: string
}

export interface CreateDoctorAccountResponse {
  status: boolean
  documentId: string
  email: string
  apiKey: string
}

// Available doctor specialties (subset based on uzui enum)
export const DOCTOR_SPECIALTIES = [
  { value: 'GENERAL_MEDICINE', label: 'General Medicine' },
  { value: 'CARDIOLOGY', label: 'Cardiology' },
  { value: 'DERMATOLOGY', label: 'Dermatology' },
  { value: 'PEDIATRICS', label: 'Pediatrics' },
  { value: 'SURGERY', label: 'Surgery' },
  { value: 'PSYCHIATRY', label: 'Psychiatry' },
  { value: 'RADIOLOGY', label: 'Radiology' },
  { value: 'ANESTHESIOLOGY', label: 'Anesthesiology' },
  { value: 'EMERGENCY_MEDICINE', label: 'Emergency Medicine' },
  { value: 'INTERNAL_MEDICINE', label: 'Internal Medicine' },
  { value: 'NEUROLOGY', label: 'Neurology' },
  { value: 'ORTHOPEDICS', label: 'Orthopedics' },
  { value: 'OBSTETRICS_GYNECOLOGY', label: 'Obstetrics & Gynecology' },
  { value: 'OPHTHALMOLOGY', label: 'Ophthalmology' },
  { value: 'OTOLARYNGOLOGY', label: 'Otolaryngology' },
  { value: 'PATHOLOGY', label: 'Pathology' },
  { value: 'UROLOGY', label: 'Urology' }
] as const

export enum WorkflowStep {
  AUTHENTICATE = 10,
  INITIALIZE_CONSULTATION = 20,
  START_RECORDING = 30,
  END_RECORDING = 40,
  CONFIRM_PATIENT = 50,
  IMPORT_SCRIBE = 60,
  COMPLETED = 70
}

export const STEP_LABELS = {
  [WorkflowStep.AUTHENTICATE]: 'workflow.steps.authenticate',
  [WorkflowStep.INITIALIZE_CONSULTATION]: 'workflow.steps.initializeConsultation',
  [WorkflowStep.START_RECORDING]: 'workflow.steps.startRecording',
  [WorkflowStep.END_RECORDING]: 'workflow.steps.endRecording',
  [WorkflowStep.CONFIRM_PATIENT]: 'workflow.steps.confirmPatient',
  [WorkflowStep.IMPORT_SCRIBE]: 'workflow.steps.importScribe',
  [WorkflowStep.COMPLETED]: 'workflow.steps.completed'
}