import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProductSearch } from '@/components/pos/ProductSearch'
import type {
  ProductVariant,
  Product,
  WarehouseBillItemRequest,
  CreateExitBillRequest,
  Franchise,
  ProductVariantSearchResponse,
} from '@/types/api'
import { useCompanyFranchises } from '@/hooks/queries/use-franchises'

const exitBillFormSchema = z.object({
  franchise_id: z.number().min(1, 'Please select a franchise'),
  notes: z.string().optional(),
})

type ExitBillFormValues = z.infer<typeof exitBillFormSchema>

interface ExitBillFormProps {
  companyId: number
  onSubmit: (data: CreateExitBillRequest) => void
  isLoading?: boolean
}

interface CartItem extends WarehouseBillItemRequest {
  id?: number
  name?: string
  sku?: string
}

export function ExitBillForm({
  companyId,
  onSubmit,
  isLoading,
}: ExitBillFormProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<number | null>(null)

  const { data: franchises } = useCompanyFranchises(companyId)

  const form = useForm<ExitBillFormValues>({
    resolver: zodResolver(exitBillFormSchema),
    defaultValues: {
      notes: '',
    },
  })

  const handleAddToCart = (variant: ProductVariant & { product?: Product }, quantity: number) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.product_variant_id === variant.id
    )

    if (existingIndex >= 0) {
      const newItems = [...cartItems]
      newItems[existingIndex].quantity += quantity
      setCartItems(newItems)
    } else {
      // Get pricing from search result if available (contains franchise pricing)
      const searchResult = (variant as any)._searchResult as ProductVariantSearchResponse | undefined
      let unitPrice: number
      
      if (searchResult) {
        // Use effective wholesale price from search result (includes franchise override)
        unitPrice = searchResult.effective_wholesale_price
      } else {
        // Fall back to variant/product wholesale prices if no search result
        unitPrice =
          variant.wholesale_price ??
          variant.product?.base_wholesale_price ??
          0
      }

      setCartItems([
        ...cartItems,
        {
          product_variant_id: variant.id,
          quantity,
          unit_price: unitPrice,
          name: `${variant.product?.name} - ${variant.name}`,
          sku: variant.sku,
        },
      ])
    }
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index)
      return
    }
    const newItems = [...cartItems]
    newItems[index].quantity = quantity
    setCartItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  const handleUpdateUnitPrice = (index: number, unitPrice: number) => {
    const newItems = [...cartItems]
    newItems[index].unit_price = unitPrice
    setCartItems(newItems)
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  const handleSubmit = (values: ExitBillFormValues) => {
    if (cartItems.length === 0) {
      form.setError('root', {
        message: 'Please add at least one item to the bill',
      })
      return
    }

    if (!selectedFranchiseId) {
      form.setError('franchise_id', {
        message: 'Please select a franchise',
      })
      return
    }

    const data: CreateExitBillRequest = {
      franchise_id: selectedFranchiseId,
      items: cartItems.map(({ id, name, sku, ...item }) => item),
      notes: values.notes,
    }

    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Product Search and Items */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Franchise</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="franchise_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Franchise</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const franchiseId = parseInt(value)
                          setSelectedFranchiseId(franchiseId)
                          field.onChange(franchiseId)
                        }}
                        value={field.value?.toString()}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a franchise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {(franchises || []).map((franchise: Franchise) => (
                            <SelectItem
                              key={franchise.id}
                              value={franchise.id.toString()}
                            >
                              {franchise.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductSearch
                  companyId={companyId}
                  franchiseId={selectedFranchiseId}
                  onAddToCart={handleAddToCart}
                  disabled={!selectedFranchiseId}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bill Items</CardTitle>
              </CardHeader>
              <CardContent>
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No items added. Search and add products above.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {cartItems.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {item.name || `Product Variant #${item.product_variant_id}`}
                          </div>
                          {item.sku && (
                            <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm">Qty:</label>
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleUpdateQuantity(index, parseInt(e.target.value) || 1)
                              }
                              className="w-20"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm">Price:</label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_price}
                              onChange={(e) =>
                                handleUpdateUnitPrice(
                                  index,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-24"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="w-32 text-right">
                            <div className="font-semibold">
                              ${(item.quantity * item.unit_price).toFixed(2)}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                            disabled={isLoading}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Totals and Notes */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bill Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about this bill..."
                          rows={4}
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isLoading || cartItems.length === 0 || !selectedFranchiseId}
            >
              {isLoading ? 'Creating...' : 'Create Exit Bill'}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

