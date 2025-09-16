import { PatientInfo, Doctor, DoctorListResponse, DoctorListFilters, UpdateDoctorStatusRequest, UpdateDoctorStatusResponse, CreateDoctorAccountRequest, CreateDoctorAccountResponse } from '@/app/types'
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

  // Doctor management methods
  async listDoctors(filters: DoctorListFilters = {}): Promise<ApiResponse<DoctorListResponse>> {
    try {
      const params = new URLSearchParams()
      
      if (filters.status) params.append('status', filters.status)
      if (filters.specialty) params.append('specialty', filters.specialty)
      if (filters.page) params.append('page', filters.page.toString())
      if (filters.limit) params.append('limit', filters.limit.toString())
      
      const queryString = params.toString()
      const url = `${API_BASE_URL}/api/institutionals/doctors${queryString ? '?' + queryString : ''}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorMessage = `Failed to fetch doctors: ${response.status} ${response.statusText}`
        
        if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your credentials.'
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden. You do not have permission to view doctors.'
        } else if (response.status === 429) {
          errorMessage = 'Too many requests. Please wait before trying again.'
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        } else if (errorText) {
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.message || errorMessage
          } catch {
            // Keep default message if error text is not valid JSON
          }
        }
        
        return {
          success: false,
          error: errorMessage
        }
      }

      const data: DoctorListResponse = await response.json()
      
      // Apply client-side search filter if provided (since API might not support it)
      if (filters.search && data.doctors) {
        const searchTerm = filters.search.toLowerCase()
        data.doctors = data.doctors.filter(doctor => 
          doctor.nameFull?.toLowerCase().includes(searchTerm) ||
          doctor.email?.toLowerCase().includes(searchTerm)
        )
      }
      
      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch doctors'
      }
    }
  }

  async updateDoctorStatus(
    doctorId: string, 
    enabled: boolean, 
    reason?: string
  ): Promise<ApiResponse<UpdateDoctorStatusResponse>> {
    try {
      const payload: UpdateDoctorStatusRequest = {
        enabled
      }
      
      if (!enabled && reason) {
        payload.reason = reason
      }

      const response = await fetch(`${API_BASE_URL}/api/institutionals/accounts/${doctorId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorMessage = `Failed to update doctor status: ${response.status} ${response.statusText}`
        
        if (response.status === 400) {
          try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.message || 'Invalid request. Please check the provided data.'
          } catch {
            errorMessage = 'Invalid request. Please check the provided data.'
          }
        } else if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your credentials.'
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden. Cannot update doctors from other institutions.'
        } else if (response.status === 404) {
          errorMessage = 'Doctor not found.'
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
        
        return {
          success: false,
          error: errorMessage
        }
      }

      const data: UpdateDoctorStatusResponse = await response.json()
      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update doctor status'
      }
    }
  }

  async createDoctorAccount(accountData: CreateDoctorAccountRequest): Promise<ApiResponse<CreateDoctorAccountResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/institutionals/accounts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData)
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        let errorMessage = `Failed to create doctor account: ${response.status} ${response.statusText}`
        
        if (response.status === 400) {
          try {
            const errorJson = JSON.parse(errorText)
            if (errorJson.message) {
              if (Array.isArray(errorJson.message)) {
                errorMessage = errorJson.message.join(', ')
              } else {
                errorMessage = errorJson.message
              }
            } else {
              errorMessage = 'Invalid request. Please check the provided data.'
            }
          } catch {
            errorMessage = 'Invalid request. Please check the provided data.'
          }
        } else if (response.status === 401) {
          errorMessage = 'Invalid API key. Please check your credentials.'
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden. You do not have permission to create doctor accounts.'
        } else if (response.status === 409) {
          errorMessage = 'An account with this email already exists.'
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.'
        }
        
        return {
          success: false,
          error: errorMessage
        }
      }

      const data: CreateDoctorAccountResponse = await response.json()
      return {
        success: true,
        data
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create doctor account'
      }
    }
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