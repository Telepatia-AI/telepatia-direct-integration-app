'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import WorkflowChecklist from '../shared/WorkflowChecklist'
import TelepatiaInterface from '../telepatia/TelepatiaInterface'
import ExternalSystemInterface from '../external-system/ExternalSystemInterface'
import { WorkflowStep, PatientInfo, Session } from '@/app/types'
import { ArrowRight, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'

export default function IntegrationView() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>(WorkflowStep.AUTHENTICATE)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [bearerToken, setBearerToken] = useState('')
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  const handleAuthenticate = () => {
    if (bearerToken.trim() && currentStep === WorkflowStep.AUTHENTICATE) {
      setIsAuthenticated(true)
      setCurrentStep(WorkflowStep.INITIALIZE_CONSULTATION)
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setBearerToken('')
    setCurrentStep(WorkflowStep.AUTHENTICATE)
  }

  const handleSessionCreated = (session: Session) => {
    setSelectedSession(session)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Integration Testing</h2>
          <p className="text-muted-foreground">
            Test the complete workflow between Telepatia and your external system
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          Test Environment
        </Badge>
      </div>

      {/* Workflow Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Workflow Progress</CardTitle>
          <CardDescription>
            Follow these steps to complete the integration test
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WorkflowChecklist currentStep={currentStep} />
        </CardContent>
      </Card>

      {/* Visual Workflow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Data Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <div className={`p-3 rounded-lg ${currentStep <= WorkflowStep.START_RECORDING ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                <span className="font-semibold">External System</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-3 rounded-lg ${currentStep >= WorkflowStep.START_RECORDING && currentStep <= WorkflowStep.CONFIRM_PATIENT ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                <span className="font-semibold">Telepatia</span>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <div className={`p-3 rounded-lg ${currentStep >= WorkflowStep.IMPORT_SCRIBE ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                <span className="font-semibold">Medical Record</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Interface Panels */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Telepatia Panel */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Telepatia Interface</CardTitle>
                <CardDescription>
                  Recording and session management system
                </CardDescription>
              </div>
              {currentStep >= WorkflowStep.START_RECORDING && currentStep <= WorkflowStep.CONFIRM_PATIENT && (
                <Badge variant="default">Active</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              <TelepatiaInterface
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                patientInfo={patientInfo}
                onSessionCreated={handleSessionCreated}
              />
            </div>
          </CardContent>
        </Card>

        {/* External System Panel */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>External System Interface</CardTitle>
                <CardDescription>
                  Your institution&apos;s integration endpoint
                </CardDescription>
              </div>
              {(currentStep === WorkflowStep.AUTHENTICATE || currentStep === WorkflowStep.INITIALIZE_CONSULTATION || currentStep >= WorkflowStep.IMPORT_SCRIBE) && (
                <Badge variant="default">Active</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6">
              <ExternalSystemInterface
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
                patientInfo={patientInfo}
                setPatientInfo={setPatientInfo}
                selectedSession={selectedSession}
                bearerToken={bearerToken}
                setBearerToken={setBearerToken}
                isAuthenticated={isAuthenticated}
                handleAuthenticate={handleAuthenticate}
                handleLogout={handleLogout}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Footer */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {currentStep === WorkflowStep.COMPLETED ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Workflow Completed Successfully</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">Workflow In Progress</span>
                  </>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setCurrentStep(WorkflowStep.AUTHENTICATE)
                setIsAuthenticated(false)
                setBearerToken('')
                setPatientInfo(null)
                setSelectedSession(null)
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset Workflow
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}