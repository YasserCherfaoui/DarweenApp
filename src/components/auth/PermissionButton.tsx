import { Button, type ButtonProps } from '@/components/ui/button'
import { usePermissions } from '@/hooks/use-permissions'
import { cn } from '@/lib/utils'
import type { Permission } from '@/types/api'
import { Lock } from 'lucide-react'
import type { ReactNode } from 'react'
import { PermissionTooltip } from './PermissionTooltip'

interface PermissionButtonProps extends ButtonProps {
  permission?: Permission
  anyPermission?: Permission[]
  allPermissions?: Permission[]
  mode?: 'and' | 'or' // Mode for anyPermission (default: 'or')
  children: ReactNode
  disabledWhenNoPermission?: boolean // If true, button is disabled instead of hidden
  disabledMessage?: string // Tooltip message when disabled (deprecated, use PermissionTooltip)
  showLockIcon?: boolean // Show lock icon when disabled by permission
}

/**
 * Button component that respects user permissions
 * Can either hide the button or disable it based on permissions
 * Shows enhanced tooltips with permission explanations
 */
export function PermissionButton({
  permission,
  anyPermission,
  allPermissions,
  mode = 'or',
  children,
  disabledWhenNoPermission = false,
  disabledMessage,
  showLockIcon = true,
  className,
  ...props
}: PermissionButtonProps) {
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

  if (!hasAccess && !disabledWhenNoPermission) {
    return null
  }

  const button = (
    <Button
      {...props}
      disabled={!hasAccess || props.disabled}
      className={cn(
        !hasAccess && showLockIcon && 'relative',
        className
      )}
      variant={!hasAccess ? 'outline' : props.variant}
    >
      {!hasAccess && showLockIcon && (
        <Lock className="h-3.5 w-3.5 mr-1.5 opacity-50" />
      )}
      {children}
    </Button>
  )

  // Wrap with tooltip if permission is denied
  if (!hasAccess) {
    return (
      <PermissionTooltip
        permission={permission}
        anyPermission={anyPermission}
        allPermissions={allPermissions}
        mode={mode}
        showIcon={false}
      >
        {button}
      </PermissionTooltip>
    )
  }

  return button
}

