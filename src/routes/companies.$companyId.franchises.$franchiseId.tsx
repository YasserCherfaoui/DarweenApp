import { createRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FranchisePricingTable } from '@/components/franchises/FranchisePricingTable'
import { FranchisePricingDialog } from '@/components/franchises/FranchisePricingDialog'
import { FranchiseUsersTable } from '@/components/franchises/FranchiseUsersTable'
import { AddUserDialog } from '@/components/franchises/AddUserDialog'
import { UpdateRoleDialog } from '@/components/franchises/UpdateRoleDialog'
import { CredentialsDialog } from '@/components/franchises/CredentialsDialog'
import {
  useFranchise,
  useFranchisePricing,
  useSetFranchisePricing,
  useBulkSetFranchisePricing,
  useDeleteFranchisePricing,
  useAddUserToFranchise,
  useRemoveUserFromFranchise,
  useFranchiseUsers,
  useUpdateFranchiseUserRole,
  useInitializeFranchiseInventory,
} from '@/hooks/queries/use-franchises'
import { useAuth } from '@/hooks/use-auth'
import { ArrowLeft, Edit, MapPin, Phone, Mail, Package, DollarSign, Users, FileText } from 'lucide-react'
import { rootRoute } from '@/main'
import type { FranchisePricing, UserWithRole, AddUserToFranchiseResponse } from '@/types/api'
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

export const CompanyFranchiseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/franchises/$franchiseId',
  component: CompanyFranchisePage,
})

function CompanyFranchisePage() {
  const navigate = useNavigate()
  const { companyId, franchiseId } = CompanyFranchiseRoute.useParams()
  const companyIdNum = Number(companyId)
  const franchiseIdNum = Number(franchiseId)

  const { data: franchise, isLoading } = useFranchise(franchiseIdNum)
  const { data: pricing, isLoading: pricingLoading } = useFranchisePricing(franchiseIdNum)
  const { data: users, isLoading: usersLoading } = useFranchiseUsers(franchiseIdNum)
  const { user: currentUser } = useAuth()

  const [pricingDialogOpen, setPricingDialogOpen] = useState(false)
  const [selectedPricing, setSelectedPricing] = useState<FranchisePricing | null>(null)
  const [addUserDialogOpen, setAddUserDialogOpen] = useState(false)
  const [updateRoleDialogOpen, setUpdateRoleDialogOpen] = useState(false)
  const [userToUpdate, setUserToUpdate] = useState<UserWithRole | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [pricingToDelete, setPricingToDelete] = useState<FranchisePricing | null>(null)
  const [userToRemove, setUserToRemove] = useState<UserWithRole | null>(null)
  const [removeUserDialogOpen, setRemoveUserDialogOpen] = useState(false)
  const [credentialsDialogOpen, setCredentialsDialogOpen] = useState(false)
  const [credentialsData, setCredentialsData] = useState<AddUserToFranchiseResponse | null>(null)

  const setPricingMutation = useSetFranchisePricing(franchiseIdNum)
  const bulkSetPricingMutation = useBulkSetFranchisePricing(franchiseIdNum)
  const deletePricingMutation = useDeleteFranchisePricing(franchiseIdNum)
  const addUserMutation = useAddUserToFranchise(franchiseIdNum)
  const removeUserMutation = useRemoveUserFromFranchise(franchiseIdNum)
  const updateRoleMutation = useUpdateFranchiseUserRole(franchiseIdNum)
  const initializeInventoryMutation = useInitializeFranchiseInventory(franchiseIdNum)

  const handleSetPricing = async (data: {
    product_variant_id?: number
    product_id?: number
    retail_price?: number
    wholesale_price?: number
  }) => {
    // Use bulk endpoint if product_id is provided (all variants mode)
    if (data.product_id) {
      await bulkSetPricingMutation.mutateAsync({
        product_id: data.product_id,
        retail_price: data.retail_price,
        wholesale_price: data.wholesale_price,
      })
    } else if (data.product_variant_id) {
      // Use single endpoint for individual variant
      await setPricingMutation.mutateAsync({
        product_variant_id: data.product_variant_id,
        retail_price: data.retail_price,
        wholesale_price: data.wholesale_price,
      })
    }
    setPricingDialogOpen(false)
    setSelectedPricing(null)
  }

  const handleEditPricing = (pricing: FranchisePricing) => {
    setSelectedPricing(pricing)
    setPricingDialogOpen(true)
  }

  const handleDeletePricing = (pricing: FranchisePricing) => {
    setPricingToDelete(pricing)
    setDeleteDialogOpen(true)
  }

  const confirmDeletePricing = async () => {
    if (pricingToDelete) {
      await deletePricingMutation.mutateAsync(pricingToDelete.product_variant_id)
      setDeleteDialogOpen(false)
      setPricingToDelete(null)
    }
  }

  const handleAddUser = async (data: {
    email: string
    role: 'owner' | 'admin' | 'manager' | 'employee'
  }) => {
    try {
      const response = await addUserMutation.mutateAsync(data)
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

  const handleInitializeInventory = async () => {
    await initializeInventoryMutation.mutateAsync()
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </RoleBasedLayout>
    )
  }

  if (!franchise) {
    return (
      <RoleBasedLayout>
        <Card className="p-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Franchise not found</h3>
            <p className="text-gray-500 mb-6">
              The franchise you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link to={`/companies/${companyId}/franchises`}>
              <Button>Back to Franchises</Button>
            </Link>
          </div>
        </Card>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate({ to: `/companies/${companyId}/franchises` })}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {franchise.name}
                </h1>
                <Badge variant={franchise.is_active ? 'default' : 'secondary'}>
                  {franchise.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Code: {franchise.code}
              </p>
            </div>
          </div>
          <Link to={`/companies/${companyId}/franchises/${franchiseId}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              Edit Franchise
            </Button>
          </Link>
        </div>

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Franchise Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {franchise.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                <p className="text-gray-900 dark:text-white">{franchise.description}</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {franchise.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Address</h4>
                    <p className="text-gray-900 dark:text-white">{franchise.address}</p>
                  </div>
                </div>
              )}
              {franchise.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                    <p className="text-gray-900 dark:text-white">{franchise.phone}</p>
                  </div>
                </div>
              )}
              {franchise.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Email</h4>
                    <p className="text-gray-900 dark:text-white">{franchise.email}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inventory</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to={`/companies/${companyId}/franchises/${franchiseId}/inventory`}>
                  <Button variant="outline" className="w-full">
                    View Inventory
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleInitializeInventory}
                  disabled={initializeInventoryMutation.isPending}
                >
                  {initializeInventoryMutation.isPending ? 'Initializing...' : 'Initialize Inventory'}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warehouse Bills</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Link to={`/franchises/${franchiseId}/warehouse-bills`}>
                  <Button variant="outline" className="w-full">
                    View Entry Bills
                  </Button>
                </Link>
                <Link to={`/companies/${companyId}/franchises/${franchiseId}/warehouse-bills/entry/new`}>
                  <Button variant="outline" className="w-full">
                    Create Entry Bill
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pricing</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{pricing?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Custom price overrides</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{users?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="pricing" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Custom Pricing</CardTitle>
                    <CardDescription>
                      Manage custom pricing for product variants at this franchise
                    </CardDescription>
                  </div>
                  <Button onClick={() => setPricingDialogOpen(true)}>
                    Set Pricing
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {pricingLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <FranchisePricingTable
                    pricing={pricing || []}
                    onEdit={handleEditPricing}
                    onDelete={handleDeletePricing}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Franchise Users</CardTitle>
                    <CardDescription>
                      Manage users who have access to this franchise
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
                  <FranchiseUsersTable
                    users={users || []}
                    onRemoveUser={handleRemoveUser}
                    onUpdateRole={handleUpdateRole}
                    currentUserId={currentUser?.id}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <FranchisePricingDialog
        open={pricingDialogOpen}
        onOpenChange={(open) => {
          setPricingDialogOpen(open)
          if (!open) setSelectedPricing(null)
        }}
        companyId={companyIdNum}
        franchiseId={franchiseIdNum}
        existingPricing={selectedPricing}
        onSubmit={handleSetPricing}
        isLoading={setPricingMutation.isPending || bulkSetPricingMutation.isPending}
      />

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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Custom Pricing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the custom pricing for {pricingToDelete?.variant_name}?
              The variant will revert to using default pricing.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePricing}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={removeUserDialogOpen} onOpenChange={setRemoveUserDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove?.first_name} {userToRemove?.last_name} from this franchise?
              They will no longer have access to this franchise's data.
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
    </RoleBasedLayout>
  )
}


