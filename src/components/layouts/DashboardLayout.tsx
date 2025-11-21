import { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { UserMenu } from './UserMenu'
import { CompanySelector } from './CompanySelector'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { toggleSidebar } from '@/stores/sidebar-store'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardLayoutProps {
  children: ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 h-16 flex items-center justify-between px-6">
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img 
                  src="/SVG/Darween.svg" 
                  alt="Darween Logo" 
                  className="h-8 w-8"
                />
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Darween ERP
                </h1>
              </div>
              <CompanySelector />
            </div>
            <UserMenu />
          </header>
          <main className="flex-1 overflow-y-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}



