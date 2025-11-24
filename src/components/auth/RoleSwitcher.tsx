import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import { setSelectedCompany } from '@/stores/company-store'
import { portalStore, setSelectedPortal } from '@/stores/portal-store'
import type { Portal } from '@/types/api'
import { useNavigate } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { Building2, Check, ChevronDown, Store } from 'lucide-react'
import { useEffect, useState } from 'react'
import { RoleBadge } from './RoleBadge'

interface RoleSwitcherProps {
  className?: string
  variant?: 'default' | 'compact'
}

export function RoleSwitcher({ className, variant = 'default' }: RoleSwitcherProps) {
  const { selectedPortal } = useStore(portalStore)
  const [portals, setPortals] = useState<Portal[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchPortals = async () => {
      try {
        setLoading(true)
        const response = await apiClient.users.getPortals()
        if (response.success && response.data) {
          setPortals(response.data.portals)
        }
      } catch (error) {
        console.error('Failed to fetch portals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPortals()
  }, [])

  const handlePortalSelect = async (portal: Portal) => {
    // Update portal store first
    setSelectedPortal(portal)
    
    // If it's a company portal, also update company store and navigate
    if (portal.type === 'company') {
      try {
        // Fetch company details to update company store
        const response = await apiClient.companies.get(portal.id)
        if (response.success && response.data) {
          setSelectedCompany({
            ...response.data,
            user_role: portal.role,
          })
          
          // Navigate to the company page
          navigate({ 
            to: '/companies/$companyId', 
            params: { companyId: portal.id.toString() } 
          })
        }
      } catch (error) {
        console.error('Failed to fetch company details:', error)
        // Still navigate even if fetch fails
        navigate({ 
          to: '/companies/$companyId', 
          params: { companyId: portal.id.toString() } 
        })
      }
    } else if (portal.type === 'franchise') {
      // For franchises, navigate to franchise POS page (main franchise page)
      navigate({ 
        to: '/franchises/$franchiseId/pos', 
        params: { franchiseId: portal.id.toString() } 
      })
    }
  }

  if (loading) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" />
      </div>
    )
  }

  if (portals.length === 0) {
    return null
  }

  const currentPortal = selectedPortal || portals[0]

  // If only one portal, show it as a simple display (not a dropdown)
  if (portals.length === 1) {
    const portal = portals[0]
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {portal.type === 'company' ? (
          <Building2 className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Store className="h-4 w-4 text-muted-foreground" />
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{portal.name}</span>
          {portal.code && (
            <span className="text-xs text-muted-foreground">({portal.code})</span>
          )}
        </div>
        <RoleBadge variant="compact" />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'flex items-center gap-2 hover:bg-accent transition-colors',
            variant === 'compact' && 'h-8 px-2 text-xs',
            className
          )}
          title={`Switch between ${portals.length} available portals`}
        >
          {currentPortal.type === 'company' ? (
            <Building2 className="h-4 w-4" />
          ) : (
            <Store className="h-4 w-4" />
          )}
          <div className="flex items-center gap-1.5">
            <span className="max-w-[120px] truncate font-medium">
              {currentPortal.name}
            </span>
            {currentPortal.code && (
              <span className="text-xs text-muted-foreground truncate">
                ({currentPortal.code})
              </span>
            )}
          </div>
          <RoleBadge variant="compact" showIcon={false} />
          <ChevronDown className="h-4 w-4 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-sm font-semibold">
          Switch Portal ({portals.length} available)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Company Portals */}
        {portals.filter(p => p.type === 'company').length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Companies
            </DropdownMenuLabel>
            {portals
              .filter((p) => p.type === 'company')
              .map((portal) => (
                <DropdownMenuItem
                  key={`company-${portal.id}`}
                  onClick={() => handlePortalSelect(portal)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{portal.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {portal.role}
                        </Badge>
                      </div>
                      {portal.code && (
                        <p className="text-xs text-muted-foreground truncate">
                          {portal.code}
                        </p>
                      )}
                    </div>
                  </div>
                  {currentPortal?.id === portal.id && currentPortal?.type === portal.type && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            <DropdownMenuSeparator />
          </>
        )}

        {/* Franchise Portals */}
        {portals.filter(p => p.type === 'franchise').length > 0 && (
          <>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Franchises
            </DropdownMenuLabel>
            {portals
              .filter((p) => p.type === 'franchise')
              .map((portal) => (
                <DropdownMenuItem
                  key={`franchise-${portal.id}`}
                  onClick={() => handlePortalSelect(portal)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Store className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{portal.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {portal.role}
                        </Badge>
                      </div>
                      {portal.code && (
                        <p className="text-xs text-muted-foreground truncate">
                          {portal.code}
                        </p>
                      )}
                    </div>
                  </div>
                  {currentPortal?.id === portal.id && currentPortal?.type === portal.type && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

