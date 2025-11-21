import { createRoute, Link, useParams, useNavigate } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useSupplier, useSupplierProducts, useDeleteSupplier } from '@/hooks/queries/use-suppliers'
import { useSupplierOutstandingBalance } from '@/hooks/queries/use-supplier-bills'
import { SupplierOutstandingBalanceCard } from '@/components/suppliers/SupplierOutstandingBalanceCard'
import { ArrowLeft, Edit, Trash2, Mail, Phone, User, Package, DollarSign, MapPin, FileText, Receipt } from 'lucide-react'
import { rootRoute } from '@/main'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export const SupplierDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/suppliers/$supplierId',
  component: SupplierDetailPage,
})

function SupplierDetailPage() {
  const navigate = useNavigate()
  const { companyId, supplierId } = useParams({ from: '/companies/$companyId/suppliers/$supplierId' })
  const companyIdNum = parseInt(companyId)
  const supplierIdNum = parseInt(supplierId)
  
  const { data: supplier, isLoading: isLoadingSupplier } = useSupplier(companyIdNum, supplierIdNum)
  const { data: supplierWithProducts, isLoading: isLoadingProducts } = useSupplierProducts(companyIdNum, supplierIdNum)
  const { data: outstandingBalance } = useSupplierOutstandingBalance(companyIdNum, supplierIdNum)
  const deleteSupplier = useDeleteSupplier(companyIdNum)

  const handleDelete = async () => {
    await deleteSupplier.mutateAsync(supplierIdNum)
    navigate({ to: `/companies/${companyId}/suppliers` })
  }

  if (isLoadingSupplier) {
    return (
      <RoleBasedLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  if (!supplier) {
    return (
      <RoleBasedLayout>
        <div className="max-w-4xl mx-auto">
          <Card className="p-12">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Supplier not found</h3>
              <p className="text-gray-500 mb-6">
                The supplier you're looking for doesn't exist or has been deleted.
              </p>
              <Link to={`/companies/${companyId}/suppliers`}>
                <Button>Back to Suppliers</Button>
              </Link>
            </div>
          </Card>
        </div>
      </RoleBasedLayout>
    )
  }

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate({ to: `/companies/${companyId}/suppliers` })}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Suppliers
            </Button>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {supplier.name}
              </h1>
              <Badge variant={supplier.is_active ? 'default' : 'secondary'}>
                {supplier.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to={`/companies/${companyId}/suppliers/${supplierId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Supplier</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{supplier.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Supplier details and contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {supplier.contact_person && (
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Contact Person</p>
                    <p className="text-base">{supplier.contact_person}</p>
                  </div>
                </div>
              )}

              {supplier.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                    <a 
                      href={`mailto:${supplier.email}`}
                      className="text-base hover:text-primary transition-colors"
                    >
                      {supplier.email}
                    </a>
                  </div>
                </div>
              )}

              {supplier.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                    <a 
                      href={`tel:${supplier.phone}`}
                      className="text-base hover:text-primary transition-colors"
                    >
                      {supplier.phone}
                    </a>
                  </div>
                </div>
              )}

              {supplier.address && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                    <p className="text-base">{supplier.address}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Products</p>
                  <p className="text-base">{supplier.product_count}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Balance and Bills Section */}
        <div className="grid gap-6 md:grid-cols-2">
          <SupplierOutstandingBalanceCard
            companyId={companyIdNum}
            supplierId={supplierIdNum}
          />
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Bills Management
              </CardTitle>
              <CardDescription>
                Manage supplier bills and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Create and manage bills from this supplier, track payments, and view payment history.
                  </p>
                </div>
                <Link to={`/companies/${companyId}/suppliers/${supplierId}/bills`}>
                  <Button className="w-full" variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    View All Bills
                  </Button>
                </Link>
                <Link to={`/companies/${companyId}/suppliers/${supplierId}/bills/new`}>
                  <Button className="w-full">
                    <Receipt className="mr-2 h-4 w-4" />
                    Create New Bill
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>Products supplied by {supplier.name}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingProducts ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : supplierWithProducts && supplierWithProducts.products.length > 0 ? (
              <div className="space-y-2">
                {supplierWithProducts.products.map((product) => (
                  <Link
                    key={product.id}
                    to={`/companies/${companyId}/products/${product.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">SKU: {product.sku}</p>
                      </div>
                    </div>
                    {product.supplier_cost && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="font-medium">${product.supplier_cost.toFixed(2)}</span>
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No products linked to this supplier yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}



