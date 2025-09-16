'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Users, CheckCircle, AlertCircle, TrendingUp, Clock } from 'lucide-react'

interface DashboardMetrics {
  activeDoctors: number
  consultationsToday: number
  consultationsWeek: number
  consultationsMonth: number
  systemStatus: 'healthy' | 'warning' | 'error'
  successRate: number
  averageResponseTime: number
}

export default function DashboardView() {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeDoctors: 12,
    consultationsToday: 45,
    consultationsWeek: 312,
    consultationsMonth: 1248,
    systemStatus: 'healthy',
    successRate: 98.5,
    averageResponseTime: 1.2
  })

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, doctor: 'Dr. Smith', action: 'Completed consultation', time: '2 min ago', status: 'success' },
    { id: 2, doctor: 'Dr. Johnson', action: 'Started consultation', time: '5 min ago', status: 'active' },
    { id: 3, doctor: 'Dr. Williams', action: 'Failed authentication', time: '10 min ago', status: 'error' },
    { id: 4, doctor: 'Dr. Brown', action: 'Completed consultation', time: '15 min ago', status: 'success' },
    { id: 5, doctor: 'Dr. Garcia', action: 'Started consultation', time: '20 min ago', status: 'active' },
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor your Telepatia integration performance and system health
        </p>
      </div>

      {/* System Status Banner */}
      <Card className={`border-l-4 ${
        metrics.systemStatus === 'healthy' ? 'border-l-green-500' :
        metrics.systemStatus === 'warning' ? 'border-l-yellow-500' :
        'border-l-red-500'
      }`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">System Status</CardTitle>
            <Badge variant={
              metrics.systemStatus === 'healthy' ? 'success' :
              metrics.systemStatus === 'warning' ? 'warning' :
              'destructive'
            }>
              {metrics.systemStatus === 'healthy' ? 'All Systems Operational' :
               metrics.systemStatus === 'warning' ? 'Performance Degraded' :
               'System Issues Detected'}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeDoctors}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Consultations Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.consultationsToday}</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.averageResponseTime}s</div>
            <p className="text-xs text-muted-foreground">
              API performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Consultation Volume</CardTitle>
            <CardDescription>
              Track consultation trends over different time periods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">This Week</p>
                  <p className="text-2xl font-bold">{metrics.consultationsWeek}</p>
                </div>
                <Badge variant="success" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +8.2%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">This Month</p>
                  <p className="text-2xl font-bold">{metrics.consultationsMonth}</p>
                </div>
                <Badge variant="success" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +15.3%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest system events and doctor activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.doctor}</p>
                    <p className="text-xs text-muted-foreground">{activity.action}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    {activity.status === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.status === 'active' && <Activity className="h-4 w-4 text-blue-500" />}
                    {activity.status === 'error' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}