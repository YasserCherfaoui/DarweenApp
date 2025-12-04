import { useNavigate } from '@tanstack/react-router'
import { useUserPortals } from '@/hooks/queries/use-portals'
import { setSelectedPortal } from '@/stores/portal-store'
import { Building2, Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { Portal } from '@/types/api'

export function PortalSelectionScreen() {
  const navigate = useNavigate()
  const { data: portalsData, isLoading } = useUserPortals()

  const portals = portalsData?.portals || []
  const companies = portals.filter((p) => p.type === 'company')
  const franchises = portals.filter((p) => p.type === 'franchise')

  const handleSelectPortal = (portal: Portal) => {
    setSelectedPortal(portal)
    // Navigate to appropriate dashboard based on portal type
    if (portal.type === 'franchise') {
      navigate({ to: `/franchises/${portal.id}` })
    } else {
      navigate({ to: '/companies' })
    }
  }

  const getPortalIcon = (type: string) => {
    return type === 'company' ? Building2 : Store
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'manager':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'employee':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading portals...</p>
        </div>
      </div>
    )
  }

  if (portals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>No Portals Available</CardTitle>
            <CardDescription>
              You don't have access to any companies or franchises yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Select a Portal
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Choose a company or franchise to access
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companies.map((portal) => {
            const Icon = getPortalIcon(portal.type)
            return (
              <Card
                key={`company-${portal.id}`}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectPortal(portal)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{portal.name}</CardTitle>
                        <CardDescription>{portal.code}</CardDescription>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                        portal.role
                      )}`}
                    >
                      {portal.role}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Company Portal</span>
                    <Button variant="outline" size="sm">
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {franchises.map((portal) => {
            const Icon = getPortalIcon(portal.type)
            return (
              <Card
                key={`franchise-${portal.id}`}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleSelectPortal(portal)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <Icon className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{portal.name}</CardTitle>
                        <CardDescription>{portal.code}</CardDescription>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                        portal.role
                      )}`}
                    >
                      {portal.role}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Franchise Portal</span>
                    <Button variant="outline" size="sm">
                      Select
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}


