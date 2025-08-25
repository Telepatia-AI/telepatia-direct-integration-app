'use client'

import { CountryNames } from '@/app/enums/countryNamesEnum'
import { IdentificationTypes } from '@/app/enums/identificationTypesEnum'

interface CreatePatientFormProps {
  formData: {
    name: string
    idCountry: string
    idType: string
    idValue: string
  }
  onChange: (data: any) => void
}

export default function CreatePatientForm({ formData, onChange }: CreatePatientFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter patient name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
        <select
          value={formData.idCountry}
          onChange={(e) => onChange({ ...formData, idCountry: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select country</option>
          {Object.entries(CountryNames).map(([key, value]) => (
            <option key={key} value={value}>
              {value.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
        <select
          value={formData.idType}
          onChange={(e) => onChange({ ...formData, idType: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select ID type</option>
          {Object.entries(IdentificationTypes).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">ID Value</label>
        <input
          type="text"
          value={formData.idValue}
          onChange={(e) => onChange({ ...formData, idValue: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter ID value"
        />
      </div>
    </div>
  )
}