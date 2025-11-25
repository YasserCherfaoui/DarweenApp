import { ReactNode } from 'react'
import { POSSidebar } from './POSSidebar'
import { UserMenu } from './UserMenu'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { toggleSidebar } from '@/stores/sidebar-store'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStore } from '@tanstack/react-store'
import { companyStore } from '@/stores/company-store'

interface POSLayoutProps {
  children: ReactNode
}

export function POSLayout({ children }: POSLayoutProps) {
  const { selectedCompany } = useStore(companyStore)

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <POSSidebar />
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
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Point of Sale
                  </h1>
                  {selectedCompany && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedCompany.name}
                    </p>
                  )}
                </div>
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


