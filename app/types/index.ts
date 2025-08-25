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