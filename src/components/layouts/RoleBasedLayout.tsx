import type { ReactNode } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { POSLayout } from './POSLayout'
import { AdminLayout } from './AdminLayout'
import { useUserRole } from '@/hooks/use-user-role'
import { useRouterState } from '@tanstack/react-router'

interface RoleBasedLayoutProps {
  children: ReactNode
}

/**
 * Smart layout component that renders the appropriate layout based on user role:
 * - Super Admins on /admin/* routes see the AdminLayout
 * - Employees (POS users) see the simplified POS layout
 * - Owners, Admins, Managers see the full admin dashboard layout
 */
export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { isPOSUser, isSuperAdmin } = useUserRole()
  const router = useRouterState()
  const currentPath = router.location.pathname

  // Super admins on admin routes get the AdminLayout
  if (isSuperAdmin && currentPath.startsWith('/admin')) {
    return <AdminLayout>{children}</AdminLayout>
  }

  // Employees get the POS-focused interface
  if (isPOSUser) {
    return <POSLayout>{children}</POSLayout>
  }

  // Owners, Admins, Managers get the full admin dashboard
  return <DashboardLayout>{children}</DashboardLayout>
}



