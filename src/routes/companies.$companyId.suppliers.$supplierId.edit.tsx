import { createRoute, useNavigate, useParams } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { SupplierForm } from '@/components/suppliers/SupplierForm'
import { useSupplier, useUpdateSupplier } from '@/hooks/queries/use-suppliers'
import { ArrowLeft } from 'lucide-react'
import { rootRoute } from '@/main'

export const EditSupplierRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/suppliers/$supplierId/edit',
  component: EditSupplierPage,
})

function EditSupplierPage() {
  const navigate = useNavigate()
  const { companyId, supplierId } = useParams({ from: '/companies/$companyId/suppliers/$supplierId/edit' })
  const companyIdNum = parseInt(companyId)
  const supplierIdNum = parseInt(supplierId)
  
  const { data: supplier, isLoading } = useSupplier(companyIdNum, supplierIdNum)
  const updateSupplier = useUpdateSupplier(companyIdNum, supplierIdNum)

  const handleSubmit = async (data: { name: string; contact_person?: string; email?: string; phone?: string }) => {
    const result = await updateSupplier.mutateAsync(data)
    if (result.success) {
      navigate({ to: `/companies/${companyId}/suppliers/${supplierId}` })
    }
  }

  if (isLoading) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  if (!supplier) {
    return (
      <RoleBasedLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Supplier not found</h3>
              <p className="text-gray-500 mb-6">
                The supplier you're trying to edit doesn't exist or has been deleted.
              </p>
              <Button onClick={() => navigate({ to: `/companies/${companyId}/suppliers` })}>
                Back to Suppliers
              </Button>
            </div>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/suppliers/${supplierId}` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Supplier Details
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Edit Supplier
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Update information for {supplier.name}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Supplier Information</CardTitle>
            <CardDescription>
              Update the details for this supplier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SupplierForm
              initialData={supplier}
              onSubmit={handleSubmit}
              isLoading={updateSupplier.isPending}
              submitLabel="Save Changes"
            />
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}



