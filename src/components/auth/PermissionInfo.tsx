import { usePermissions } from '@/hooks/use-permissions'
import { useUserRole } from '@/hooks/use-user-role'
import { ROLE_PERMISSIONS, PERMISSIONS, Permission } from '@/types/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Info } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PermissionInfoProps {
  className?: string
}

// Group permissions by category
const permissionCategories = {
  'Company Management': [
    PERMISSIONS.COMPANY_CREATE,
    PERMISSIONS.COMPANY_UPDATE,
    PERMISSIONS.COMPANY_DELETE,
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_MANAGE_USERS,
  ],
  'Product Management': [
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_VIEW,
  ],
  'Inventory': [
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.INVENTORY_ADJUST,
  ],
  'POS': [
    PERMISSIONS.POS_SALES_CREATE,
    PERMISSIONS.POS_SALES_VIEW,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_CASH_DRAWER,
    PERMISSIONS.POS_CUSTOMERS,
    PERMISSIONS.POS_REPORTS,
  ],
  'Suppliers': [
    PERMISSIONS.SUPPLIER_CREATE,
    PERMISSIONS.SUPPLIER_UPDATE,
    PERMISSIONS.SUPPLIER_DELETE,
    PERMISSIONS.SUPPLIER_VIEW,
  ],
  'Franchises': [
    PERMISSIONS.FRANCHISE_CREATE,
    PERMISSIONS.FRANCHISE_UPDATE,
    PERMISSIONS.FRANCHISE_DELETE,
    PERMISSIONS.FRANCHISE_VIEW,
    PERMISSIONS.FRANCHISE_MANAGE_USERS,
  ],
  'Warehouse Bills': [
    PERMISSIONS.WAREHOUSE_BILL_CREATE,
    PERMISSIONS.WAREHOUSE_BILL_UPDATE,
    PERMISSIONS.WAREHOUSE_BILL_DELETE,
    PERMISSIONS.WAREHOUSE_BILL_VIEW,
    PERMISSIONS.WAREHOUSE_BILL_COMPLETE,
  ],
  'Settings': [
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.SETTINGS_SUBSCRIPTION,
    PERMISSIONS.SETTINGS_SMTP,
  ],
  'Email': [
    PERMISSIONS.EMAIL_SEND,
  ],
  'Users': [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_UPDATE,
  ],
}

// Permission descriptions
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

export function PermissionInfo({ className }: PermissionInfoProps) {
  const { role } = useUserRole()
  const { hasPermission } = usePermissions()

  if (!role) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Permissions</CardTitle>
          <CardDescription>No role assigned</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const userPermissions = ROLE_PERMISSIONS[role] || []
  const allPermissions = Object.values(permissionCategories).flat()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Your Permissions
        </CardTitle>
        <CardDescription>
          Current role: <span className="capitalize font-medium">{role}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Total Permissions</p>
                <p className="text-2xl font-bold">{userPermissions.length}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Available Permissions</p>
                <p className="text-2xl font-bold">{allPermissions.length}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm font-medium">Permission Categories</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(permissionCategories).map(([category, perms]) => {
                  const hasAny = perms.some((p) => hasPermission(p))
                  const count = perms.filter((p) => hasPermission(p)).length
                  const total = perms.length
                  
                  return (
                    <div
                      key={category}
                      className="p-3 rounded-lg border bg-card"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{category}</span>
                        {hasAny ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {count} of {total} permissions
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="detailed" className="space-y-4 mt-4">
            {Object.entries(permissionCategories).map(([category, perms]) => (
              <div key={category} className="space-y-2">
                <h4 className="font-medium text-sm">{category}</h4>
                <div className="space-y-1">
                  {perms.map((perm) => {
                    const has = hasPermission(perm)
                    return (
                      <div
                        key={perm}
                        className="flex items-center justify-between p-2 rounded border bg-card"
                      >
                        <div className="flex items-center gap-2">
                          {has ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-gray-400" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{perm}</p>
                            <p className="text-xs text-muted-foreground">
                              {permissionDescriptions[perm] || 'No description'}
                            </p>
                          </div>
                        </div>
                        <Badge variant={has ? 'default' : 'outline'}>
                          {has ? 'Granted' : 'Denied'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

