import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { usePermissions } from '@/hooks/use-permissions'
import { useUserRole } from '@/hooks/use-user-role'
import type { Permission } from '@/types/api'
import { AlertCircle, Info, Lock } from 'lucide-react'
import type { ReactNode } from 'react'

interface PermissionEmptyStateProps {
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  title?: string
  description?: string
  action?: ReactNode
  showAlternatives?: boolean
}

export function PermissionEmptyState({
  requiredPermission,
  requiredPermissions,
  title = 'Access Restricted',
  description = 'You don\'t have permission to view this content.',
  action,
  showAlternatives = true,
}: PermissionEmptyStateProps) {
  const { role } = useUserRole()
  const { hasPermission, hasAnyPermission } = usePermissions()

  // Check if user has the required permission
  const hasAccess = requiredPermission
    ? hasPermission(requiredPermission)
    : requiredPermissions
    ? hasAnyPermission(...requiredPermissions)
    : false

  // If user has access, don't show empty state
  if (hasAccess) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <Lock className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Permission Required</AlertTitle>
            <AlertDescription className="mt-2">
              {requiredPermission && (
                <p>
                  This feature requires the <strong>{requiredPermission}</strong> permission.
                </p>
              )}
              {requiredPermissions && requiredPermissions.length > 0 && (
                <p>
                  This feature requires one of the following permissions:{' '}
                  {requiredPermissions.join(', ')}
                </p>
              )}
              {role && (
                <p className="mt-2 text-sm">
                  Your current role: <span className="capitalize font-medium">{role}</span>
                </p>
              )}
            </AlertDescription>
          </Alert>

          {showAlternatives && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>What You Can Do</AlertTitle>
              <AlertDescription className="mt-2">
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Contact your administrator to request access</li>
                  <li>Check if you have access in a different context (company/franchise)</li>
                  <li>Review your current permissions in Settings</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {action && <div className="pt-2">{action}</div>}
        </CardContent>
      </Card>
    </div>
  )
}

