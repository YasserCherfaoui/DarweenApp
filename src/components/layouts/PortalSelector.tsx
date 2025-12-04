import { useStore } from '@tanstack/react-store'
import { portalStore, setSelectedPortal, clearSelectedPortal } from '@/stores/portal-store'
import { useUserPortals } from '@/hooks/queries/use-portals'
import { useNavigate } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Building2, Store, Check, ChevronDown, X } from 'lucide-react'
import type { Portal } from '@/types/api'

export function PortalSelector() {
  const navigate = useNavigate()
  const { selectedPortal } = useStore(portalStore)
  const { data: portalsData, isLoading } = useUserPortals()

  const portals = portalsData?.portals || []
  const companies = portals.filter((p) => p.type === 'company')
  const franchises = portals.filter((p) => p.type === 'franchise')

  const handleSelectPortal = (portal: Portal) => {
    setSelectedPortal(portal)
    // Navigate to appropriate dashboard based on portal type
    if (portal.type === 'franchise') {
      navigate({ to: `/franchises/${portal.id}` as any })
    } else {
      navigate({ to: '/companies' })
    }
  }

  const handleClearSelection = () => {
    clearSelectedPortal()
  }

  const getPortalIcon = (type: string) => {
    return type === 'company' ? Building2 : Store
  }

  const getPortalLabel = (portal: Portal) => {
    if (portal.type === 'franchise') {
      return `${portal.name} (Franchise)`
    }
    return portal.name
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 min-w-[200px] justify-between"
        >
          <div className="flex items-center gap-2">
            {selectedPortal ? (
              <>
                {(() => {
                  const Icon = getPortalIcon(selectedPortal.type)
                  return <Icon className="h-4 w-4" />
                })()}
                <span className="truncate">{getPortalLabel(selectedPortal)}</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span className="truncate">Select Portal</span>
              </>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[280px]">
        <DropdownMenuLabel>Select Portal</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <DropdownMenuItem disabled>Loading portals...</DropdownMenuItem>
        ) : portals.length > 0 ? (
          <>
            {companies.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Companies
                </DropdownMenuLabel>
                {companies.map((portal) => {
                  const Icon = getPortalIcon(portal.type)
                  return (
                    <DropdownMenuItem
                      key={`company-${portal.id}`}
                      onClick={() => handleSelectPortal(portal)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col flex-1">
                          <span className="font-medium">{portal.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {portal.code} • {portal.role}
                          </span>
                        </div>
                      </div>
                      {selectedPortal?.id === portal.id && selectedPortal?.type === portal.type && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  )
                })}
                {franchises.length > 0 && <DropdownMenuSeparator />}
              </>
            )}
            {franchises.length > 0 && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Franchises
                </DropdownMenuLabel>
                {franchises.map((portal) => {
                  const Icon = getPortalIcon(portal.type)
                  return (
                    <DropdownMenuItem
                      key={`franchise-${portal.id}`}
                      onClick={() => handleSelectPortal(portal)}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col flex-1">
                          <span className="font-medium">{portal.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {portal.code} • {portal.role}
                          </span>
                        </div>
                      </div>
                      {selectedPortal?.id === portal.id && selectedPortal?.type === portal.type && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </DropdownMenuItem>
                  )
                })}
              </>
            )}
            {selectedPortal && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleClearSelection}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <X className="mr-2 h-4 w-4" />
                  Clear Selection
                </DropdownMenuItem>
              </>
            )}
          </>
        ) : (
          <DropdownMenuItem disabled>No portals available</DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


