import { ReactNode, useEffect } from 'react'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { authStore } from '@/stores/auth-store'
import { companyStore } from '@/stores/company-store'
import { useUserRole } from '@/hooks/use-user-role'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdminAccess?: boolean // If true, only owner/admin can access
  requireManagerAccess?: boolean // If true, owner/admin/manager can access
}

/**
 * Routes that are admin-only (employees should not access)
 */
const isAdminOnlyRoute = (path: string): boolean => {
  const adminRoutes = [
    '/companies/create',
    '/companies/',
    '/products',
    '/suppliers',
    '/franchises',
    '/inventory',
  ]
  
  // Check if path includes any admin route pattern
  return adminRoutes.some(route => {
    if (route === '/companies/' && path.startsWith('/companies/') && !path.includes('/pos')) {
      // Allow /companies/:id/pos but not other company management pages
      const pathAfterCompanyId = path.split('/').slice(3)
      return pathAfterCompanyId[0] !== 'pos'
    }
    return path.includes(route)
  })
}

export function ProtectedRoute({ 
  children, 
  requireAdminAccess = false,
  requireManagerAccess = false 
}: ProtectedRouteProps) {
  const { isAuthenticated } = useStore(authStore)
  const { selectedCompanyId } = useStore(companyStore)
  const { isPOSUser, hasAdminAccess, hasManagerAccess } = useUserRole()
  const navigate = useNavigate()
  const router = useRouterState()
  const currentPath = router.location.pathname

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' })
      return
    }

    // Redirect employees trying to access admin-only routes
    if (isPOSUser && isAdminOnlyRoute(currentPath)) {
      if (selectedCompanyId) {
        navigate({ to: '/companies/$companyId/pos', params: { companyId: selectedCompanyId.toString() } })
      } else {
        navigate({ to: '/companies' })
      }
      return
    }

    // Check specific route requirements
    if (requireAdminAccess && !hasAdminAccess) {
      if (selectedCompanyId) {
        navigate({ to: '/companies/$companyId/pos', params: { companyId: selectedCompanyId.toString() } })
      }
      return
    }

    if (requireManagerAccess && !hasManagerAccess) {
      if (selectedCompanyId) {
        navigate({ to: '/companies/$companyId/pos', params: { companyId: selectedCompanyId.toString() } })
      }
      return
    }
  }, [isAuthenticated, isPOSUser, hasAdminAccess, hasManagerAccess, currentPath, selectedCompanyId, navigate, requireAdminAccess, requireManagerAccess])

  if (!isAuthenticated) {
    return null
  }

  // Show access denied for users without proper permissions
  if (requireAdminAccess && !hasAdminAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            You don't have permission to access this page. This feature is only available to administrators.
            <div className="mt-4">
              <Button 
                onClick={() => selectedCompanyId && navigate({ to: '/companies/$companyId/pos', params: { companyId: selectedCompanyId.toString() } })}
                variant="outline"
              >
                Go to POS Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (requireManagerAccess && !hasManagerAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            You don't have permission to access this page. This feature requires manager access or higher.
            <div className="mt-4">
              <Button 
                onClick={() => selectedCompanyId && navigate({ to: '/companies/$companyId/pos', params: { companyId: selectedCompanyId.toString() } })}
                variant="outline"
              >
                Go to POS Dashboard
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
}



