import { useUserRole } from '@/hooks/use-user-role'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Crown, Shield, UserCog, User } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RoleBadgeProps {
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'compact'
}

const roleConfig = {
  owner: {
    label: 'Owner',
    icon: Crown,
    color: 'bg-purple-600 hover:bg-purple-700 text-white border-purple-500',
    description: 'Full system access with all permissions',
    capabilities: [
      'Manage all company settings',
      'Manage users and roles',
      'Manage subscriptions',
      'Full access to all features',
    ],
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    color: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-500',
    description: 'Administrative access with most permissions',
    capabilities: [
      'Manage company settings',
      'Manage users and roles',
      'Access all operational features',
      'Cannot manage subscriptions',
    ],
  },
  manager: {
    label: 'Manager',
    icon: UserCog,
    color: 'bg-green-600 hover:bg-green-700 text-white border-green-500',
    description: 'Operational management with limited administrative access',
    capabilities: [
      'Manage products and inventory',
      'Access POS and sales features',
      'View reports and analytics',
      'Cannot manage users or company settings',
    ],
  },
  employee: {
    label: 'Employee',
    icon: User,
    color: 'bg-gray-600 hover:bg-gray-700 text-white border-gray-500',
    description: 'POS-focused access for daily operations',
    capabilities: [
      'Process sales and transactions',
      'Manage customers',
      'Access cash drawer',
      'View products and inventory (read-only)',
    ],
  },
}

export function RoleBadge({ className, showIcon = true, variant = 'default' }: RoleBadgeProps) {
  const { role } = useUserRole()

  if (!role) {
    return null
  }

  const config = roleConfig[role]
  const Icon = config.icon

  const badgeContent = (
    <Badge
      className={cn(
        'inline-flex items-center gap-1.5 border font-medium',
        config.color,
        variant === 'compact' && 'text-xs px-2 py-0.5',
        variant === 'default' && 'text-sm px-2.5 py-1',
        className
      )}
    >
      {showIcon && <Icon className="h-3.5 w-3.5" />}
      <span>{config.label}</span>
    </Badge>
  )

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badgeContent}
        </TooltipTrigger>
        <TooltipContent className="max-w-xs" side="bottom">
          <div className="space-y-2">
            <div>
              <p className="font-semibold text-sm">{config.label}</p>
              <p className="text-xs text-muted-foreground">{config.description}</p>
            </div>
            <div className="border-t pt-2">
              <p className="text-xs font-medium mb-1.5">Key Capabilities:</p>
              <ul className="text-xs space-y-1 text-muted-foreground">
                {config.capabilities.map((capability, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{capability}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

