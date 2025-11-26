import { AddUserDialog } from '@/components/companies/AddUserDialog'
import { CompanyUsersTable } from '@/components/companies/CompanyUsersTable'
import { CredentialsDialog } from '@/components/companies/CredentialsDialog'
import { SMTPConfigDialog } from '@/components/companies/SMTPConfigDialog'
import { SMTPConfigList } from '@/components/companies/SMTPConfigList'
import { UpdateRoleDialog } from '@/components/companies/UpdateRoleDialog'
import { YalidineConfigDialog } from '@/components/companies/YalidineConfigDialog'
import { YalidineConfigList } from '@/components/companies/YalidineConfigList'
import { EmailComposerDialog } from '@/components/emails/EmailComposerDialog'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { NotFound } from '@/components/ui/not-found'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ShopifyWebhookConfigDialog } from '@/components/webhooks/ShopifyWebhookConfigDialog'
import { WebhookConfigsList } from '@/components/webhooks/WebhookConfigsList'
import { WooCommerceWebhookConfigDialog } from '@/components/webhooks/WooCommerceWebhookConfigDialog'
import {
  useAddUserToCompany,
  useCompany,
  useCompanyUsers,
  useInitializeCompanyInventory,
  useRemoveUserFromCompany,
  useUpdateCompanyUserRole,
} from '@/hooks/queries/use-companies'
import {
  useCreateShopifyWebhookConfig,
  useCreateWooCommerceWebhookConfig,
  useDeleteShopifyWebhookConfig,
  useDeleteWooCommerceWebhookConfig,
  useShopifyWebhookConfigs,
  useWooCommerceWebhookConfigs,
} from '@/hooks/queries/use-orders'
import {
  useCreateSMTPConfig,
  useSMTPConfigs,
} from '@/hooks/queries/use-smtp-configs'
import {
  useCreateYalidineConfig,
  useTestYalidineConnection,
  useYalidineConfigs,
} from '@/hooks/queries/use-yalidine-configs'
import { useAuth } from '@/hooks/use-auth'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { apiClient } from '@/lib/api-client'
import { rootRoute } from '@/main'
import type { AddUserToCompanyResponse, CreateSMTPConfigRequest, CreateShopifyWebhookConfigRequest, CreateWooCommerceWebhookConfigRequest, CreateYalidineConfigRequest, SMTPConfigResponse, SMTPSecurityType, ShopifyWebhookConfig, UpdateSMTPConfigRequest, UpdateShopifyWebhookConfigRequest, UpdateWooCommerceWebhookConfigRequest, UpdateYalidineConfigRequest, UserRole, UserWithRole, WooCommerceWebhookConfig, YalidineConfigResponse } from '@/types/api'
import { useQueryClient } from '@tanstack/react-query'
import { Link, createRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Edit, Mail, Package, Plus, Store, TestTube, Truck, Users, Warehouse } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

export const CompanyDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId',
  component: CompanyDetailsPage,
})

function CompanyDetailsPage() {
  const navigate = useNavigate()
  const { companyId } = CompanyDetailsRoute.useParams()
  const companyIdNum = Number(companyId)
  const { data: company, isLoading } = useCompany(companyIdNum)
  const { data: users, isLoading: usersLoading } = useCompanyUsers(companyIdNum)
  const { selectCompany } = useSelectedCompany()
  const { user: currentUser } = useAuth()
  const initializeInventory = useInitializeCompanyInventory(companyIdNum)
  const addUserMutation = useAddUserToCompany(companyIdNum)
  const removeUserMutation = useRemoveUserFromCompany(companyIdNum)
  const updateRoleMutation = useUpdateCompanyUserRole(companyIdNum)

  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false)
  const [userToUpdate, setUserToUpdate] = useState<UserWithRole | null>(null)
  const [userToRemove, setUserToRemove] = useState<UserWithRole | null>(null)
  const [removeUserDialogOpen, setRemoveUserDialogOpen] = useState(false)
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false)
  const [credentialsData, setCredentialsData] = useState<AddUserToCompanyResponse | null>(null)
  
  // SMTP Config state
  const { data: smtpConfigs, isLoading: smtpConfigsLoading } = useSMTPConfigs(companyIdNum)
  const createSMTPConfig = useCreateSMTPConfig(companyIdNum)
  const queryClient = useQueryClient()
  
  const [smtpConfigDialogOpen, setSmtpConfigDialogOpen] = useState(false)
  const [smtpConfigToEdit, setSmtpConfigToEdit] = useState<SMTPConfigResponse | null>(null)
  const [smtpConfigToDelete, setSmtpConfigToDelete] = useState<SMTPConfigResponse | null>(null)
  const [deleteSMTPConfigDialogOpen, setDeleteSMTPConfigDialogOpen] = useState(false)
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)

  // Yalidine Config state
  const { data: yalidineConfigs, isLoading: yalidineConfigsLoading } = useYalidineConfigs(companyIdNum)
  const createYalidineConfig = useCreateYalidineConfig(companyIdNum)
  
  const [yalidineConfigDialogOpen, setYalidineConfigDialogOpen] = useState(false)
  const [yalidineConfigToEdit, setYalidineConfigToEdit] = useState<YalidineConfigResponse | null>(null)
  const [yalidineConfigToDelete, setYalidineConfigToDelete] = useState<YalidineConfigResponse | null>(null)
  const [deleteYalidineConfigDialogOpen, setDeleteYalidineConfigDialogOpen] = useState(false)
  const testYalidineConnection = useTestYalidineConnection(companyIdNum)
  
  // Webhook Config state
  const { data: shopifyConfigs, isLoading: shopifyConfigsLoading } = useShopifyWebhookConfigs(companyIdNum)
  const { data: woocommerceConfigs, isLoading: woocommerceConfigsLoading } = useWooCommerceWebhookConfigs(companyIdNum)
  const createShopifyConfig = useCreateShopifyWebhookConfig(companyIdNum)
  const deleteShopifyConfig = useDeleteShopifyWebhookConfig(companyIdNum)
  const createWooCommerceConfig = useCreateWooCommerceWebhookConfig(companyIdNum)
  const deleteWooCommerceConfig = useDeleteWooCommerceWebhookConfig(companyIdNum)
  
  const [shopifyConfigDialogOpen, setShopifyConfigDialogOpen] = useState(false)
  const [shopifyConfigToEdit, setShopifyConfigToEdit] = useState<ShopifyWebhookConfig | null>(null)
  const [woocommerceConfigDialogOpen, setWooCommerceConfigDialogOpen] = useState(false)
  const [woocommerceConfigToEdit, setWooCommerceConfigToEdit] = useState<WooCommerceWebhookConfig | null>(null)
  const hasValidDefaultYalidineConfig = useMemo(
    () => (yalidineConfigs || []).some((config) => config.is_default && config.is_active),
    [yalidineConfigs]
  )

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  const handleInitializeInventory = async () => {
    await initializeInventory.mutateAsync()
  }

  const handleAddUser = async (data: { email: string; role: string }) => {
    try {
      const response = await addUserMutation.mutateAsync({ email: data.email, role: data.role as UserRole })
      setAddUserDialogOpen(false)
      
      // If user was created, show credentials dialog
      if (response.data?.user_created && response.data?.credentials) {
        setCredentialsData(response.data)
        setCredentialsDialogOpen(true)
      }
    } catch (error) {
      // Error is handled by the mutation
    }
  }

  const handleUpdateRole = (user: UserWithRole) => {
    setUserToUpdate(user)
    setUpdateRoleDialogOpen(true)
  }

  const handleConfirmUpdateRole = async (data: { role: string }) => {
    if (userToUpdate) {
      await updateRoleMutation.mutateAsync({ userId: userToUpdate.id, role: data.role })
      setUpdateRoleDialogOpen(false)
      setUserToUpdate(null)
    }
  }

  const handleRemoveUser = (user: UserWithRole) => {
    setUserToRemove(user)
    setRemoveUserDialogOpen(true)
  }

  const confirmRemoveUser = async () => {
    if (userToRemove) {
      await removeUserMutation.mutateAsync(userToRemove.id)
      setRemoveUserDialogOpen(false)
      setUserToRemove(null)
    }
  }

  // SMTP Config handlers
  const handleCreateSMTPConfig = () => {
    setSmtpConfigToEdit(null)
    setSmtpConfigDialogOpen(true)
  }

  const handleEditSMTPConfig = (config: SMTPConfigResponse) => {
    setSmtpConfigToEdit(config)
    setSmtpConfigDialogOpen(true)
  }

  const handleSubmitSMTPConfig = async (data: {
    host: string
    user: string
    password?: string
    port: number
    from_name?: string
    security: SMTPSecurityType
    rate_limit?: number
    is_active?: boolean
  }) => {
    try {
      if (smtpConfigToEdit) {
        // Update existing config
        const updateData: UpdateSMTPConfigRequest = {
          host: data.host,
          user: data.user,
          port: data.port,
          from_name: data.from_name,
          security: data.security,
          rate_limit: data.rate_limit,
          is_active: data.is_active,
        }
        if (data.password) {
          updateData.password = data.password
        }
        await apiClient.smtpConfigs.update(companyIdNum, smtpConfigToEdit.id, updateData)
        queryClient.invalidateQueries({ queryKey: ['companies', companyIdNum, 'smtp-configs'] })
        toast.success('SMTP config updated successfully')
        setSmtpConfigDialogOpen(false)
        setSmtpConfigToEdit(null)
      } else {
        // Create new config
        const createData: CreateSMTPConfigRequest = {
          host: data.host,
          user: data.user,
          password: data.password || '',
          port: data.port,
          from_name: data.from_name,
          security: data.security,
          rate_limit: data.rate_limit,
          is_active: data.is_active,
        }
        await createSMTPConfig.mutateAsync(createData)
        setSmtpConfigDialogOpen(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save SMTP config')
    }
  }

  const handleDeleteSMTPConfig = (config: SMTPConfigResponse) => {
    setSmtpConfigToDelete(config)
    setDeleteSMTPConfigDialogOpen(true)
  }

  const confirmDeleteSMTPConfig = async () => {
    if (smtpConfigToDelete) {
      try {
        await apiClient.smtpConfigs.delete(companyIdNum, smtpConfigToDelete.id)
        queryClient.invalidateQueries({ queryKey: ['companies', companyIdNum, 'smtp-configs'] })
        toast.success('SMTP config deleted successfully')
        setDeleteSMTPConfigDialogOpen(false)
        setSmtpConfigToDelete(null)
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete SMTP config')
      }
    }
  }

  const handleSetDefaultSMTPConfig = async (config: SMTPConfigResponse) => {
    try {
      await apiClient.smtpConfigs.setDefault(companyIdNum, config.id)
      queryClient.invalidateQueries({ queryKey: ['companies', companyIdNum, 'smtp-configs'] })
      toast.success('Default SMTP config set successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to set default SMTP config')
    }
  }

  // Yalidine Config handlers
  const handleCreateYalidineConfig = () => {
    setYalidineConfigToEdit(null)
    setYalidineConfigDialogOpen(true)
  }

  const handleEditYalidineConfig = (config: YalidineConfigResponse) => {
    setYalidineConfigToEdit(config)
    setYalidineConfigDialogOpen(true)
  }

  const handleSubmitYalidineConfig = async (data: {
    api_id: string
    api_token?: string
    from_wilaya_id?: number | null
    is_active?: boolean
  }) => {
    try {
      if (yalidineConfigToEdit) {
        // Update existing config
        const updateData: UpdateYalidineConfigRequest = {
          api_id: data.api_id,
          is_active: data.is_active,
        }
        if (data.api_token) {
          updateData.api_token = data.api_token
        }
        if (data.from_wilaya_id !== undefined) {
          updateData.from_wilaya_id = data.from_wilaya_id
        }
        await apiClient.yalidineConfigs.update(companyIdNum, yalidineConfigToEdit.id, updateData)
        queryClient.invalidateQueries({ queryKey: ['companies', companyIdNum, 'yalidine-configs'] })
        toast.success('Yalidine config updated successfully')
        setYalidineConfigDialogOpen(false)
        setYalidineConfigToEdit(null)
      } else {
        // Create new config
        const createData: CreateYalidineConfigRequest = {
          api_id: data.api_id,
          api_token: data.api_token || '',
          from_wilaya_id: data.from_wilaya_id ?? null,
          is_active: data.is_active,
        }
        await createYalidineConfig.mutateAsync(createData)
        setYalidineConfigDialogOpen(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save Yalidine config')
    }
  }

  const handleDeleteYalidineConfig = (config: YalidineConfigResponse) => {
    setYalidineConfigToDelete(config)
    setDeleteYalidineConfigDialogOpen(true)
  }

  const confirmDeleteYalidineConfig = async () => {
    if (yalidineConfigToDelete) {
      try {
        await apiClient.yalidineConfigs.delete(companyIdNum, yalidineConfigToDelete.id)
        queryClient.invalidateQueries({ queryKey: ['companies', companyIdNum, 'yalidine-configs'] })
        toast.success('Yalidine config deleted successfully')
        setDeleteYalidineConfigDialogOpen(false)
        setYalidineConfigToDelete(null)
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete Yalidine config')
      }
    }
  }

  const handleSetDefaultYalidineConfig = async (config: YalidineConfigResponse) => {
    try {
      await apiClient.yalidineConfigs.setDefault(companyIdNum, config.id)
      queryClient.invalidateQueries({ queryKey: ['companies', companyIdNum, 'yalidine-configs'] })
      toast.success('Default Yalidine config set successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to set default Yalidine config')
    }
  }

  const handleTestYalidineConnection = async () => {
    try {
      await testYalidineConnection.mutateAsync()
    } catch (error: any) {
      // Error is handled by the mutation hook
    }
  }

  // Webhook Config handlers
  const handleCreateShopifyConfig = () => {
    setShopifyConfigToEdit(null)
    setShopifyConfigDialogOpen(true)
  }

  const handleEditShopifyConfig = (config: ShopifyWebhookConfig) => {
    setShopifyConfigToEdit(config)
    setShopifyConfigDialogOpen(true)
  }

  const handleSubmitShopifyConfig = async (data: CreateShopifyWebhookConfigRequest | UpdateShopifyWebhookConfigRequest) => {
    try {
      if (shopifyConfigToEdit) {
        await apiClient.orders.shopifyWebhookConfigs.update(companyIdNum, shopifyConfigToEdit.id, data as UpdateShopifyWebhookConfigRequest)
        queryClient.invalidateQueries({ queryKey: ['shopifyWebhookConfigs', companyIdNum] })
        toast.success('Shopify webhook config updated successfully')
        setShopifyConfigDialogOpen(false)
        setShopifyConfigToEdit(null)
      } else {
        await createShopifyConfig.mutateAsync(data as CreateShopifyWebhookConfigRequest)
        setShopifyConfigDialogOpen(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save Shopify webhook config')
    }
  }

  const handleDeleteShopifyConfig = async (config: ShopifyWebhookConfig) => {
    await deleteShopifyConfig.mutateAsync(config.id)
  }

  const handleCreateWooCommerceConfig = () => {
    setWooCommerceConfigToEdit(null)
    setWooCommerceConfigDialogOpen(true)
  }

  const handleEditWooCommerceConfig = (config: WooCommerceWebhookConfig) => {
    setWooCommerceConfigToEdit(config)
    setWooCommerceConfigDialogOpen(true)
  }

  const handleSubmitWooCommerceConfig = async (data: CreateWooCommerceWebhookConfigRequest | UpdateWooCommerceWebhookConfigRequest) => {
    try {
      if (woocommerceConfigToEdit) {
        await apiClient.orders.woocommerceWebhookConfigs.update(companyIdNum, woocommerceConfigToEdit.id, data as UpdateWooCommerceWebhookConfigRequest)
        queryClient.invalidateQueries({ queryKey: ['woocommerceWebhookConfigs', companyIdNum] })
        toast.success('WooCommerce webhook config updated successfully')
        setWooCommerceConfigDialogOpen(false)
        setWooCommerceConfigToEdit(null)
      } else {
        await createWooCommerceConfig.mutateAsync(data as CreateWooCommerceWebhookConfigRequest)
        setWooCommerceConfigDialogOpen(false)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save WooCommerce webhook config')
    }
  }

  const handleDeleteWooCommerceConfig = async (config: WooCommerceWebhookConfig) => {
    await deleteWooCommerceConfig.mutateAsync(config.id)
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  if (!company) {
    return (
      <RoleBasedLayout>
        <NotFound 
          title="Company not found"
          message="The company you're looking for doesn't exist or you don't have access to it."
          backTo="/companies"
          backLabel="Back to Companies"
        />
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate({ to: '/companies' })}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {company.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Code: {company.code}
              </p>
            </div>
            <Badge variant={company.is_active ? 'default' : 'secondary'}>
              {company.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <Link to={`/companies/${company.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Company Details</CardTitle>
              <CardDescription>Basic information about the company</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </p>
                <p className="mt-1 text-lg">{company.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Code
                </p>
                <p className="mt-1 font-mono">{company.code}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </p>
                <p className="mt-1">{company.description || 'No description provided'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Users with access to this company</CardDescription>
              </div>
              <Users className="h-5 w-5 text-gray-400" />
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : users && users.length > 0 ? (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No team members yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage products, suppliers, inventory, and settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link to={`/companies/${company.id}/products`}>
                <Button variant="outline" className="w-full h-24 flex-col">
                  <Package className="h-8 w-8 mb-2" />
                  <span>Manage Products</span>
                </Button>
              </Link>
              <Link to={`/companies/${company.id}/suppliers`}>
                <Button variant="outline" className="w-full h-24 flex-col">
                  <Truck className="h-8 w-8 mb-2" />
                  <span>Manage Suppliers</span>
                </Button>
              </Link>
              <Link to={`/companies/${company.id}/inventory`}>
                <Button variant="outline" className="w-full h-24 flex-col">
                  <Warehouse className="h-8 w-8 mb-2" />
                  <span>Manage Inventory</span>
                </Button>
              </Link>
              <Link to={`/companies/${company.id}/franchises`}>
                <Button variant="outline" className="w-full h-24 flex-col">
                  <Store className="h-8 w-8 mb-2" />
                  <span>Manage Franchises</span>
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full h-24 flex-col"
                onClick={handleInitializeInventory}
                disabled={initializeInventory.isPending}
              >
                <Warehouse className="h-8 w-8 mb-2" />
                <span>
                  {initializeInventory.isPending ? 'Initializing...' : 'Initialize Inventory'}
                </span>
              </Button>
              <Link to={`/companies/${company.id}/edit`}>
                <Button variant="outline" className="w-full h-24 flex-col">
                  <Edit className="h-8 w-8 mb-2" />
                  <span>Edit Company</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* IAM Management Tab */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="smtp">SMTP Config</TabsTrigger>
            <TabsTrigger value="yalidine">Yalidine</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="emails">Send Email</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Company Users</CardTitle>
                    <CardDescription>
                      Manage users who have access to this company
                    </CardDescription>
                  </div>
                  <Button onClick={() => setAddUserDialogOpen(true)}>
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <CompanyUsersTable
                    users={users || []}
                    onRemoveUser={handleRemoveUser}
                    onUpdateRole={handleUpdateRole}
                    currentUserId={currentUser?.id}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="smtp" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>SMTP Email Configurations</CardTitle>
                    <CardDescription>
                      Manage email sending configurations for this company. Each company can have multiple SMTP configs.
                    </CardDescription>
                  </div>
                  <Button onClick={handleCreateSMTPConfig}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add SMTP Config
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {smtpConfigsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <SMTPConfigList
                    configs={smtpConfigs || []}
                    onEdit={handleEditSMTPConfig}
                    onDelete={handleDeleteSMTPConfig}
                    onSetDefault={handleSetDefaultSMTPConfig}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yalidine" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Yalidine API Configurations</CardTitle>
                    <CardDescription>
                      Manage Yalidine API credentials for shipping management. Each company can have multiple Yalidine configs.
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      onClick={handleTestYalidineConnection}
                      disabled={testYalidineConnection.isPending}
                    >
                      <TestTube className="mr-2 h-4 w-4" />
                      {testYalidineConnection.isPending ? 'Testing...' : 'Test Connection'}
                    </Button>
                    <Button onClick={handleCreateYalidineConfig}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Yalidine Config
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {yalidineConfigsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <YalidineConfigList
                    configs={yalidineConfigs || []}
                    onEdit={handleEditYalidineConfig}
                    onDelete={handleDeleteYalidineConfig}
                    onSetDefault={handleSetDefaultYalidineConfig}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Webhook Configurations</CardTitle>
                    <CardDescription>
                      Configure webhooks to automatically import orders from Shopify and WooCommerce stores
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {shopifyConfigsLoading || woocommerceConfigsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <WebhookConfigsList
                    shopifyConfigs={shopifyConfigs || []}
                    woocommerceConfigs={woocommerceConfigs || []}
                    onEditShopify={handleEditShopifyConfig}
                    onEditWooCommerce={handleEditWooCommerceConfig}
                    onDeleteShopify={handleDeleteShopifyConfig}
                    onDeleteWooCommerce={handleDeleteWooCommerceConfig}
                    onCreateShopify={handleCreateShopifyConfig}
                    onCreateWooCommerce={handleCreateWooCommerceConfig}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emails" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Send Email</CardTitle>
                    <CardDescription>
                      Compose and send emails using your company's SMTP configuration
                    </CardDescription>
                  </div>
                  <Button onClick={() => setEmailComposerOpen(true)}>
                    <Mail className="mr-2 h-4 w-4" />
                    Compose Email
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-gray-500">
                  <Mail className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="mb-4">Click "Compose Email" to create and send an email</p>
                  <p className="text-sm">Emails will be queued and sent using your default SMTP configuration</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <AddUserDialog
        open={addUserDialogOpen}
        onOpenChange={setAddUserDialogOpen}
        onSubmit={handleAddUser}
        isLoading={addUserMutation.isPending}
      />

      <CredentialsDialog
        open={credentialsDialogOpen}
        onOpenChange={(open) => {
          setCredentialsDialogOpen(open)
          if (!open) {
            setCredentialsData(null)
          }
        }}
        credentials={credentialsData?.credentials || null}
        emailSent={credentialsData?.email_sent || false}
      />

      <UpdateRoleDialog
        open={updateRoleDialogOpen}
        onOpenChange={(open) => {
          setUpdateRoleDialogOpen(open)
          if (!open) setUserToUpdate(null)
        }}
        user={userToUpdate}
        onSubmit={handleConfirmUpdateRole}
        isLoading={updateRoleMutation.isPending}
      />

      <AlertDialog open={removeUserDialogOpen} onOpenChange={setRemoveUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove?.first_name} {userToRemove?.last_name} from this company?
              They will no longer have access to this company's data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveUser}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* SMTP Config Dialogs */}
      <SMTPConfigDialog
        open={smtpConfigDialogOpen}
        onOpenChange={(open) => {
          setSmtpConfigDialogOpen(open)
          if (!open) setSmtpConfigToEdit(null)
        }}
        initialData={smtpConfigToEdit || undefined}
        onSubmit={handleSubmitSMTPConfig}
        isLoading={createSMTPConfig.isPending}
      />

      <AlertDialog open={deleteSMTPConfigDialogOpen} onOpenChange={setDeleteSMTPConfigDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SMTP Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the SMTP configuration for {smtpConfigToDelete?.host}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSMTPConfig}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Yalidine Config Dialogs */}
      <YalidineConfigDialog
        open={yalidineConfigDialogOpen}
        onOpenChange={(open) => {
          setYalidineConfigDialogOpen(open)
          if (!open) setYalidineConfigToEdit(null)
        }}
        initialData={yalidineConfigToEdit || undefined}
        onSubmit={handleSubmitYalidineConfig}
        isLoading={createYalidineConfig.isPending}
        hasValidDefaultYalidineConfig={hasValidDefaultYalidineConfig}
      />

      <AlertDialog open={deleteYalidineConfigDialogOpen} onOpenChange={setDeleteYalidineConfigDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Yalidine Configuration</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this Yalidine configuration?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteYalidineConfig}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Composer Dialog */}
      <EmailComposerDialog
        open={emailComposerOpen}
        onOpenChange={setEmailComposerOpen}
        companyId={companyIdNum}
      />

      {/* Webhook Config Dialogs */}
      <ShopifyWebhookConfigDialog
        open={shopifyConfigDialogOpen}
        onOpenChange={(open: boolean) => {
          setShopifyConfigDialogOpen(open)
          if (!open) setShopifyConfigToEdit(null)
        }}
        initialData={shopifyConfigToEdit || undefined}
        onSubmit={handleSubmitShopifyConfig}
        isLoading={createShopifyConfig.isPending}
      />

      <WooCommerceWebhookConfigDialog
        open={woocommerceConfigDialogOpen}
        onOpenChange={(open: boolean) => {
          setWooCommerceConfigDialogOpen(open)
          if (!open) setWooCommerceConfigToEdit(null)
        }}
        initialData={woocommerceConfigToEdit || undefined}
        onSubmit={handleSubmitWooCommerceConfig}
        isLoading={createWooCommerceConfig.isPending}
      />
    </RoleBasedLayout>
  )
}



