import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2, Plus, Minus } from 'lucide-react'
import type { SaleItemRequest } from '@/types/api'

interface CartItem extends SaleItemRequest {
  name: string
  sku: string
}

interface CartProps {
  items: CartItem[]
  onUpdateQuantity: (index: number, quantity: number) => void
  onRemoveItem: (index: number) => void
  onUpdateDiscount: (index: number, discount: number) => void
  taxRate?: number
}

export function Cart({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onUpdateDiscount,
  taxRate = 0,
}: CartProps) {
  const subtotal = items.reduce((sum, item) => {
    const itemTotal = item.quantity * item.unit_price - (item.discount_amount || 0)
    return sum + itemTotal
  }, 0)

  const taxAmount = subtotal * taxRate
  const total = subtotal + taxAmount

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Cart ({items.length} items)</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Cart is empty. Search and add products to start a sale.
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={index}
                className="p-3 border rounded-lg space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-500">{item.sku}</div>
                    <div className="text-sm font-semibold">
                      ${item.unit_price.toFixed(2)} each
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveItem(index)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(index, Math.max(1, item.quantity - 1))}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      onUpdateQuantity(index, Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(index, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.discount_amount || 0}
                    onChange={(e) =>
                      onUpdateDiscount(index, parseFloat(e.target.value) || 0)
                    }
                    placeholder="Discount"
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-500">discount</span>
                </div>

                <div className="text-right font-semibold">
                  Total: ${((item.quantity * item.unit_price) - (item.discount_amount || 0)).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            {taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span>Tax ({(taxRate * 100).toFixed(1)}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

