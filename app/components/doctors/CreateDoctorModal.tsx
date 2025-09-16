'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { X, UserPlus, Eye, EyeOff, Check, Copy } from 'lucide-react'
import { CreateDoctorAccountRequest, DOCTOR_SPECIALTIES } from '@/app/types'

interface CreateDoctorModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: (accountData: CreateDoctorAccountRequest) => void
  isSubmitting: boolean
  createdAccount?: {
    documentId: string
    email: string
    apiKey: string
  } | null
}

export default function CreateDoctorModal({
  open,
  onCancel,
  onConfirm,
  isSubmitting,
  createdAccount
}: CreateDoctorModalProps) {
  const { t } = useTranslation()
  const [formData, setFormData] = useState<CreateDoctorAccountRequest>({
    email: '',
    password: '',
    doctorSpecialty: 'GENERAL_MEDICINE',
    nameFull: '',
    institutionalBranchName: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPassword, setShowPassword] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyCopied, setApiKeyCopied] = useState(false)
  
  const emailInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        email: '',
        password: '',
        doctorSpecialty: 'GENERAL_MEDICINE',
        nameFull: '',
        institutionalBranchName: ''
      })
      setErrors({})
      setShowPassword(false)
      setShowApiKey(false)
      setApiKeyCopied(false)
      // Focus the email input when modal opens
      setTimeout(() => emailInputRef.current?.focus(), 100)
    }
  }, [open])

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      if (e.key === 'Escape') {
        if (!createdAccount) { // Only allow escape if not showing success state
          onCancel()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onCancel, createdAccount])

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {}

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    } else if (formData.password.length > 50) {
      newErrors.password = 'Password must not exceed 50 characters'
    }

    // Doctor specialty validation (required)
    if (!formData.doctorSpecialty) {
      newErrors.doctorSpecialty = 'Doctor specialty is required'
    }

    // Name validation (optional but if provided, should not be empty)
    if (formData.nameFull && !formData.nameFull.trim()) {
      newErrors.nameFull = 'If provided, full name cannot be empty'
    }

    // Branch name validation (optional but if provided, should not be empty)
    if (formData.institutionalBranchName && !formData.institutionalBranchName.trim()) {
      newErrors.institutionalBranchName = 'If provided, branch name cannot be empty'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Clean up optional fields that are empty
    const cleanFormData: CreateDoctorAccountRequest = {
      email: formData.email.trim(),
      password: formData.password,
      doctorSpecialty: formData.doctorSpecialty
    }

    if (formData.nameFull?.trim()) {
      cleanFormData.nameFull = formData.nameFull.trim()
    }

    if (formData.institutionalBranchName?.trim()) {
      cleanFormData.institutionalBranchName = formData.institutionalBranchName.trim()
    }

    onConfirm(cleanFormData)
  }

  const handleInputChange = (field: keyof CreateDoctorAccountRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const copyApiKey = async () => {
    if (createdAccount?.apiKey) {
      try {
        await navigator.clipboard.writeText(createdAccount.apiKey)
        setApiKeyCopied(true)
        setTimeout(() => setApiKeyCopied(false), 3000)
      } catch (error) {
        console.error('Failed to copy API key:', error)
      }
    }
  }

  if (!open) return null

  // Success state - show created account details
  if (createdAccount) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
        
        {/* Modal */}
        <div 
          className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-lg"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Check className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 id="success-modal-title" className="text-lg font-semibold text-gray-900">
                  Doctor Account Created
                </h3>
                <p className="text-sm text-gray-600">Account created successfully</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor ID
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                <span className="font-mono text-sm text-gray-900">{createdAccount.documentId}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
                <span className="text-sm text-gray-900">{createdAccount.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="px-3 py-2 pr-20 bg-yellow-50 border border-yellow-200 rounded-md">
                  <span className="font-mono text-sm text-gray-900 break-all">
                    {showApiKey ? createdAccount.apiKey : '•'.repeat(createdAccount.apiKey.length)}
                  </span>
                </div>
                <div className="absolute right-1 top-1 flex gap-1">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title={showApiKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={copyApiKey}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded"
                    title="Copy API key"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-amber-600">
                <strong>Important:</strong> Save this API key securely. It will not be shown again.
              </p>
              {apiKeyCopied && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ API key copied to clipboard
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-6 border-t bg-gray-50 rounded-b-lg">
            <Button onClick={onCancel}>
              Done
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Form state - show create form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={!isSubmitting ? onCancel : undefined}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 id="create-modal-title" className="text-lg font-semibold text-gray-900">
                Create Doctor Account
              </h3>
              <p className="text-sm text-gray-600">Add a new doctor to your institution</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                ref={emailInputRef}
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="doctor@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter a secure password"
                  disabled={isSubmitting}
                  minLength={6}
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">6-50 characters</p>
            </div>

            {/* Doctor Specialty */}
            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700 mb-1">
                Medical Specialty <span className="text-red-500">*</span>
              </label>
              <select
                id="specialty"
                value={formData.doctorSpecialty}
                onChange={(e) => handleInputChange('doctorSpecialty', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.doctorSpecialty ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              >
                {DOCTOR_SPECIALTIES.map(specialty => (
                  <option key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </option>
                ))}
              </select>
              {errors.doctorSpecialty && (
                <p className="mt-1 text-xs text-red-600">{errors.doctorSpecialty}</p>
              )}
            </div>

            {/* Full Name (optional) */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.nameFull}
                onChange={(e) => handleInputChange('nameFull', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.nameFull ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Dr. John Doe"
                disabled={isSubmitting}
              />
              {errors.nameFull && (
                <p className="mt-1 text-xs text-red-600">{errors.nameFull}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Optional</p>
            </div>

            {/* Branch Name (optional) */}
            <div>
              <label htmlFor="branchName" className="block text-sm font-medium text-gray-700 mb-1">
                Institution Branch
              </label>
              <input
                id="branchName"
                type="text"
                value={formData.institutionalBranchName}
                onChange={(e) => handleInputChange('institutionalBranchName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.institutionalBranchName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Main Branch"
                disabled={isSubmitting}
              />
              {errors.institutionalBranchName && (
                <p className="mt-1 text-xs text-red-600">{errors.institutionalBranchName}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Optional</p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
