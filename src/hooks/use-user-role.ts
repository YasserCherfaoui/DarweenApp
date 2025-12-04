import { useStore } from '@tanstack/react-store'
import { portalStore } from '@/stores/portal-store'
import { useUserPortals } from '@/hooks/queries/use-portals'
import type { UserRole } from '@/types/api'

export interface UseUserRoleReturn {
  role: UserRole | null
  isOwner: boolean
  isAdmin: boolean
  isManager: boolean
  isEmployee: boolean
  isSuperAdmin: boolean // Platform-level super admin
  isPOSUser: boolean // Employee role - POS-focused UI
  isAdminUser: boolean // Owner/Admin/Manager - Full admin UI
  hasAdminAccess: boolean // Can access admin features
  hasManagerAccess: boolean // Can access manager features
}

export const useUserRole = (): UseUserRoleReturn => {
  const { selectedPortal } = useStore(portalStore)
  const { data: portalsData } = useUserPortals()
  const userRole = selectedPortal?.role || null

  // Check if user has super_admin role in any portal
  const portals = portalsData?.portals || []
  const isSuperAdmin = portals.some(p => p.role === 'super_admin')

  const isOwner = userRole === 'owner'
  const isAdmin = userRole === 'admin'
  const isManager = userRole === 'manager'
  const isEmployee = userRole === 'employee'

  // POS users are employees only - they get the POS-focused interface
  const isPOSUser = isEmployee && !isSuperAdmin

  // Admin users are owner, admin, or manager - they get the full admin interface
  const isAdminUser = isOwner || isAdmin || isManager

  // Admin access includes owner and admin roles
  const hasAdminAccess = isOwner || isAdmin

  // Manager access includes owner, admin, and manager roles
  const hasManagerAccess = isOwner || isAdmin || isManager

  return {
    role: userRole,
    isOwner,
    isAdmin,
    isManager,
    isEmployee,
    isSuperAdmin,
    isPOSUser,
    isAdminUser,
    hasAdminAccess,
    hasManagerAccess,
  }
}


