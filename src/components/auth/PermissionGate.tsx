import { usePermissions } from '@/hooks/use-permissions'
import type { Permission } from '@/types/api'
import type { ReactNode } from 'react'

interface PermissionGateProps {
  children: ReactNode
  permission?: Permission
  anyPermission?: Permission[]
  allPermissions?: Permission[]
  mode?: 'and' | 'or' // Mode for anyPermission (default: 'or')
  fallback?: ReactNode // What to render if permission is denied
  showFallback?: boolean // Whether to show fallback or nothing
}

/**
 * Component that conditionally renders children based on user permissions
 */
export function PermissionGate({
  children,
  permission,
  anyPermission,
  allPermissions,
  mode = 'or',
  fallback = null,
  showFallback = false,
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  let hasAccess = true

  if (permission) {
    hasAccess = hasPermission(permission)
  } else if (anyPermission && anyPermission.length > 0) {
    if (mode === 'and') {
      hasAccess = hasAllPermissions(...anyPermission)
    } else {
      hasAccess = hasAnyPermission(...anyPermission)
    }
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(...allPermissions)
  }

  if (hasAccess) {
    return <>{children}</>
  }

  if (showFallback) {
    return <>{fallback}</>
  }

  return null
}

