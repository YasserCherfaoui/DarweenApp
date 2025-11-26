import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { User, Search, Plus } from 'lucide-react'
import type { Customer } from '@/types/api'
import { useCustomers, useCreateCustomer } from '@/hooks/queries/use-pos-queries'
import { CustomerForm } from './CustomerForm'

interface CustomerSelectorProps {
  companyId: number
  selectedCustomer?: Customer
  onSelectCustomer: (customer: Customer | undefined) => void
}

export function CustomerSelector({
  companyId,
  selectedCustomer,
  onSelectCustomer,
}: CustomerSelectorProps) {
  const [open, setOpen] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const { data: customersData } = useCustomers(companyId)
  const createCustomer = useCreateCustomer()

  const filteredCustomers = customersData?.data?.filter((customer: Customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  const handleCreateCustomer = (data: any) => {
    createCustomer.mutate(
      { companyId, data },
      {
        onSuccess: (customer) => {
          if (customer) {
            onSelectCustomer(customer)
          }
          setOpen(false)
          setShowCreateForm(false)
        },
      }
    )
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Customer (Optional)</label>
      <div className="flex gap-2">
        {selectedCustomer ? (
          <Card className="flex-1">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <div>
                  <div className="font-medium">{selectedCustomer.name}</div>
                  {selectedCustomer.email && (
                    <div className="text-sm text-gray-500">
                      {selectedCustomer.email}
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelectCustomer(undefined)}
              >
                Clear
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex-1">
                <User className="h-4 w-4 mr-2" />
                Select Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {showCreateForm ? 'Create New Customer' : 'Select Customer'}
                </DialogTitle>
              </DialogHeader>
              {showCreateForm ? (
                <CustomerForm
                  onSubmit={handleCreateCustomer}
                  onCancel={() => setShowCreateForm(false)}
                  isLoading={createCustomer.isPending}
                />
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button onClick={() => setShowCreateForm(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      New
                    </Button>
                  </div>

                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {filteredCustomers.map((customer: Customer) => (
                      <Card
                        key={customer.id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => {
                          onSelectCustomer(customer)
                          setOpen(false)
                        }}
                      >
                        <CardContent className="p-3">
                          <div className="font-medium">{customer.name}</div>
                          {customer.email && (
                            <div className="text-sm text-gray-500">
                              {customer.email}
                            </div>
                          )}
                          {customer.phone && (
                            <div className="text-sm text-gray-500">
                              {customer.phone}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}

