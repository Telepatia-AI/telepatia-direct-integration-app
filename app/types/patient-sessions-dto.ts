export interface FindPatientSessionsRequestDto {
  idCountry: string
  idType: string
  idValue: string
  limit?: number
}

export interface OdontogramDto {
  [key: string]: any
}

export interface ExtraOralExaminationDto {
  [key: string]: any
}

export interface IntraOralExaminationDto {
  [key: string]: any
}

export interface MedicalRecordDto {
  odontogram?: OdontogramDto
  extraOralExamination?: ExtraOralExaminationDto
  intraOralExamination?: IntraOralExaminationDto
}

export interface SessionDto {
  documentId: string
  createdAt: Date | string
  status: string
  medicalRecord?: MedicalRecordDto
}

export interface FindPatientSessionsResponseDto {
  patientDocumentId: string
  sessions: SessionDto[]
}