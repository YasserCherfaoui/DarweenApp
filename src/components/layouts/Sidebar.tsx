import { Link, useRouterState } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import { portalStore } from '@/stores/portal-store'
import { sidebarStore } from '@/stores/sidebar-store'
import { cn } from '@/lib/utils'
import { 
  Building2, 
  Package, 
  Warehouse, 
  Store, 
  LayoutDashboard,
  Truck,
  ShoppingCart,
  FileText,
  ShoppingBag
} from 'lucide-react'

const globalNavigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Companies', to: '/companies', icon: Building2 },
]

interface NavigationSection {
  title: string
  items: NavigationItem[]
}

interface NavigationItem {
  name: string
  to: string
  icon: any
}

const getCompanyNavigationSections = (companyId: number): NavigationSection[] => [
  {
    title: 'Inventory Management',
    items: [
      { name: 'Products', to: `/companies/${companyId}/products`, icon: Package },
      { name: 'Suppliers', to: `/companies/${companyId}/suppliers`, icon: Truck },
      { name: 'Inventory', to: `/companies/${companyId}/inventory`, icon: Warehouse },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Orders', to: `/companies/${companyId}/orders`, icon: ShoppingBag },
      { name: 'Franchises', to: `/companies/${companyId}/franchises`, icon: Store },
      { name: 'Warehouse Bills', to: `/companies/${companyId}/warehouse-bills`, icon: FileText },
      { name: 'POS', to: `/companies/${companyId}/pos`, icon: ShoppingCart },
    ]
  },
]

const getFranchiseNavigationSections = (franchiseId: number): NavigationSection[] => [
  {
    title: 'Inventory Management',
    items: [
      { name: 'Products', to: `/franchises/${franchiseId}/products`, icon: Package },
      { name: 'Inventory', to: `/franchises/${franchiseId}/inventory`, icon: Warehouse },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Warehouse Bills', to: `/franchises/${franchiseId}/warehouse-bills`, icon: FileText },
      { name: 'POS', to: `/franchises/${franchiseId}/pos`, icon: ShoppingCart },
    ]
  },
]

export function Sidebar() {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const { selectedPortalType, selectedPortalId } = useStore(portalStore)
  const { isCollapsed } = useStore(sidebarStore)

  const companyNavigationSections = 
    selectedPortalType === 'company' && selectedPortalId 
      ? getCompanyNavigationSections(selectedPortalId) 
      : []
  
  const franchiseNavigationSections = 
    selectedPortalType === 'franchise' && selectedPortalId 
      ? getFranchiseNavigationSections(selectedPortalId) 
      : []
  
  const portalNavigationSections = selectedPortalType === 'company' 
    ? companyNavigationSections 
    : franchiseNavigationSections

  return (
    <aside 
      className={cn(
        "bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="h-full flex flex-col">
        <div className={cn("p-6 transition-all", isCollapsed && "p-3")}>
          <div className={cn("flex items-center gap-2", isCollapsed && "justify-center")}>
            <img 
              src="/SVG/Darween.svg" 
              alt="Darween Logo" 
              className={cn("flex-shrink-0 dark:invert", isCollapsed ? "h-8 w-8" : "h-10 w-10")}
            />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-sidebar-foreground">
                  Darween ERP
                </span>
                <span className="text-xs text-muted-foreground">
                  Admin Dashboard
                </span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {/* Global Navigation - Only show Dashboard, hide Companies in franchise portal */}
          {!isCollapsed && (
            <div className="px-3 pb-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Main
              </p>
            </div>
          )}
          {globalNavigation
            .filter((item) => {
              // Hide "Companies" link when in franchise portal
              if (selectedPortalType === 'franchise' && item.name === 'Companies') {
                return false
              }
              return true
            })
            .map((item) => {
            const isActive = currentPath === item.to || 
              (item.to !== '/' && currentPath.startsWith(item.to))
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                to={item.to}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isCollapsed && 'justify-center'
                )}
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && item.name}
              </Link>
            )
          })}
          
          {/* Portal-specific Navigation Sections */}
          {portalNavigationSections.length > 0 && (
            <>
              <div className="pt-4 pb-2 px-3">
                <div className="h-px bg-sidebar-border" />
              </div>
              {portalNavigationSections.map((section) => (
                <div key={section.title} className="mb-4">
                  {!isCollapsed && (
                    <div className="px-3 py-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {section.title}
                      </p>
                    </div>
                  )}
                  {section.items.map((item) => {
                    const isActive = currentPath === item.to || 
                      (item.to !== '/' && currentPath.startsWith(item.to))
                    const Icon = item.icon
                    
                    return (
                      <Link
                        key={item.name}
                        to={item.to}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                          isCollapsed && 'justify-center'
                        )}
                        title={isCollapsed ? item.name : undefined}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {!isCollapsed && item.name}
                      </Link>
                    )
                  })}
                </div>
              ))}
            </>
          )}
        </nav>
      </div>
    </aside>
  )
}

