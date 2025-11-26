import type { Permission } from '@/types/api'
import { AlertCircle, CheckCircle2, Info, Lock } from 'lucide-react'
import { toast } from 'sonner'
import { useUserRole } from './use-user-role'

// Permission descriptions for toast messages
const permissionDescriptions: Record<Permission, string> = {
  'companies.create': 'Create new companies',
  'companies.update': 'Modify company settings',
  'companies.delete': 'Delete companies',
  'companies.view': 'View company information',
  'companies.manage_users': 'Add, remove, and manage company users',
  'products.create': 'Create new products',
  'products.update': 'Modify product information',
  'products.delete': 'Delete products',
  'products.view': 'View product information',
  'inventory.read': 'View inventory levels',
  'inventory.write': 'Update inventory levels',
  'inventory.adjust': 'Make inventory adjustments',
  'pos.sales.create': 'Create new sales transactions',
  'pos.sales.view': 'View sales history',
  'pos.refund': 'Process refunds',
  'pos.cash_drawer': 'Manage cash drawer operations',
  'pos.customers': 'Manage customer information',
  'pos.reports': 'View POS reports and analytics',
  'suppliers.create': 'Add new suppliers',
  'suppliers.update': 'Modify supplier information',
  'suppliers.delete': 'Remove suppliers',
  'suppliers.view': 'View supplier information',
  'franchises.create': 'Create new franchises',
  'franchises.update': 'Modify franchise settings',
  'franchises.delete': 'Delete franchises',
  'franchises.view': 'View franchise information',
  'franchises.manage_users': 'Manage franchise users',
  'warehouse_bills.create': 'Create warehouse bills',
  'warehouse_bills.update': 'Modify warehouse bills',
  'warehouse_bills.delete': 'Cancel warehouse bills',
  'warehouse_bills.view': 'View warehouse bills',
  'warehouse_bills.complete': 'Complete warehouse bills',
  'settings.view': 'View system settings',
  'settings.update': 'Modify system settings',
  'settings.subscription': 'Manage subscription plans',
  'settings.smtp': 'Configure email settings',
  'emails.send': 'Send emails',
  'subscription.view': 'View subscription information',
  'subscription.update': 'Update subscription plans',
  'users.view': 'View user information',
  'users.update': 'Modify user information',
}

export function usePermissionToast() {
  const { role } = useUserRole()

  const showPermissionDenied = (permission: Permission | string, action?: string) => {
    const permissionText = typeof permission === 'string' 
      ? permissionDescriptions[permission as Permission] || permission
      : permissionDescriptions[permission] || permission

    toast.error('Permission Denied', {
      description: action
        ? `You don't have permission to ${action}. Required: ${permissionText}`
        : `This action requires the ${permissionText} permission.`,
      icon: <Lock className="h-4 w-4" />,
      duration: 5000,
      action: {
        label: 'Learn More',
        onClick: () => {
          // Could navigate to permissions page or show help
          toast.info('Contact your administrator to request access', {
            duration: 3000,
          })
        },
      },
    })
  }

  const showPermissionError = (error: any) => {
    if (error?.isPermissionError) {
      const context = error.permissionContext
      toast.error('Access Denied', {
        description: context?.message || 'You don\'t have permission to perform this action.',
        icon: <AlertCircle className="h-4 w-4" />,
        duration: 5000,
        action: role && {
          label: 'View Permissions',
          onClick: () => {
            toast.info(`Your current role: ${role}. Contact your administrator for access.`, {
              duration: 4000,
            })
          },
        },
      })
      return true
    }
    return false
  }

  const showPermissionSuccess = (permission: Permission | string, action?: string) => {
    const permissionText = typeof permission === 'string'
      ? permissionDescriptions[permission as Permission] || permission
      : permissionDescriptions[permission] || permission

    toast.success('Action Completed', {
      description: action || `Operation requiring ${permissionText} completed successfully.`,
      icon: <CheckCircle2 className="h-4 w-4" />,
      duration: 3000,
    })
  }

  const showRoleChange = (newRole: string, context?: string) => {
    toast.info('Role Changed', {
      description: context
        ? `Your role in ${context} is now ${newRole}`
        : `Your role has been changed to ${newRole}`,
      icon: <Info className="h-4 w-4" />,
      duration: 4000,
    })
  }

  return {
    showPermissionDenied,
    showPermissionError,
    showPermissionSuccess,
    showRoleChange,
  }
}



