'use client'

import { useState } from 'react'
import Header from './components/shared/Header'
import LanguageSwitcher from './components/shared/LanguageSwitcher'
import IntegrationView from './components/integration/IntegrationView'
import DoctorsManagement from './components/doctors/DoctorsManagement'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, TestTube2 } from 'lucide-react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('integration')

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with warning */}
      <Header />

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex items-center justify-between">
            <TabsList className="grid w-fit grid-cols-2 gap-4">
              <TabsTrigger value="integration" className="flex items-center gap-2">
                <TestTube2 className="h-4 w-4" />
                Prueba de Integración
              </TabsTrigger>
              <TabsTrigger value="doctors" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Gestión de Doctores
              </TabsTrigger>
            </TabsList>
            <LanguageSwitcher />
          </div>

          {/* Tab Content */}
          <TabsContent value="integration" className="space-y-6">
            <IntegrationView />
          </TabsContent>

          <TabsContent value="doctors" className="space-y-6">
            <DoctorsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}