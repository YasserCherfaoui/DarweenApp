import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ProductSearch } from '@/components/pos/ProductSearch'
import type {
  ProductVariant,
  Product,
  SupplierBillItemRequest,
  CreateSupplierBillRequest,
  UpdateSupplierBillRequest,
  SupplierBillItem,
} from '@/types/api'

const billFormSchema = z.object({
  notes: z.string().optional(),
  paid_amount: z.number().min(0).optional(),
})

type BillFormValues = z.infer<typeof billFormSchema>

interface SupplierBillFormProps {
  companyId: number
  supplierId: number
  initialData?: {
    items?: SupplierBillItem[]
    notes?: string
    paid_amount?: number
  }
  onSubmit: (data: CreateSupplierBillRequest | UpdateSupplierBillRequest) => void
  isLoading?: boolean
  submitLabel?: string
  isEdit?: boolean
}

interface CartItem extends SupplierBillItemRequest {
  id?: number
  name?: string
  sku?: string
}

export function SupplierBillForm({
  companyId,
  supplierId,
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Create Bill',
  isEdit = false,
}: SupplierBillFormProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>(
    initialData?.items?.map((item) => ({
      id: item.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      unit_cost: item.unit_cost,
    })) || []
  )

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billFormSchema),
    defaultValues: {
      notes: initialData?.notes || '',
      paid_amount: initialData?.paid_amount || 0,
    },
  })

  const handleAddToCart = (variant: ProductVariant & { product?: Product }, quantity: number) => {
    // For supplier bills, we need unit cost instead of retail price
    // You might want to use supplier_cost from product if available, or let user input
    const existingIndex = cartItems.findIndex(
      (item) => item.product_variant_id === variant.id
    )

    if (existingIndex >= 0) {
      const newItems = [...cartItems]
      newItems[existingIndex].quantity += quantity
      setCartItems(newItems)
    } else {
      // Use supplier cost if available, otherwise use wholesale price, or 0
      const unitCost =
        variant.product?.supplier_cost ||
        variant.wholesale_price ||
        variant.product?.base_wholesale_price ||
        0

      setCartItems([
        ...cartItems,
        {
          product_variant_id: variant.id,
          quantity,
          unit_cost: unitCost,
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

  const handleUpdateUnitCost = (index: number, unitCost: number) => {
    const newItems = [...cartItems]
    newItems[index].unit_cost = unitCost
    setCartItems(newItems)
  }


  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_cost,
    0
  )

  const handleSubmit = (values: BillFormValues) => {
    if (cartItems.length === 0) {
      form.setError('root', {
        message: 'Please add at least one item to the bill',
      })
      return
    }

    const data: CreateSupplierBillRequest | UpdateSupplierBillRequest = {
      supplier_id: supplierId,
      items: cartItems.map(({ id, name, sku, ...item }) => item),
      notes: values.notes,
      ...(isEdit ? {} : { paid_amount: values.paid_amount || 0 }),
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
                <CardTitle>Add Products</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductSearch
                  companyId={companyId}
                  onAddToCart={handleAddToCart}
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
                            <label className="text-sm">Cost:</label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={item.unit_cost}
                              onChange={(e) =>
                                handleUpdateUnitCost(
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
                              ${(item.quantity * item.unit_cost).toFixed(2)}
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

                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="paid_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Paid Amount (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value) || 0)
                            }
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription>
                          Amount paid at bill creation (defaults to 0)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="flex justify-between border-t pt-2">
                  <span>Pending:</span>
                  <span className="font-bold text-red-600">
                    ${(totalAmount - (form.watch('paid_amount') || 0)).toFixed(2)}
                  </span>
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
              disabled={isLoading || cartItems.length === 0}
            >
              {isLoading ? 'Saving...' : submitLabel}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}


