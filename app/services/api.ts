import { PatientInfo } from '@/app/types'
import { FindPatientSessionsRequestDto, FindPatientSessionsResponseDto } from '@/app/types/patient-sessions-dto'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://uzui-alb-1991166989.us-east-2.elb.amazonaws.com'

export interface UpdatePatientPayload {
  name: string
  idCountry: string
  idType: string
  idValue: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

export interface ApiSuccessResponse {
  success: boolean
}

export class ExternalSystemAPI {
  private bearerToken: string

  constructor(bearerToken: string) {
    this.bearerToken = bearerToken
  }

  async updateCurrentPatient(patient: PatientInfo): Promise<ApiResponse> {
    try {
      const payload: UpdatePatientPayload = {
        name: patient.name,
        idCountry: patient.idCountry.toUpperCase(),
        idType: patient.idType,
        idValue: patient.idValue
      }

      const response = await fetch(`${API_BASE_URL}/api/account/external-system/current-patient`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: `Failed to update patient: ${response.status} ${response.statusText}. ${errorText}`
        }
      }

      // Check if response is 200 and contains success: true
      const data: ApiSuccessResponse = await response.json().catch(() => ({ success: false }))
      
      if (response.status === 200 && data.success === true) {
        return {
          success: true,
          data
        }
      } else {
        return {
          success: false,
          error: 'API returned unexpected response format or success: false'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async findSessionsByPatient(patient: PatientInfo, limit: number = 10): Promise<ApiResponse<FindPatientSessionsResponseDto>> {
    try {
      const payload: FindPatientSessionsRequestDto = {
        idCountry: patient.idCountry.toUpperCase(),
        idType: patient.idType,
        idValue: patient.idValue,
        limit
      }

      const response = await fetch(`${API_BASE_URL}/api/scribe-sessions/find-by-patient`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text()
        return {
          success: false,
          error: `Failed to fetch sessions: ${response.status} ${response.statusText}. ${errorText}`
        }
      }

      const data: FindPatientSessionsResponseDto = await response.json()
      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  async fetchScribeSession(patient: PatientInfo): Promise<ApiResponse<string>> {
    try {
      // First, find sessions for the patient
      const sessionsResult = await this.findSessionsByPatient(patient, 1)
      
      if (!sessionsResult.success || !sessionsResult.data) {
        return {
          success: false,
          error: sessionsResult.error || 'Failed to fetch patient sessions'
        }
      }

      const { sessions } = sessionsResult.data
      
      if (!sessions || sessions.length === 0) {
        return {
          success: false,
          error: `No sessions found for patient ${patient.name} (ID: ${patient.idValue})`
        }
      }

      // Get the most recent session
      const latestSession = sessions[0]
      
      // Format the medical record data as a scribe note
      const scribeNote = this.formatSessionAsScribeNote(latestSession)
      
      return {
        success: true,
        data: scribeNote
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }
  }

  private formatSessionAsScribeNote(session: any): string {
    let scribeNote = `Session ID: ${session.documentId}\n`
    scribeNote += `Date: ${new Date(session.createdAt).toLocaleString()}\n`
    scribeNote += `Status: ${session.status}\n\n`

    if (session.medicalRecord) {
      scribeNote += `Medical Record:\n`
      scribeNote += `================\n\n`

      if (session.medicalRecord.extraOralExamination) {
        scribeNote += `Extra Oral Examination:\n`
        scribeNote += JSON.stringify(session.medicalRecord.extraOralExamination, null, 2)
        scribeNote += `\n\n`
      }

      if (session.medicalRecord.intraOralExamination) {
        scribeNote += `Intra Oral Examination:\n`
        scribeNote += JSON.stringify(session.medicalRecord.intraOralExamination, null, 2)
        scribeNote += `\n\n`
      }

      if (session.medicalRecord.odontogram) {
        scribeNote += `Odontogram:\n`
        scribeNote += JSON.stringify(session.medicalRecord.odontogram, null, 2)
        scribeNote += `\n\n`
      }
    } else {
      scribeNote += `No medical record available for this session.\n`
    }

    return scribeNote
  }
}

// Static method for validating bearer token
export async function validateBearerToken(token: string): Promise<ApiResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Invalid token: ${response.status} ${response.statusText}`
      }
    }

    const data = await response.json().catch(() => null)
    return {
      success: true,
      data
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to validate token'
    }
  }
}

export default ExternalSystemAPI