import { useMemo } from 'react'
import { useUserRole } from './use-user-role'
import type { Permission, UserRole } from '@/types/api'
import { ROLE_PERMISSIONS } from '@/types/api'

export interface UsePermissionsReturn {
  hasPermission: (permission: Permission) => boolean
  hasAnyPermission: (...permissions: Permission[]) => boolean
  hasAllPermissions: (...permissions: Permission[]) => boolean
  canManageCompany: () => boolean
  canManageUsers: () => boolean
  canManageProducts: () => boolean
  canManageInventory: () => boolean
  canAccessPOS: () => boolean
  canManageSettings: () => boolean
  canManageSubscription: () => boolean
}

/**
 * Hook to check user permissions based on their role
 */
export const usePermissions = (): UsePermissionsReturn => {
  const { role } = useUserRole()

  const permissions = useMemo(() => {
    if (!role) return []
    return ROLE_PERMISSIONS[role] || []
  }, [role])

  const hasPermission = (permission: Permission): boolean => {
    if (!role) return false
    return permissions.includes(permission)
  }

  const hasAnyPermission = (...checkPermissions: Permission[]): boolean => {
    if (!role) return false
    return checkPermissions.some((perm) => permissions.includes(perm))
  }

  const hasAllPermissions = (...checkPermissions: Permission[]): boolean => {
    if (!role) return false
    return checkPermissions.every((perm) => permissions.includes(perm))
  }

  const canManageCompany = (): boolean => {
    return hasAnyPermission(
      'companies.update',
      'companies.delete',
      'companies.manage_users'
    )
  }

  const canManageUsers = (): boolean => {
    return hasAnyPermission(
      'companies.manage_users',
      'franchises.manage_users'
    )
  }

  const canManageProducts = (): boolean => {
    return hasAnyPermission(
      'products.create',
      'products.update',
      'products.delete'
    )
  }

  const canManageInventory = (): boolean => {
    return hasAnyPermission('inventory.write', 'inventory.adjust')
  }

  const canAccessPOS = (): boolean => {
    return hasAnyPermission(
      'pos.sales.create',
      'pos.sales.view',
      'pos.refund',
      'pos.cash_drawer',
      'pos.customers'
    )
  }

  const canManageSettings = (): boolean => {
    return hasPermission('settings.update')
  }

  const canManageSubscription = (): boolean => {
    return hasPermission('settings.subscription')
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canManageCompany,
    canManageUsers,
    canManageProducts,
    canManageInventory,
    canAccessPOS,
    canManageSettings,
    canManageSubscription,
  }
}

