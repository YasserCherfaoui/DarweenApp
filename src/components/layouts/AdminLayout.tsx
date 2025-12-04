import { AdminSidebar } from './AdminSidebar'
import { UserMenu } from './UserMenu'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { Button } from '@/components/ui/button'
import { toggleSidebar } from '@/stores/sidebar-store'
import { Menu } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-background">
        <AdminSidebar />
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
                  Platform Admin
                </h1>
              </div>
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

