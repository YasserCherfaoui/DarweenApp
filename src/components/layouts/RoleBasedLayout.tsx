import { ReactNode } from 'react'
import { DashboardLayout } from './DashboardLayout'
import { POSLayout } from './POSLayout'
import { useUserRole } from '@/hooks/use-user-role'

interface RoleBasedLayoutProps {
  children: ReactNode
}

/**
 * Smart layout component that renders the appropriate layout based on user role:
 * - Employees (POS users) see the simplified POS layout
 * - Owners, Admins, Managers see the full admin dashboard layout
 */
export function RoleBasedLayout({ children }: RoleBasedLayoutProps) {
  const { isPOSUser } = useUserRole()

  // Employees get the POS-focused interface
  if (isPOSUser) {
    return <POSLayout>{children}</POSLayout>
  }

  // Owners, Admins, Managers get the full admin dashboard
  return <DashboardLayout>{children}</DashboardLayout>
}


