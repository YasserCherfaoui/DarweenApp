import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2, Plus, Save, X } from 'lucide-react'
import { ProductSearch } from '@/components/pos/ProductSearch'
import type {
  WarehouseBill,
  UpdateExitBillItemsRequest,
  UpdateExitBillItemRequest,
  ProductVariant,
  Product,
  ProductVariantSearchResponse,
} from '@/types/api'
import { useUpdateExitBillItems } from '@/hooks/queries/use-warehouse-bills'

interface EditExitBillItemsProps {
  bill: WarehouseBill
  companyId: number
  franchiseId: number
  onSave: () => void
  onCancel: () => void
}

interface EditableItem extends UpdateExitBillItemRequest {
  id?: number
  name?: string
  sku?: string
  product_name?: string
  variant_name?: string
  variant_sku?: string
}

export function EditExitBillItems({
  bill,
  companyId,
  franchiseId,
  onSave,
  onCancel,
}: EditExitBillItemsProps) {
  const [items, setItems] = useState<EditableItem[]>(
    (bill.items || []).map((item) => ({
      id: item.id,
      product_variant_id: item.product_variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      name: item.variant_name || item.product_name || `Variant #${item.product_variant_id}`,
      sku: item.variant_sku,
      product_name: item.product_name,
      variant_name: item.variant_name,
      variant_sku: item.variant_sku,
    }))
  )
  const [changeReason, setChangeReason] = useState('')
  const [showProductSearch, setShowProductSearch] = useState(false)

  const updateItems = useUpdateExitBillItems()

  const handleAddToCart = (variant: ProductVariant & { product?: Product }, quantity: number) => {
    const existingIndex = items.findIndex(
      (item) => item.product_variant_id === variant.id
    )

    if (existingIndex >= 0) {
      const newItems = [...items]
      newItems[existingIndex].quantity += quantity
      setItems(newItems)
    } else {
      const searchResult = (variant as any)._searchResult as ProductVariantSearchResponse | undefined
      let unitPrice: number
      
      if (searchResult) {
        unitPrice = searchResult.effective_wholesale_price
      } else {
        unitPrice =
          variant.wholesale_price ??
          variant.product?.base_wholesale_price ??
          0
      }

      setItems([
        ...items,
        {
          product_variant_id: variant.id,
          quantity,
          unit_price: unitPrice,
          name: `${variant.product?.name} - ${variant.name}`,
          sku: variant.sku,
          product_name: variant.product?.name,
          variant_name: variant.name,
          variant_sku: variant.sku,
        },
      ])
    }
    setShowProductSearch(false)
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(index)
      return
    }
    const newItems = [...items]
    newItems[index].quantity = quantity
    setItems(newItems)
  }

  const handleUpdateUnitPrice = (index: number, unitPrice: number) => {
    const newItems = [...items]
    newItems[index].unit_price = unitPrice
    setItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  )

  const handleSave = async () => {
    if (items.length === 0) {
      alert('Please add at least one item to the bill')
      return
    }

    const updateRequest: UpdateExitBillItemsRequest = {
      items: items.map(({ id, name, sku, product_name, variant_name, variant_sku, ...item }) => ({
        id: id ? id : undefined,
        ...item,
      })),
      change_reason: changeReason || undefined,
    }

    try {
      const updatedBill = await updateItems.mutateAsync({
        companyId,
        billId: bill.id,
        data: updateRequest,
      })
      if (updatedBill) {
        onSave()
      }
    } catch (error) {
      // Error is handled by the hook (toast notification)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit Bill Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Product Search */}
            {showProductSearch && (
              <Card className="border-blue-200">
                <CardContent className="pt-6">
                  <ProductSearch
                    companyId={companyId}
                    franchiseId={franchiseId}
                    onAddToCart={handleAddToCart}
                  />
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowProductSearch(false)}
                  >
                    Close Search
                  </Button>
                </CardContent>
              </Card>
            )}

            {!showProductSearch && (
              <Button
                variant="outline"
                onClick={() => setShowProductSearch(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            )}

            {/* Items Table */}
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        No items. Click "Add Item" to add products.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {item.variant_name || item.name || `Variant #${item.product_variant_id}`}
                            </div>
                            {item.product_name && item.variant_name && (
                              <div className="text-sm text-gray-500">
                                Product: {item.product_name}
                              </div>
                            )}
                            {item.variant_sku && (
                              <div className="text-sm text-gray-500">
                                SKU: {item.variant_sku}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(index, parseInt(e.target.value) || 0)
                            }
                            className="w-20 ml-auto"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleUpdateUnitPrice(index, parseFloat(e.target.value) || 0)
                            }
                            className="w-24 ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          ${(item.quantity * item.unit_price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Total */}
            <div className="flex justify-end">
              <div className="text-lg font-semibold">
                Total: ${totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Change Reason */}
            <div>
              <Label htmlFor="change_reason">Change Reason (Optional)</Label>
              <Textarea
                id="change_reason"
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder="Explain why you're making these changes..."
                rows={2}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onCancel} disabled={updateItems.isPending}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateItems.isPending || items.length === 0}>
                <Save className="h-4 w-4 mr-2" />
                {updateItems.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

