import { Link, useRouterState } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { companyStore } from '@/stores/company-store'
import { sidebarStore } from '@/stores/sidebar-store'
import { cn } from '@/lib/utils'
import { 
  ShoppingCart,
  Receipt,
  Users,
  DollarSign,
  LayoutDashboard,
} from 'lucide-react'

const getPOSNavigation = (companyId: number) => [
  { 
    name: 'POS Dashboard', 
    to: `/companies/${companyId}/pos`, 
    icon: LayoutDashboard,
    exact: true 
  },
  { 
    name: 'New Sale', 
    to: `/companies/${companyId}/pos/sales/new`, 
    icon: ShoppingCart 
  },
  { 
    name: 'Sales History', 
    to: `/companies/${companyId}/pos/sales`, 
    icon: Receipt 
  },
  { 
    name: 'Customers', 
    to: `/companies/${companyId}/pos/customers`, 
    icon: Users 
  },
  { 
    name: 'Cash Drawer', 
    to: `/companies/${companyId}/pos/cash-drawer`, 
    icon: DollarSign 
  },
]

export function POSSidebar() {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const { selectedCompanyId, selectedCompany } = useStore(companyStore)
  const { isCollapsed } = useStore(sidebarStore)

  const posNavigation = selectedCompanyId ? getPOSNavigation(selectedCompanyId) : []

  return (
    <aside 
      className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-full flex flex-col">
        <div className={cn("p-6 transition-all", isCollapsed && "p-3")}>
          <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
            <img 
              src="/SVG/Darween.svg" 
              alt="Darween Logo" 
              className={cn("flex-shrink-0", isCollapsed ? "h-8 w-8" : "h-10 w-10")}
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  POS System
                </span>
                {selectedCompany && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {selectedCompany.name}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sales & Operations
              </p>
            </div>
          )}
          
          {posNavigation.map((item) => {
            const isActive = item.exact 
              ? currentPath === item.to
              : currentPath === item.to || currentPath.startsWith(item.to + '/')
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && item.name}
              </Link>
            )
          })}
        </nav>
        
        {/* Footer info for POS users */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p className="font-semibold mb-1">Quick Tips</p>
              <ul className="space-y-1">
                <li>• Press F2 for new sale</li>
                <li>• Press F3 for customer search</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}


