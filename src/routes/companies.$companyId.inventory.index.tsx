import { createRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryTable } from '@/components/inventory/InventoryTable'
import { StockAdjustmentDialog } from '@/components/inventory/StockAdjustmentDialog'
import { StockReservationDialog } from '@/components/inventory/StockReservationDialog'
import { InventoryMovementsDialog } from '@/components/inventory/InventoryMovementsDialog'
import { CreateInventoryDialog } from '@/components/inventory/CreateInventoryDialog'
import { useCompanyInventory } from '@/hooks/queries/use-inventory'
import { useCompany } from '@/hooks/queries/use-companies'
import { ArrowLeft, Plus, Search, Package, AlertTriangle, Lock } from 'lucide-react'
import { rootRoute } from '@/main'
import type { Inventory } from '@/types/api'

export const CompanyInventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/inventory',
  component: CompanyInventoryPage,
})

function CompanyInventoryPage() {
  const navigate = useNavigate()
  const { companyId } = CompanyInventoryRoute.useParams()
  const companyIdNum = Number(companyId)

  const { data: company, isLoading: companyLoading } = useCompany(companyIdNum)
  const { data: inventory, isLoading: inventoryLoading } = useCompanyInventory(companyIdNum)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInventory, setSelectedInventory] = useState<Inventory | null>(null)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false)
  const [movementsDialogOpen, setMovementsDialogOpen] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  // Filter inventory based on search query
  const filteredInventory = useMemo(() => {
    const items = inventory || []
    if (!searchQuery) return items

    const query = searchQuery.toLowerCase()
    return items.filter(
      (item) =>
        item.product_name?.toLowerCase().includes(query) ||
        item.variant_name?.toLowerCase().includes(query) ||
        item.variant_sku?.toLowerCase().includes(query) ||
        item.franchise_name?.toLowerCase().includes(query)
    )
  }, [inventory, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const items = inventory || []
    const totalItems = items.length
    const totalStock = items.reduce((sum, item) => sum + item.stock, 0)
    const totalReserved = items.reduce((sum, item) => sum + item.reserved_stock, 0)
    const lowStockItems = items.filter(
      (item) => item.available_stock > 0 && item.available_stock <= 10
    ).length
    const outOfStockItems = items.filter(
      (item) => item.available_stock <= 0 && item.is_active
    ).length

    return {
      totalItems,
      totalStock,
      totalReserved,
      lowStockItems,
      outOfStockItems,
    }
  }, [inventory])

  const handleAdjustStock = (item: Inventory) => {
    setSelectedInventory(item)
    setAdjustDialogOpen(true)
  }

  const handleReserveStock = (item: Inventory) => {
    setSelectedInventory(item)
    setReserveDialogOpen(true)
  }

  const handleViewMovements = (item: Inventory) => {
    setSelectedInventory(item)
    setMovementsDialogOpen(true)
  }

  if (companyLoading) {
    return (
      <RoleBasedLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </RoleBasedLayout>
    )
  }

  if (!company) {
    return (
      <RoleBasedLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Company not found</h2>
          <Button onClick={() => navigate({ to: '/companies' })}>Back to Companies</Button>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/companies/${companyId}` as any}>
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Inventory Management
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{company.name}</p>
            </div>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Inventory
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalItems}</div>
              <p className="text-xs text-muted-foreground">Product variants tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStock}</div>
              <p className="text-xs text-muted-foreground">Units in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reserved Stock</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalReserved}</div>
              <p className="text-xs text-muted-foreground">Units reserved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</div>
              <p className="text-xs text-muted-foreground">Items need attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</div>
              <p className="text-xs text-muted-foreground">Items unavailable</p>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Inventory Items</CardTitle>
                <CardDescription>
                  Manage stock levels across all locations
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search inventory..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {inventoryLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <InventoryTable
                inventory={filteredInventory}
                onAdjustStock={handleAdjustStock}
                onReserveStock={handleReserveStock}
                onViewMovements={handleViewMovements}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <StockAdjustmentDialog
        inventory={selectedInventory}
        open={adjustDialogOpen}
        onOpenChange={setAdjustDialogOpen}
      />
      <StockReservationDialog
        inventory={selectedInventory}
        open={reserveDialogOpen}
        onOpenChange={setReserveDialogOpen}
      />
      <InventoryMovementsDialog
        inventory={selectedInventory}
        open={movementsDialogOpen}
        onOpenChange={setMovementsDialogOpen}
      />
      <CreateInventoryDialog
        companyId={companyIdNum}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />
    </RoleBasedLayout>
  )
}

