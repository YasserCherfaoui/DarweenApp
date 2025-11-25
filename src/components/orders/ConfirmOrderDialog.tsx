import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import type { Order, ConfirmOrderRequest, ConfirmOrderItemRequest } from '@/types/api'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import { useYalidineWilayas, useYalidineCommunes, useYalidineCenters } from '@/hooks/queries/use-yalidine-api'

interface ConfirmOrderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: Order | null
  companyId: number
  onSuccess?: () => void
}

export function ConfirmOrderDialog({
  open,
  onOpenChange,
  order,
  companyId,
  onSuccess,
}: ConfirmOrderDialogProps) {
  const [shippingProvider, setShippingProvider] = useState('yalidine')
  const [deliveryType, setDeliveryType] = useState<'home' | 'stop_desk'>('home')
  const [shippingWilayaId, setShippingWilayaId] = useState<number | undefined>()
  const [shippingWilayaName, setShippingWilayaName] = useState<string>('')
  const [communeId, setCommuneId] = useState<number | undefined>()
  const [centerId, setCenterId] = useState<number | undefined>()
  const [secondDeliveryCost, setSecondDeliveryCost] = useState(0)
  const [firstDeliveryCost, setFirstDeliveryCost] = useState(0)
  const [loadingFee, setLoadingFee] = useState(false)
  const [items, setItems] = useState<ConfirmOrderItemRequest[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Yalidine data
  const { data: wilayasData } = useYalidineWilayas(companyId)
  const { data: communesData } = useYalidineCommunes(companyId, shippingWilayaId)
  const { data: centersData } = useYalidineCenters(companyId, shippingWilayaId)

  useEffect(() => {
    if (order) {
      // Initialize items from order
      const initialItems: ConfirmOrderItemRequest[] = order.items.map((item) => ({
        id: item.id,
        confirmed_quantity: item.confirmed_quantity ?? item.quantity,
        confirmed_price: item.confirmed_price ?? item.price,
      }))
      setItems(initialItems)
      setSecondDeliveryCost(order.second_delivery_cost || 0)
    }
  }, [order])

  const fetchDeliveryFee = async () => {
    if (!order) return

    setLoadingFee(true)
    try {
      // This would call an endpoint to get delivery fee
      // For now, we'll use a placeholder
      // In production, this would call: /api/v1/companies/:companyId/orders/:orderId/delivery-fee
      // with commune_id or center_id
      const fee = 500 // Placeholder
      setFirstDeliveryCost(fee)
      setSecondDeliveryCost(fee)
    } catch (error) {
      toast.error('Failed to fetch delivery fee')
    } finally {
      setLoadingFee(false)
    }
  }

  // Reset commune/center when wilaya changes
  useEffect(() => {
    setCommuneId(undefined)
    setCenterId(undefined)
  }, [shippingWilayaId])

  useEffect(() => {
    if (deliveryType === 'home' && communeId) {
      fetchDeliveryFee()
    } else if (deliveryType === 'stop_desk' && centerId) {
      fetchDeliveryFee()
    }
  }, [deliveryType, communeId, centerId])

  const handleSubmit = async () => {
    if (!order) return

    if (deliveryType === 'home' && !communeId) {
      toast.error('Please select a commune')
      return
    }

    if (deliveryType === 'stop_desk' && !centerId) {
      toast.error('Please select a center')
      return
    }

    setIsSubmitting(true)
    try {
      const request: ConfirmOrderRequest = {
        shipping_provider: shippingProvider,
        delivery_type: deliveryType,
        commune_id: deliveryType === 'home' ? communeId : undefined,
        center_id: deliveryType === 'stop_desk' ? centerId : undefined,
        second_delivery_cost: secondDeliveryCost,
        items,
      }

      await apiClient.orders.confirm(companyId, order.id, request)
      toast.success('Order confirmed successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const calculateTotal = () => {
    const productTotal = items.reduce(
      (sum, item) =>
        sum + (item.confirmed_quantity ?? 0) * (item.confirmed_price ?? 0),
      0
    )
    return productTotal + secondDeliveryCost - (order?.discount || 0)
  }

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Order #{order.id}</DialogTitle>
          <DialogDescription>
            Configure shipping details and confirm order items
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Shipping Section */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Shipping</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  Shipping Provider <span className="text-red-500">*</span>
                </Label>
                <Select value={shippingProvider} onValueChange={setShippingProvider}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yalidine">Yalidine</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  Delivery Type <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={deliveryType}
                  onValueChange={(value) => {
                    setDeliveryType(value as 'home' | 'stop_desk')
                    setCommuneId(undefined)
                    setCenterId(undefined)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="home">Home</SelectItem>
                    <SelectItem value="stop_desk">Stop Desk</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>
                  State (Wilaya) <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={shippingWilayaId?.toString() || ''}
                  onValueChange={(value) => {
                    const wilayaId = parseInt(value)
                    const wilaya = wilayasData?.data?.find((w) => w.id === wilayaId)
                    setShippingWilayaId(wilayaId)
                    setShippingWilayaName(wilaya?.name || '')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select wilaya" />
                  </SelectTrigger>
                  <SelectContent>
                    {wilayasData?.data?.map((wilaya) => (
                      <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                        {wilaya.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {deliveryType === 'home' ? (
                <div>
                  <Label>
                    Commune <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={communeId?.toString() || ''}
                    onValueChange={(value) => setCommuneId(parseInt(value))}
                    disabled={!shippingWilayaId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={shippingWilayaId ? "Select commune" : "Select wilaya first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {communesData?.data?.map((commune) => (
                        <SelectItem key={commune.id} value={commune.id.toString()}>
                          {commune.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div>
                  <Label>
                    Stop Desk <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={centerId?.toString() || ''}
                    onValueChange={(value) => setCenterId(parseInt(value))}
                    disabled={!shippingWilayaId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={shippingWilayaId ? "Select center" : "Select wilaya first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {centersData?.data?.map((center) => (
                        <SelectItem key={center.center_id} value={center.center_id.toString()}>
                          {center.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </Card>

          {/* Delivery Fee */}
          <div>
            <Label>Delivery Fee</Label>
            {firstDeliveryCost > 0 && (
              <p className="text-sm text-gray-500 mb-2">
                Suggested fee: {firstDeliveryCost.toFixed(2)} DZD
              </p>
            )}
            <Input
              type="number"
              step="0.01"
              value={secondDeliveryCost}
              onChange={(e) => setSecondDeliveryCost(parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Order Items */}
          <div>
            <Label>Order Items</Label>
            <div className="space-y-2 mt-2">
              {items.map((item, index) => {
                const orderItem = order.items.find((i) => i.id === item.id)
                if (!orderItem) return null

                return (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        {orderItem.is_snapshot && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded mr-2">
                            Snapshot
                          </span>
                        )}
                        <span>
                          {orderItem.product_variant_id
                            ? `Variant #${orderItem.product_variant_id}`
                            : 'Product from webhook'}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Quantity</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.confirmed_quantity ?? orderItem.quantity}
                          onChange={(e) => {
                            const newItems = [...items]
                            newItems[index].confirmed_quantity = parseFloat(
                              e.target.value
                            )
                            setItems(newItems)
                          }}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Price</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={item.confirmed_price ?? orderItem.price}
                          onChange={(e) => {
                            const newItems = [...items]
                            newItems[index].confirmed_price = parseFloat(e.target.value)
                            setItems(newItems)
                          }}
                        />
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Product Total:</span>
                <span>
                  {items
                    .reduce(
                      (sum, item) =>
                        sum +
                        (item.confirmed_quantity ?? 0) * (item.confirmed_price ?? 0),
                      0
                    )
                    .toFixed(2)}{' '}
                  DZD
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span>{secondDeliveryCost.toFixed(2)} DZD</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>-{order.discount.toFixed(2)} DZD</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-bold text-lg">
                <span>Total:</span>
                <span>{calculateTotal().toFixed(2)} DZD</span>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Confirming...' : 'Confirm Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

