import { PortalSelectionScreen } from '@/components/auth/PortalSelectionScreen'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleSwitcher } from '@/components/auth/RoleSwitcher'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { useUserPortals } from '@/hooks/queries/use-portals'
import { portalStore, setSelectedPortal } from '@/stores/portal-store'
import { toggleSidebar } from '@/stores/sidebar-store'
import { useStore } from '@tanstack/react-store'
import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { Sidebar } from './Sidebar'
import { UserMenu } from './UserMenu'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { selectedPortal } = useStore(portalStore)
  const { data: portalsData, isLoading: portalsLoading } = useUserPortals()
  
  const portals = portalsData?.portals || []
  const hasMultiplePortals = portals.length > 1
  const shouldShowSelectionScreen = hasMultiplePortals && !selectedPortal

  // Auto-select portal when there's only one available
  // Also re-select if the current selection doesn't match available portals (handles stale localStorage)
  useEffect(() => {
    if (portalsLoading || portals.length === 0) {
      return
    }

    // If there's only one portal, always select it (handles both new selection and stale data)
    if (portals.length === 1) {
      const singlePortal = portals[0]
      // Check if we need to update: no selection, wrong ID, or wrong type
      const needsUpdate = !selectedPortal || 
                         selectedPortal.id !== singlePortal.id || 
                         selectedPortal.type !== singlePortal.type
      
      if (needsUpdate) {
        setSelectedPortal(singlePortal)
      }
    } else if (portals.length > 1 && selectedPortal) {
      // If multiple portals exist, verify the selected one is still valid
      const isValidSelection = portals.some(p => p.id === selectedPortal.id && p.type === selectedPortal.type)
      if (!isValidSelection) {
        // Selected portal is no longer available, clear selection to show selection screen
        // This is handled by shouldShowSelectionScreen logic
      }
    }
  }, [portals, selectedPortal, portalsLoading])

  // Show portal selection screen if user has multiple portals and none selected
  if (shouldShowSelectionScreen) {
    return (
      <ProtectedRoute>
        <PortalSelectionScreen />
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-card border-b border-border h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img 
                  src="/SVG/Darween.svg" 
                  alt="Darween Logo" 
                  className="h-8 w-8 dark:invert"
                />
                <h1 className="text-xl font-semibold text-foreground">
                  Darween ERP
                </h1>
              </div>
              <RoleSwitcher />
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}



