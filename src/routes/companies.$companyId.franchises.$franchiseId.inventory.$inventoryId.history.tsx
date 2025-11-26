import { createRoute, useNavigate } from '@tanstack/react-router'
import { useMemo } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryHistoryPage } from '@/components/inventory/InventoryHistoryPage'
import { useFranchiseInventory } from '@/hooks/queries/use-inventory'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const FranchiseInventoryHistoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/franchises/$franchiseId/inventory/$inventoryId/history',
  component: FranchiseInventoryHistoryPage,
})

function FranchiseInventoryHistoryPage() {
  const navigate = useNavigate()
  const { companyId, franchiseId, inventoryId } = FranchiseInventoryHistoryRoute.useParams()
  const companyIdNum = Number(companyId)
  const franchiseIdNum = Number(franchiseId)
  const inventoryIdNum = Number(inventoryId)

  const { data: inventoryList, isLoading } = useFranchiseInventory(franchiseIdNum)

  // Find the specific inventory item
  const inventory = useMemo(() => {
    if (!inventoryList) return null
    return inventoryList.find((item) => item.id === inventoryIdNum) || null
  }, [inventoryList, inventoryIdNum])

  return (
    <RoleBasedLayout>
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              navigate({
                to: '/companies/$companyId/franchises/$franchiseId/inventory' as any,
                params: { companyId, franchiseId } as any,
              })
            }
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : !inventory ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Inventory item not found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                navigate({
                  to: '/companies/$companyId/franchises/$franchiseId/inventory' as any,
                  params: { companyId, franchiseId } as any,
                })
              }
            >
              Back to Inventory
            </Button>
          </div>
        ) : (
          <InventoryHistoryPage inventory={inventory} companyId={companyIdNum} />
        )}
      </div>
    </RoleBasedLayout>
  )
}


