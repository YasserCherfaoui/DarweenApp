import { cn } from '@/lib/utils'
import { sidebarStore } from '@/stores/sidebar-store'
import { Link, useRouterState } from '@tanstack/react-router'
import { useStore } from '@tanstack/react-store'
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Settings,
  Shield,
  Users,
  CreditCard,
} from 'lucide-react'

const adminNavigation = [
  { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { name: 'Companies', to: '/admin/companies', icon: Building2 },
  { name: 'Users', to: '/admin/users', icon: Users },
  { name: 'Subscriptions', to: '/admin/subscriptions', icon: CreditCard },
  { name: 'Analytics', to: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', to: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const { isCollapsed } = useStore(sidebarStore)

  return (
    <aside
      className={cn(
        'bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="h-full flex flex-col">
        <div className={cn('p-6 transition-all', isCollapsed && 'p-3')}>
          <div className={cn('flex items-center gap-2', isCollapsed && 'justify-center')}>
            <Shield className={cn('h-8 w-8 text-sidebar-foreground', isCollapsed && 'h-6 w-6')} />
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-xl font-bold text-sidebar-foreground">
                  Admin Panel
                </span>
                <span className="text-xs text-muted-foreground">
                  Platform Management
                </span>
              </div>
            )}
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <div className={cn('mb-4', isCollapsed && 'mb-2')}>
            {!isCollapsed && (
              <div className="px-3 pb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Platform Admin
                </p>
              </div>
            )}
            {adminNavigation.map((item) => {
              const isActive =
                currentPath === item.to || (item.to !== '/admin' && currentPath.startsWith(item.to))
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
        </nav>
      </div>
    </aside>
  )
}



