import { PortalSelectionScreen } from '@/components/auth/PortalSelectionScreen'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleSwitcher } from '@/components/auth/RoleSwitcher'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { useUserPortals } from '@/hooks/queries/use-portals'
import { portalStore } from '@/stores/portal-store'
import { toggleSidebar } from '@/stores/sidebar-store'
import { useStore } from '@tanstack/react-store'
import { Menu } from 'lucide-react'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { UserMenu } from './UserMenu'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { selectedPortal } = useStore(portalStore)
  const { data: portalsData } = useUserPortals()
  
  const portals = portalsData?.portals || []
  const hasMultiplePortals = portals.length > 1
  const shouldShowSelectionScreen = hasMultiplePortals && !selectedPortal

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



