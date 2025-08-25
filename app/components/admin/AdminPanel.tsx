'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface DoctorAccount {
  id: string
  name: string
  email: string
  specialty: string
  apiKey: string
  createdAt: string
}

export default function AdminPanel() {
  const { t } = useTranslation()
  const [doctorAccounts, setDoctorAccounts] = useState<DoctorAccount[]>([
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@clinic.com',
      specialty: 'Cardiology',
      apiKey: 'tk_live_sj_1234567890abcdef',
      createdAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@clinic.com',
      specialty: 'Neurology',
      apiKey: 'tk_live_mc_abcdef1234567890',
      createdAt: '2024-01-18'
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@clinic.com',
      specialty: 'Pediatrics',
      apiKey: 'tk_live_er_567890abcdef1234',
      createdAt: '2024-01-20'
    }
  ])

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    email: '',
    specialty: ''
  })

  const generateApiKey = () => {
    const prefix = 'tk_live_'
    const initials = newDoctor.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toLowerCase()
    const randomString = Math.random().toString(36).substring(2, 18)
    return `${prefix}${initials}_${randomString}`
  }

  const handleCreateDoctor = () => {
    if (!newDoctor.name || !newDoctor.email || !newDoctor.specialty) {
      alert('Please fill in all fields')
      return
    }

    const newAccount: DoctorAccount = {
      id: Date.now().toString(),
      name: newDoctor.name,
      email: newDoctor.email,
      specialty: newDoctor.specialty,
      apiKey: generateApiKey(),
      createdAt: new Date().toISOString().split('T')[0]
    }

    setDoctorAccounts([...doctorAccounts, newAccount])
    setShowCreateForm(false)
    setNewDoctor({ name: '', email: '', specialty: '' })
  }



  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <a
            href="/"
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            ← Back to Application
          </a>
        </div>

        {/* Master Account Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Master Account</h2>
          <div>
            <p className="text-sm text-gray-600">Username</p>
            <p className="font-semibold">admin@telepatia.com</p>
          </div>
        </div>

        {/* Doctor Accounts Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-700">Doctor Accounts</h2>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              + Create New Doctor Account
            </button>
          </div>

          {/* Create New Doctor Form */}
          {showCreateForm && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">New Doctor Account</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={newDoctor.name}
                    onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={newDoctor.email}
                    onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="doctor@clinic.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <input
                    type="text"
                    value={newDoctor.specialty}
                    onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Cardiology"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleCreateDoctor}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Create Account
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewDoctor({ name: '', email: '', specialty: '' })
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Doctor Accounts List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {doctorAccounts.map((doctor) => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {doctor.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {doctor.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {doctor.specialty}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {doctor.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {doctorAccounts.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No doctor accounts yet. Create your first account above.
              </div>
            )}
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total Doctor Accounts</h3>
            <p className="text-3xl font-bold text-blue-500">{doctorAccounts.length}</p>
          </div>
        </div>
      </div>
    </div>
  )
}