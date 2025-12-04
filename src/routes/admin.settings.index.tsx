import { createRoute } from '@tanstack/react-router'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { rootRoute } from '@/main'
import { useAdminSystemSettings, useUpdateAdminSystemSettings } from '@/hooks/queries/use-admin'
import { Skeleton } from '@/components/ui/skeleton'
import { useState, useEffect } from 'react'

export const AdminSettingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/settings',
  component: AdminSettingsPage,
})

function AdminSettingsPage() {
  const { data: settings, isLoading } = useAdminSystemSettings()
  const updateSettings = useUpdateAdminSystemSettings()
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [maxUsers, setMaxUsers] = useState(1000)
  const [features, setFeatures] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (settings) {
      setMaintenanceMode(settings.maintenance_mode)
      setMaxUsers(settings.max_users_per_company)
      setFeatures(settings.features_enabled || {})
    }
  }, [settings])

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        maintenance_mode: maintenanceMode,
        max_users_per_company: maxUsers,
        features_enabled: features,
      })
    } catch (error) {
      // Error handled by mutation
    }
  }

  const toggleFeature = (feature: string) => {
    setFeatures(prev => ({
      ...prev,
      [feature]: !prev[feature],
    }))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Configure platform-wide settings
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Platform-wide configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                    <p className="text-sm text-gray-500">
                      Enable maintenance mode to temporarily disable the platform
                    </p>
                  </div>
                  <Switch
                    id="maintenance-mode"
                    checked={maintenanceMode}
                    onCheckedChange={setMaintenanceMode}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-users">Max Users Per Company</Label>
                  <Input
                    id="max-users"
                    type="number"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(parseInt(e.target.value, 10) || 0)}
                    min={1}
                  />
                  <p className="text-sm text-gray-500">
                    Maximum number of users allowed per company
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feature Flags</CardTitle>
                <CardDescription>Enable or disable platform features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(features).map(([feature, enabled]) => (
                  <div key={feature} className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor={`feature-${feature}`} className="capitalize">
                        {feature.replace('_', ' ')}
                      </Label>
                      <p className="text-sm text-gray-500">
                        {enabled ? 'Feature is enabled' : 'Feature is disabled'}
                      </p>
                    </div>
                    <Switch
                      id={`feature-${feature}`}
                      checked={enabled}
                      onCheckedChange={() => toggleFeature(feature)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={handleSave} disabled={updateSettings.isPending}>
                {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}



