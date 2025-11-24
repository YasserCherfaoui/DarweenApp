import { useStore } from '@tanstack/react-store'
import { portalStore } from '@/stores/portal-store'
import { companyStore } from '@/stores/company-store'
import { RoleBadge } from './RoleBadge'
import { Building2, Store } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContextIndicatorProps {
  className?: string
  showIcon?: boolean
  variant?: 'default' | 'compact'
}

export function ContextIndicator({ className, showIcon = true, variant = 'default' }: ContextIndicatorProps) {
  const { selectedPortal } = useStore(portalStore)
  const { selectedCompany } = useStore(companyStore)

  // Use portal if available, otherwise fall back to company
  const context = selectedPortal || (selectedCompany ? {
    type: 'company' as const,
    id: selectedCompany.id,
    name: selectedCompany.name,
    code: selectedCompany.code,
    role: selectedCompany.user_role || null,
  } : null)

  if (!context) {
    return null
  }

  const isCompany = context.type === 'company'
  const Icon = isCompany ? Building2 : Store

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {showIcon && (
        <Icon className={cn(
          'text-muted-foreground',
          variant === 'compact' ? 'h-3.5 w-3.5' : 'h-4 w-4'
        )} />
      )}
      <div className={cn('flex items-center gap-2', variant === 'compact' && 'gap-1.5')}>
        <span className={cn(
          'font-medium text-foreground',
          variant === 'compact' ? 'text-xs' : 'text-sm'
        )}>
          {context.name}
        </span>
        {context.code && (
          <span className={cn(
            'text-muted-foreground',
            variant === 'compact' ? 'text-xs' : 'text-sm'
          )}>
            ({context.code})
          </span>
        )}
        {context.role && (
          <RoleBadge variant={variant} showIcon={false} />
        )}
      </div>
    </div>
  )
}

