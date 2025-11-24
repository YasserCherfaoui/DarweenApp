import { useUserRole } from '@/hooks/use-user-role'
import { usePermissions } from '@/hooks/use-permissions'
import type { Permission } from '@/types/api'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle, Lock, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PermissionErrorProps {
  requiredPermission?: Permission
  requiredPermissions?: Permission[]
  requiredRole?: 'owner' | 'admin' | 'manager'
  title?: string
  message?: string
  showAlternatives?: boolean
  onGoBack?: () => void
}

// Permission descriptions
const permissionDescriptions: Record<Permission, string> = {
  'companies.create': 'Create new companies',
  'companies.update': 'Modify company settings',
  'companies.delete': 'Delete companies',
  'companies.view': 'View company information',
  'companies.manage_users': 'Add, remove, and manage company users',
  'products.create': 'Create new products',
  'products.update': 'Modify product information',
  'products.delete': 'Delete products',
  'products.view': 'View product information',
  'inventory.read': 'View inventory levels',
  'inventory.write': 'Update inventory levels',
  'inventory.adjust': 'Make inventory adjustments',
  'pos.sales.create': 'Create new sales transactions',
  'pos.sales.view': 'View sales history',
  'pos.refund': 'Process refunds',
  'pos.cash_drawer': 'Manage cash drawer operations',
  'pos.customers': 'Manage customer information',
  'pos.reports': 'View POS reports and analytics',
  'suppliers.create': 'Add new suppliers',
  'suppliers.update': 'Modify supplier information',
  'suppliers.delete': 'Remove suppliers',
  'suppliers.view': 'View supplier information',
  'franchises.create': 'Create new franchises',
  'franchises.update': 'Modify franchise settings',
  'franchises.delete': 'Delete franchises',
  'franchises.view': 'View franchise information',
  'franchises.manage_users': 'Manage franchise users',
  'warehouse_bills.create': 'Create warehouse bills',
  'warehouse_bills.update': 'Modify warehouse bills',
  'warehouse_bills.delete': 'Cancel warehouse bills',
  'warehouse_bills.view': 'View warehouse bills',
  'warehouse_bills.complete': 'Complete warehouse bills',
  'settings.view': 'View system settings',
  'settings.update': 'Modify system settings',
  'settings.subscription': 'Manage subscription plans',
  'settings.smtp': 'Configure email settings',
  'emails.send': 'Send emails',
  'subscription.view': 'View subscription information',
  'subscription.update': 'Update subscription plans',
  'users.view': 'View user information',
  'users.update': 'Modify user information',
}

// Role hierarchy for suggestions
const roleHierarchy: Record<string, { next: string[]; description: string }> = {
  employee: {
    next: ['manager', 'admin', 'owner'],
    description: 'POS-focused access for daily operations',
  },
  manager: {
    next: ['admin', 'owner'],
    description: 'Operational management with limited administrative access',
  },
  admin: {
    next: ['owner'],
    description: 'Administrative access with most permissions',
  },
  owner: {
    next: [],
    description: 'Full system access with all permissions',
  },
}

export function PermissionError({
  requiredPermission,
  requiredPermissions,
  requiredRole,
  title,
  message,
  showAlternatives = true,
  onGoBack,
}: PermissionErrorProps) {
  const { role } = useUserRole()
  const { hasPermission } = usePermissions()

  // Get permission text
  const getPermissionText = () => {
    if (requiredPermission) {
      return permissionDescriptions[requiredPermission] || requiredPermission
    }
    if (requiredPermissions && requiredPermissions.length > 0) {
      return requiredPermissions
        .map((p) => permissionDescriptions[p] || p)
        .join(', ')
    }
    return null
  }

  const permissionText = getPermissionText()

  // Get role upgrade suggestions
  const getRoleSuggestions = () => {
    if (!role || !requiredRole) return null
    const roleInfo = roleHierarchy[role]
    if (!roleInfo || roleInfo.next.length === 0) return null

    // Check if user needs to upgrade
    const roleLevels = { employee: 1, manager: 2, admin: 3, owner: 4 }
    const userLevel = roleLevels[role as keyof typeof roleLevels] || 0
    const requiredLevel = roleLevels[requiredRole] || 0

    if (userLevel >= requiredLevel) return null

    return roleInfo.next.filter((nextRole) => {
      const nextLevel = roleLevels[nextRole as keyof typeof roleLevels] || 0
      return nextLevel >= requiredLevel
    })
  }

  const roleSuggestions = getRoleSuggestions()

  // Get alternative actions based on role
  const getAlternativeActions = () => {
    if (!role) return []
    const actions: string[] = []

    if (role === 'employee') {
      actions.push('Access POS features for sales and transactions')
      actions.push('View products and inventory (read-only)')
      actions.push('Manage customers')
    } else if (role === 'manager') {
      actions.push('Manage products and inventory')
      actions.push('Access POS and sales features')
      actions.push('View reports and analytics')
    } else if (role === 'admin') {
      actions.push('Manage company settings')
      actions.push('Manage users and roles')
      actions.push('Access all operational features')
    }

    return actions
  }

  const alternativeActions = showAlternatives ? getAlternativeActions() : []

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/10">
              <Lock className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {title || 'Access Denied'}
              </CardTitle>
              <CardDescription>
                {message || 'You don\'t have permission to access this resource'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Permission Requirements */}
          {(permissionText || requiredRole) && (
            <Alert>
              <HelpCircle className="h-4 w-4" />
              <AlertTitle>What's Required</AlertTitle>
              <AlertDescription className="mt-2">
                {permissionText && (
                  <p className="mb-2">
                    <strong>Permission needed:</strong> {permissionText}
                  </p>
                )}
                {requiredRole && (
                  <p>
                    <strong>Role required:</strong>{' '}
                    <span className="capitalize font-medium">{requiredRole}</span> or higher
                  </p>
                )}
                {role && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Your current role: <span className="capitalize font-medium">{role}</span>
                  </p>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Role Upgrade Suggestions */}
          {roleSuggestions && roleSuggestions.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>To Access This Feature</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">You need one of the following roles:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {roleSuggestions.map((suggestedRole) => (
                    <li key={suggestedRole} className="capitalize">
                      <strong>{suggestedRole}</strong> -{' '}
                      {roleHierarchy[suggestedRole]?.description}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm">
                  Contact your administrator to request a role upgrade.
                </p>
              </AlertDescription>
            </Alert>
          )}

          {/* Alternative Actions */}
          {alternativeActions.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>What You Can Do</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-2">Based on your current role, you can:</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {alternativeActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {onGoBack && (
              <Button onClick={onGoBack} variant="outline" className="flex-1">
                Go Back
              </Button>
            )}
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                // Navigate to help or contact page if available
                window.location.href = '/help'
              }}
            >
              Get Help
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

