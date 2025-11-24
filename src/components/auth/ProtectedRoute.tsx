import { usePermissions } from '@/hooks/use-permissions'
import { useUserRole } from '@/hooks/use-user-role'
import { authStore } from '@/stores/auth-store'
import { companyStore } from '@/stores/company-store'
import type { Permission } from '@/types/api'
import { useNavigate, useRouterState } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { ReactNode, useEffect } from 'react'
import { PermissionError } from './PermissionError'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdminAccess?: boolean // If true, only owner/admin can access
  requireManagerAccess?: boolean // If true, owner/admin/manager can access
  requirePermission?: Permission // Single permission required
  requireAnyPermission?: Permission[] // User must have at least one of these permissions
  requireAllPermissions?: Permission[] // User must have all of these permissions
  permissionMode?: 'and' | 'or' // Mode for requireAnyPermission (default: 'or')
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
  requireManagerAccess = false,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  permissionMode = 'or'
}: ProtectedRouteProps) {
  const { isAuthenticated } = useStore(authStore)
  const { selectedCompanyId } = useStore(companyStore)
  const { isPOSUser, hasAdminAccess, hasManagerAccess } = useUserRole()
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()
  const navigate = useNavigate()
  const router = useRouterState()
  const currentPath = router.location.pathname

  // Check permission requirements
  const hasRequiredPermission = (): boolean => {
    if (requirePermission) {
      return hasPermission(requirePermission)
    }
    
    if (requireAnyPermission && requireAnyPermission.length > 0) {
      if (permissionMode === 'and') {
        return hasAllPermissions(...requireAnyPermission)
      }
      return hasAnyPermission(...requireAnyPermission)
    }
    
    if (requireAllPermissions && requireAllPermissions.length > 0) {
      return hasAllPermissions(...requireAllPermissions)
    }
    
    return true // No permission requirement
  }

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

    // Check permission requirements
    if (!hasRequiredPermission()) {
      if (selectedCompanyId) {
        navigate({ to: '/companies/$companyId/pos', params: { companyId: selectedCompanyId.toString() } })
      } else {
        navigate({ to: '/companies' })
      }
      return
    }
  }, [isAuthenticated, isPOSUser, hasAdminAccess, hasManagerAccess, currentPath, selectedCompanyId, navigate, requireAdminAccess, requireManagerAccess, requirePermission, requireAnyPermission, requireAllPermissions, permissionMode, hasRequiredPermission])

  if (!isAuthenticated) {
    return null
  }

  // Show access denied for users without proper permissions
  if (requireAdminAccess && !hasAdminAccess) {
    return (
      <PermissionError
        requiredRole="admin"
        title="Administrator Access Required"
        message="This page is only available to administrators and owners."
        onGoBack={() => {
          if (selectedCompanyId) {
            navigate({ to: '/companies/$companyId/pos', params: { companyId: selectedCompanyId.toString() } })
          } else {
            navigate({ to: '/companies' })
          }
        }}
      />
    )
  }

  if (requireManagerAccess && !hasManagerAccess) {
    return (
      <PermissionError
        requiredRole="manager"
        title="Manager Access Required"
        message="This page requires manager access or higher."
        onGoBack={() => {
          if (selectedCompanyId) {
            navigate({ to: '/companies/$companyId/pos', params: { companyId: selectedCompanyId.toString() } })
          } else {
            navigate({ to: '/companies' })
          }
        }}
      />
    )
  }

  // Check permission requirements
  if (!hasRequiredPermission()) {
    return (
      <PermissionError
        requiredPermission={requirePermission}
        requiredPermissions={requireAnyPermission || requireAllPermissions}
        title="Permission Required"
        message="You don't have the required permissions to access this page."
        onGoBack={() => {
          if (selectedCompanyId) {
            navigate({ to: '/companies/$companyId/pos', params: { companyId: selectedCompanyId.toString() } })
          } else {
            navigate({ to: '/companies' })
          }
        }}
      />
    )
  }

  return <>{children}</>
}



