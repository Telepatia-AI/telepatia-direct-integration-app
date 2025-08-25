'use client'

import { PatientInfo } from '@/app/types'
import { useTranslation } from 'react-i18next'

interface PatientInfoCardProps {
  patientInfo: PatientInfo | null
  title?: string
  description?: string
}

export default function PatientInfoCard({ patientInfo, title, description }: PatientInfoCardProps) {
  const { t } = useTranslation()
  
  if (!patientInfo) return null
  
  return (
    <>
      {title && <h2 className="text-xl font-semibold mb-4 text-gray-800">{title}</h2>}
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      <div className="bg-gray-100 p-4 rounded mb-6">
        <p className="text-sm"><strong>{t('telepatia.patient.name')}:</strong> {patientInfo.name}</p>
        <p className="text-sm"><strong>{t('telepatia.patient.country')}:</strong> {patientInfo.idCountry}</p>
        <p className="text-sm"><strong>{t('telepatia.patient.idType')}:</strong> {patientInfo.idType}</p>
        <p className="text-sm"><strong>{t('telepatia.patient.idNumber')}:</strong> {patientInfo.idValue}</p>
      </div>
    </>
  )
}