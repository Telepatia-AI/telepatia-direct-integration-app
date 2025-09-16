'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Search, Filter, Download, UserCheck, UserX, MoreHorizontal, Key, RefreshCw, AlertCircle, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react'
import { Doctor, DoctorListFilters, CreateDoctorAccountRequest } from '@/app/types'
import ExternalSystemAPI from '@/app/services/api'
import DisableReasonModal from './DisableReasonModal'
import CreateDoctorModal from './CreateDoctorModal'

interface DoctorsManagementState {
  doctors: Doctor[]
  total: number
  page: number
  limit: number
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

export default function DoctorsManagement() {
  const { t } = useTranslation()

  // API Key management
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [apiKeyError, setApiKeyError] = useState('')
  
  // Data state
  const [state, setState] = useState<DoctorsManagementState>({
    doctors: [],
    total: 0,
    page: 1,
    limit: 20,
    hasMore: false,
    isLoading: false,
    error: null
  })
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDoctors, setSelectedDoctors] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  
  // Modal state
  const [disableModal, setDisableModal] = useState<{
    open: boolean
    doctorId: string | null
    doctorName: string | null
    isSubmitting: boolean
  }>({ open: false, doctorId: null, doctorName: null, isSubmitting: false })
  
  const [createModal, setCreateModal] = useState<{
    open: boolean
    isSubmitting: boolean
    createdAccount: { documentId: string; email: string; apiKey: string } | null
  }>({ open: false, isSubmitting: false, createdAccount: null })
  
  // Refs
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Load API key from localStorage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('uzui-api-key')
    if (savedApiKey) {
      setApiKey(savedApiKey)
    }
  }, [])
  
  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('uzui-api-key', apiKey)
      setApiKeyError('')
    } else {
      localStorage.removeItem('uzui-api-key')
    }
  }, [apiKey])
  
  // Fetch doctors from API
  const fetchDoctors = useCallback(async (resetPage = false) => {
    if (!apiKey.trim()) {
      setApiKeyError('API key is required')
      return
    }
    
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    abortControllerRef.current = new AbortController()
    
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    try {
      const api = new ExternalSystemAPI(apiKey)
      const filters: DoctorListFilters = {
        page: resetPage ? 1 : state.page,
        limit: state.limit,
        search: searchTerm.trim() || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter
      }
      
      const response = await api.listDoctors(filters)
      
      if (response.success && response.data) {
        setState(prev => ({
          ...prev,
          doctors: response.data!.doctors,
          total: response.data!.total,
          page: response.data!.page,
          limit: response.data!.limit,
          hasMore: response.data!.hasMore,
          isLoading: false,
          error: null
        }))
        setSelectedDoctors([])
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: response.error || 'Failed to fetch doctors'
        }))
        
        // Special handling for API key errors
        if (response.error?.includes('Invalid API key') || response.error?.includes('401')) {
          setApiKeyError('Invalid API key. Please check your credentials.')
        }
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please check your connection.'
      }))
    }
  }, [apiKey, searchTerm, statusFilter, state.page, state.limit])
  
  // Debounced search effect
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      if (apiKey) {
        fetchDoctors()
      }
    }, 300)
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchTerm, statusFilter, state.page, state.limit, apiKey, fetchDoctors])
  
  // Handle API key input
  const handleApiKeySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      fetchDoctors(true)
    }
  }
  
  const clearApiKey = () => {
    setApiKey('')
    setApiKeyError('')
    setState(prev => ({ ...prev, doctors: [], total: 0, error: null }))
  }
  
  // Handle doctor status toggle
  const toggleDoctorStatus = async (doctorId: string, currentStatus: boolean) => {
    const doctor = state.doctors.find(d => d.documentId === doctorId)
    if (!doctor) return
    
    if (currentStatus) {
      // Disabling - show modal for reason
      setDisableModal({
        open: true,
        doctorId,
        doctorName: doctor.nameFull || doctor.email,
        isSubmitting: false
      })
    } else {
      // Enabling - do it directly
      await updateDoctorStatus(doctorId, true)
    }
  }
  
  // Update doctor status via API
  const updateDoctorStatus = async (doctorId: string, enabled: boolean, reason?: string) => {
    if (!apiKey) return
    
    setState(prev => ({
      ...prev,
      doctors: prev.doctors.map(doctor =>
        doctor.documentId === doctorId
          ? { ...doctor, isEnabled: enabled }
          : doctor
      )
    }))
    
    try {
      const api = new ExternalSystemAPI(apiKey)
      const response = await api.updateDoctorStatus(doctorId, enabled, reason)
      
      if (response.success) {
        // Refresh the list to ensure consistency
        await fetchDoctors()
      } else {
        // Revert optimistic update
        setState(prev => ({
          ...prev,
          doctors: prev.doctors.map(doctor =>
            doctor.documentId === doctorId
              ? { ...doctor, isEnabled: !enabled }
              : doctor
          ),
          error: response.error || 'Failed to update doctor status'
        }))
      }
    } catch (error) {
      // Revert optimistic update
      setState(prev => ({
        ...prev,
        doctors: prev.doctors.map(doctor =>
          doctor.documentId === doctorId
            ? { ...doctor, isEnabled: !enabled }
            : doctor
        ),
        error: 'Network error. Please try again.'
      }))
    }
  }
  
  // Handle disable confirmation
  const handleDisableConfirm = async (reason: string) => {
    if (!disableModal.doctorId) return
    
    setDisableModal(prev => ({ ...prev, isSubmitting: true }))
    
    await updateDoctorStatus(disableModal.doctorId, false, reason)
    
    setDisableModal({
      open: false,
      doctorId: null,
      doctorName: null,
      isSubmitting: false
    })
  }
  
  const handleDisableCancel = () => {
    setDisableModal({
      open: false,
      doctorId: null,
      doctorName: null,
      isSubmitting: false
    })
  }
  
  // Handle create doctor
  const handleCreateDoctor = () => {
    setCreateModal({
      open: true,
      isSubmitting: false,
      createdAccount: null
    })
  }
  
  const handleCreateConfirm = async (accountData: CreateDoctorAccountRequest) => {
    if (!apiKey) return
    
    setCreateModal(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      const api = new ExternalSystemAPI(apiKey)
      const response = await api.createDoctorAccount(accountData)
      
      if (response.success && response.data) {
        // Show success state with account details
        setCreateModal({
          open: true,
          isSubmitting: false,
          createdAccount: {
            documentId: response.data.documentId,
            email: response.data.email,
            apiKey: response.data.apiKey
          }
        })
        
        // Refresh the doctors list to show the new doctor
        await fetchDoctors()
      } else {
        setCreateModal(prev => ({ ...prev, isSubmitting: false }))
        setState(prev => ({
          ...prev,
          error: response.error || 'Failed to create doctor account'
        }))
      }
    } catch (error) {
      setCreateModal(prev => ({ ...prev, isSubmitting: false }))
      setState(prev => ({
        ...prev,
        error: 'Network error. Please try again.'
      }))
    }
  }
  
  const handleCreateCancel = () => {
    setCreateModal({
      open: false,
      isSubmitting: false,
      createdAccount: null
    })
  }
  
  // Selection handlers
  const toggleSelectDoctor = (doctorId: string) => {
    setSelectedDoctors(prev =>
      prev.includes(doctorId)
        ? prev.filter(id => id !== doctorId)
        : [...prev, doctorId]
    )
  }
  
  const toggleSelectAll = () => {
    if (selectedDoctors.length === state.doctors.length) {
      setSelectedDoctors([])
    } else {
      setSelectedDoctors(state.doctors.map(d => d.documentId))
    }
  }
  
  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('doctors.title')}</h2>
        <p className="text-gray-600">
          {t('doctors.description')}
        </p>
      </div>

      {/* API Key Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            {t('doctors.apiKeySection.apiKey')}
          </CardTitle>
          <CardDescription>
            {t('doctors.apiKeySection.enterApiKey')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleApiKeySubmit} className="flex items-end gap-3">
            <div className="flex-1">
              <label htmlFor="api-key" className="block text-sm font-medium text-gray-700 mb-1">
                {t('doctors.apiKeySection.apiKey')}
              </label>
              <div className="relative">
                <input
                  id="api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('doctors.apiKeySection.placeholder')}
                  className={`w-full px-3 py-2 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    apiKeyError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {apiKeyError && (
                <p className="mt-1 text-xs text-red-600">{apiKeyError}</p>
              )}
            </div>
            <Button type="submit" disabled={!apiKey.trim() || state.isLoading}>
              {state.isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t('doctors.apiKeySection.saveKey')}
            </Button>
            {apiKey && (
              <Button type="button" variant="outline" onClick={clearApiKey}>
                {t('doctors.apiKeySection.hide')}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Create Doctor Account Card - only show when API key is provided */}
      {apiKey.trim() && (
        <Card className="border-dashed border-2 border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <UserPlus className="h-5 w-5" />
              {t('doctors.createModal.title')}
            </CardTitle>
            <CardDescription>
              {t('doctors.createModal.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>Create doctor accounts with:</p>
                <ul className="mt-1 list-disc list-inside space-y-1 text-xs">
                  <li>Unique email and secure password</li>
                  <li>Medical specialty assignment</li>
                  <li>Individual API key generation</li>
                  <li>Optional name and branch information</li>
                </ul>
              </div>
              <Button
                onClick={handleCreateDoctor}
                disabled={state.isLoading || createModal.isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {t('doctors.actions.create')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Show content only when API key is provided */}
      {!apiKey.trim() ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <Key className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>{t('doctors.apiKeySection.enterApiKey')}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('doctors.stats.total')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state.total}</div>
                <p className="text-xs text-gray-600">
                  {t('doctors.table.noResults')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('doctors.stats.active')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {state.doctors.filter(d => d.isEnabled).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('doctors.table.active')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">{t('doctors.stats.inactive')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-400">
                  {state.doctors.filter(d => !d.isEnabled).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Actualmente deshabilitados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Doctors Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Lista de Doctores</CardTitle>
                  <CardDescription>
                    Ver y gestionar todos los doctores registrados en el sistema
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fetchDoctors()}
                  disabled={state.isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${state.isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Error Banner */}
              {state.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-700">{state.error}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fetchDoctors()}
                      className="ml-auto"
                    >
                      Retry
                    </Button>
                  </div>
                </div>
              )}

              {/* Filters and Search */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      className="pl-8 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      disabled={state.isLoading}
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={state.isLoading}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  {selectedDoctors.length > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Bulk operations would need modal confirmations for disable
                          // For now, this is disabled to maintain UX consistency
                        }}
                        disabled
                        className="text-green-600"
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Enable ({selectedDoctors.length})
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Bulk operations would need modal confirmations for disable
                          // For now, this is disabled to maintain UX consistency
                        }}
                        disabled
                        className="text-red-600"
                      >
                        <UserX className="h-4 w-4 mr-2" />
                        Disable ({selectedDoctors.length})
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Loading State */}
              {state.isLoading && !state.error && (
                <div className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Loading doctors...</p>
                </div>
              )}

              {/* Empty State */}
              {!state.isLoading && !state.error && state.doctors.length === 0 && (
                <div className="py-12 text-center">
                  <UserX className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-gray-500">No doctors found for the current filters.</p>
                </div>
              )}

              {/* Table */}
              {!state.isLoading && state.doctors.length > 0 && (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">
                            <input
                              type="checkbox"
                              checked={selectedDoctors.length === state.doctors.length && state.doctors.length > 0}
                              onChange={toggleSelectAll}
                              className="rounded border-gray-300"
                            />
                          </TableHead>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Specialties</TableHead>
                          <TableHead>Document ID</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.doctors.map((doctor) => (
                          <TableRow key={doctor.documentId}>
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedDoctors.includes(doctor.documentId)}
                                onChange={() => toggleSelectDoctor(doctor.documentId)}
                                className="rounded border-gray-300"
                              />
                            </TableCell>
                            <TableCell className="font-medium">
                              {doctor.nameFull || '—'}
                            </TableCell>
                            <TableCell>{doctor.email}</TableCell>
                            <TableCell>
                              {doctor.doctorSpecialties?.join(', ') || '—'}
                            </TableCell>
                            <TableCell className="font-mono text-xs text-gray-500">
                              {doctor.documentId}
                            </TableCell>
                            <TableCell>
                              <Badge variant={doctor.isEnabled ? 'default' : 'secondary'}>
                                {doctor.isEnabled ? 'Active' : 'Inactive'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                              {formatDate(doctor.createdAt)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Switch
                                  checked={doctor.isEnabled}
                                  onCheckedChange={() => toggleDoctorStatus(doctor.documentId, doctor.isEnabled)}
                                  disabled={state.isLoading}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Pagination Info */}
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-500">
                    <div>
                      Showing {Math.min((state.page - 1) * state.limit + 1, state.total)} to{' '}
                      {Math.min(state.page * state.limit, state.total)} of {state.total} doctors
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                        disabled={state.page <= 1 || state.isLoading}
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-1 bg-gray-100 rounded text-sm">
                        Page {state.page}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setState(prev => ({ ...prev, page: prev.page + 1 }))}
                        disabled={!state.hasMore || state.isLoading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Disable Reason Modal */}
      <DisableReasonModal
        open={disableModal.open}
        onCancel={handleDisableCancel}
        onConfirm={handleDisableConfirm}
        isSubmitting={disableModal.isSubmitting}
        doctorName={disableModal.doctorName || undefined}
      />
      
      {/* Create Doctor Modal */}
      <CreateDoctorModal
        open={createModal.open}
        onCancel={handleCreateCancel}
        onConfirm={handleCreateConfirm}
        isSubmitting={createModal.isSubmitting}
        createdAccount={createModal.createdAccount}
      />
    </div>
  )
}
