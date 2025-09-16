'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { X, UserX } from 'lucide-react'

interface DisableReasonModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: (reason: string) => void
  isSubmitting: boolean
  doctorName?: string
}

export default function DisableReasonModal({
  open,
  onCancel,
  onConfirm,
  isSubmitting,
  doctorName
}: DisableReasonModalProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open) {
      setReason('')
      setError('')
      // Focus the textarea when modal opens
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [open])

  const handleConfirm = useCallback(() => {
    const trimmedReason = reason.trim()
    
    if (!trimmedReason) {
      setError('Reason is required')
      return
    }
    
    if (trimmedReason.length < 5) {
      setError('Reason must be at least 5 characters long')
      return
    }
    
    if (trimmedReason.length > 500) {
      setError('Reason must not exceed 500 characters')
      return
    }
    
    setError('')
    onConfirm(trimmedReason)
  }, [reason, onConfirm])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      
      if (e.key === 'Escape') {
        onCancel()
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleConfirm()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, reason, onCancel, handleConfirm])

  const handleReasonChange = (value: string) => {
    setReason(value)
    if (error && value.trim().length >= 5) {
      setError('')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onCancel}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md mx-4 bg-white rounded-lg shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <UserX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                Disable Doctor Account
              </h3>
              {doctorName && (
                <p className="text-sm text-gray-600">{doctorName}</p>
              )}
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

        {/* Content */}
        <div className="p-6">
          <p id="modal-description" className="text-sm text-gray-600 mb-4">
            Please provide a reason for disabling this doctor account. This action will prevent the doctor from accessing the system until re-enabled.
          </p>

          <div className="space-y-2">
            <label htmlFor="disable-reason" className="block text-sm font-medium text-gray-700">
              Reason for disabling <span className="text-red-500">*</span>
            </label>
            <textarea
              ref={textareaRef}
              id="disable-reason"
              className={`w-full px-3 py-2 border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              placeholder="e.g., Policy violation, Suspicious activity, Administrative suspension..."
              rows={4}
              value={reason}
              onChange={(e) => handleReasonChange(e.target.value)}
              disabled={isSubmitting}
              maxLength={500}
              aria-describedby={error ? 'reason-error' : 'reason-help'}
            />
            
            <div className="flex justify-between items-start">
              <div className="text-xs space-y-1">
                {error ? (
                  <p id="reason-error" className="text-red-600" role="alert">{error}</p>
                ) : (
                  <p id="reason-help" className="text-gray-500">
                    Minimum 5 characters, maximum 500 characters
                  </p>
                )}
              </div>
              <span className={`text-xs ${reason.length > 450 ? 'text-orange-600' : 'text-gray-500'}`}>
                {reason.length}/500
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50 rounded-b-lg">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isSubmitting || !reason.trim() || reason.trim().length < 5}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? 'Disabling...' : 'Disable Account'}
          </Button>
        </div>
      </div>
    </div>
  )
}
