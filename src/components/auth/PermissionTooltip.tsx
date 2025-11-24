import { ReactNode } from 'react'
import { usePermissions } from '@/hooks/use-permissions'
import { useUserRole } from '@/hooks/use-user-role'
import type { Permission } from '@/types/api'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Lock, Info } from 'lucide-react'

interface PermissionTooltipProps {
  children: ReactNode
  permission?: Permission
  anyPermission?: Permission[]
  allPermissions?: Permission[]
  mode?: 'and' | 'or'
  showIcon?: boolean
}

// Permission descriptions for better UX
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

// Role hierarchy for upgrade suggestions
const roleHierarchy: Record<string, string[]> = {
  employee: ['manager', 'admin', 'owner'],
  manager: ['admin', 'owner'],
  admin: ['owner'],
  owner: [],
}

export function PermissionTooltip({
  children,
  permission,
  anyPermission,
  allPermissions,
  mode = 'or',
  showIcon = true,
}: PermissionTooltipProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()
  const { role } = useUserRole()

  let hasAccess = true
  let requiredPermissions: Permission[] = []

  if (permission) {
    hasAccess = hasPermission(permission)
    requiredPermissions = [permission]
  } else if (anyPermission && anyPermission.length > 0) {
    if (mode === 'and') {
      hasAccess = hasAllPermissions(...anyPermission)
    } else {
      hasAccess = hasAnyPermission(...anyPermission)
    }
    requiredPermissions = anyPermission
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(...allPermissions)
    requiredPermissions = allPermissions
  }

  // If user has access, don't show tooltip
  if (hasAccess) {
    return <>{children}</>
  }

  // Get permission descriptions
  const permissionTexts = requiredPermissions
    .map((perm) => permissionDescriptions[perm] || perm)
    .join(mode === 'and' ? ' and ' : ' or ')

  // Suggest role upgrade
  const suggestRoleUpgrade = () => {
    if (!role) return null
    const upgradeOptions = roleHierarchy[role] || []
    if (upgradeOptions.length === 0) return null

    return (
      <div className="mt-2 pt-2 border-t">
        <p className="text-xs font-medium mb-1">To access this feature, you need:</p>
        <ul className="text-xs space-y-1">
          {upgradeOptions.map((upgradeRole) => (
            <li key={upgradeRole} className="flex items-center gap-1.5">
              <span className="capitalize font-medium">{upgradeRole}</span>
              <span className="text-muted-foreground">role or higher</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground mt-1.5">
          Contact your administrator to request role upgrade.
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="inline-flex items-center gap-1.5">
            {showIcon && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="top">
          <div className="space-y-1.5">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1">Permission Required</p>
                <p className="text-xs text-muted-foreground">
                  This feature requires: <span className="font-medium">{permissionTexts}</span>
                </p>
              </div>
            </div>
            {suggestRoleUpgrade()}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

