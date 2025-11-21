import { createRoute } from '@tanstack/react-router'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Loading } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useCustomers, useCreateCustomer, useUpdateCustomer } from '@/hooks/queries/use-pos-queries'
import { CustomerForm } from '@/components/pos/CustomerForm'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { Customer } from '@/types/api'
import { rootRoute } from '@/main'

export const POSCustomersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/pos/customers',
  component: CustomersPage,
})

function CustomersPage() {
  const { companyId } = POSCustomersRoute.useParams()
  const [open, setOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>()

  const { data: customersData, isLoading } = useCustomers(Number(companyId))
  const createCustomer = useCreateCustomer()
  const updateCustomer = useUpdateCustomer()

  const handleCreate = (data: any) => {
    createCustomer.mutate(
      { companyId: Number(companyId), data },
      {
        onSuccess: () => {
          setOpen(false)
        },
      }
    )
  }

  const handleUpdate = (data: any) => {
    if (!editingCustomer) return
    updateCustomer.mutate(
      {
        companyId: Number(companyId),
        customerId: editingCustomer.id,
        data,
      },
      {
        onSuccess: () => {
          setOpen(false)
          setEditingCustomer(undefined)
        },
      }
    )
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">Manage your customer database</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCustomer(undefined)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </DialogTitle>
            </DialogHeader>
            <CustomerForm
              customer={editingCustomer}
              onSubmit={editingCustomer ? handleUpdate : handleCreate}
              onCancel={() => {
                setOpen(false)
                setEditingCustomer(undefined)
              }}
              isLoading={createCustomer.isPending || updateCustomer.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Customers</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading fullScreen={false} size="md" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Total Purchases</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customersData?.data?.map((customer: Customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>${customer.total_purchases.toFixed(2)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingCustomer(customer)
                          setOpen(true)
                        }}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      </div>
    </RoleBasedLayout>
  )
}

