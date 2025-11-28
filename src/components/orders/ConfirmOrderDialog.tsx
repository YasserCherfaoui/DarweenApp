import { useState, useEffect, useMemo, useRef } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown } from 'lucide-react'
import type { Order, ConfirmOrderRequest, ConfirmOrderItemRequest, OrderItem } from '@/types/api'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import { useYalidineWilayas, useYalidineCommunes, useYalidineCenters } from '@/hooks/queries/use-yalidine-api'
import { useYalidineConfigs } from '@/hooks/queries/use-yalidine-configs'
import { useDeliveryFee } from '@/hooks/queries/use-orders'
import { useProducts } from '@/hooks/queries/use-products'
import type { Product, ProductVariant } from '@/types/api'

interface VariantSelectorItemProps {
  index: number
  item: ConfirmOrderItemRequest
  orderItem: OrderItem
  selectedVariant: (ProductVariant & { product?: Product }) | null | undefined
  allVariants: Array<ProductVariant & { product?: Product }>
  onSelectVariant: (variant: ProductVariant & { product?: Product }) => void
  onUpdateQuantity: (value: number) => void
  onUpdatePrice: (value: number) => void
}

function VariantSelectorItem({
  index: _index,
  item,
  orderItem,
  selectedVariant,
  allVariants,
  onSelectVariant,
  onUpdateQuantity,
  onUpdatePrice,
}: VariantSelectorItemProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const getVariantDisplayValue = (variant: (ProductVariant & { product?: Product }) | null | undefined) => {
    if (!variant) {
      if (orderItem.is_snapshot) {
        // Show product name and variant name if available from webhook
        if (orderItem.product_name) {
          const display = orderItem.variant_name
            ? `${orderItem.product_name} - ${orderItem.variant_name}`
            : orderItem.product_name
          if (orderItem.sku) {
            return `${display} (${orderItem.sku})`
          }
          return display
        }
        return `Variant Snapshot #${orderItem.product_variant_id || 'N/A'}`
      }
      return 'Select variant...'
    }
    return variant.sku || 'No SKU'
  }

  const handleVariantSelect = (value: string) => {
    const variant = allVariants.find((v) => v.sku === value)
    if (variant) {
      onSelectVariant(variant)
      setComboboxOpen(false)
    }
  }

  return (
    <div className="flex items-end gap-4 p-4 border rounded-md">
      <div className="flex-1">
        <Label>Product Variant <span className="text-red-500">*</span></Label>
        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              aria-expanded={comboboxOpen}
              className="w-full justify-between mt-1"
            >
              <span className="truncate">
                {getVariantDisplayValue(selectedVariant)}
              </span>
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[600px] p-0">
            <Command>
              <CommandInput placeholder="Search variant by SKU..." />
              <CommandList>
                <CommandEmpty>No variant found.</CommandEmpty>
                <CommandGroup>
                  {allVariants.map((variant) => {
                    if (!variant.sku) return null
                    return (
                      <CommandItem
                        key={variant.id}
                        value={variant.sku}
                        onSelect={handleVariantSelect}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Check
                            className={cn(
                              'h-4 w-4',
                              selectedVariant?.id === variant.id
                                ? 'opacity-100'
                                : 'opacity-0'
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium font-mono truncate">
                              {variant.sku}
                            </div>
                            {variant.product && (
                              <div className="text-xs text-gray-500 truncate">
                                {variant.product.name}
                                {variant.name && ` - ${variant.name}`}
                              </div>
                            )}
                          </div>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-32">
        <Label>Quantity <span className="text-red-500">*</span></Label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={item.confirmed_quantity ?? orderItem.quantity}
          onChange={(e) => onUpdateQuantity(parseFloat(e.target.value) || 0)}
          required
        />
      </div>
      <div className="w-32">
        <Label>Price <span className="text-red-500">*</span></Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={item.confirmed_price ?? orderItem.price}
          onChange={(e) => onUpdatePrice(parseFloat(e.target.value) || 0)}
          required
        />
      </div>
    </div>
  )
}

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
  const [shippingProvider, setShippingProvider] = useState<'yalidine' | 'my_delivery'>('yalidine')
  const [deliveryType, setDeliveryType] = useState<'home' | 'stop_desk'>('home')
  const [shippingWilayaId, setShippingWilayaId] = useState<number | undefined>()
  const [shippingWilayaName, setShippingWilayaName] = useState<string>('')
  const [fromWilayaId, setFromWilayaId] = useState<number | undefined>()
  const [communeId, setCommuneId] = useState<number | undefined>()
  const [centerId, setCenterId] = useState<number | undefined>()
  const [secondDeliveryCost, setSecondDeliveryCost] = useState(0)
  const deliveryFeeInitializedRef = useRef(false)
  const defaultFromWilayaIdSetRef = useRef(false)

  // Customer details state
  const [customerFullName, setCustomerFullName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerPhone2, setCustomerPhone2] = useState('')
  const [customerAddress, setCustomerAddress] = useState('')
  const [_customerState, setCustomerState] = useState('')
  const [customerComments, setCustomerComments] = useState('')
  const [discount, setDiscount] = useState(0)

  const [items, setItems] = useState<ConfirmOrderItemRequest[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch Yalidine data
  const { data: wilayasData } = useYalidineWilayas(companyId)
  const { data: communesData } = useYalidineCommunes(companyId, shippingWilayaId)
  const { data: _centersData } = useYalidineCenters(companyId, shippingWilayaId)
  const { data: yalidineConfigs } = useYalidineConfigs(companyId)
  const defaultYalidineConfig = useMemo(() => {
    return yalidineConfigs?.find((config) => config.is_default && config.is_active)
  }, [yalidineConfigs])

  // Fetch products for variant information
  const { data: productsData } = useProducts(companyId, { page: 1, limit: 1000 })
  
  // Build all variants list - memoized to prevent unnecessary re-renders
  const allVariants = useMemo(() => {
    const variants: Array<ProductVariant & { product?: Product }> = []
    if (productsData?.data) {
      productsData.data.forEach((product: Product) => {
        if (product.variants && product.variants.length > 0) {
          product.variants.forEach((variant) => {
            if (variant.is_active) {
              variants.push({ ...variant, product })
            }
          })
        }
      })
    }
    return variants
  }, [productsData])

  // Fetch delivery fee using React Query
  const { data: deliveryFeeData, isLoading: loadingDeliveryFee } = useDeliveryFee(
    companyId,
    {
      provider: shippingProvider,
      deliveryType,
      communeId,
      centerId,
      fromWilayaId,
      shippingWilayaId,
    }
  )

  const firstDeliveryCost = deliveryFeeData?.fee || 0

  // Initialize all fields from order when it changes
  useEffect(() => {
    if (order) {
      // Initialize items from order
      const initialItems: ConfirmOrderItemRequest[] = order.items.map((item) => ({
        id: item.id,
        confirmed_quantity: item.confirmed_quantity ?? item.quantity,
        confirmed_price: item.confirmed_price ?? item.price,
      }))
      setItems(initialItems)
      
      // Initialize shipping fields
      setShippingProvider((order.shipping_provider === 'yalidine' || order.shipping_provider === 'my_delivery') ? order.shipping_provider : 'yalidine')
      setDeliveryType(order.delivery_type || 'home')
      setCommuneId(order.commune_id)
      setCenterId(order.center_id)
      setSecondDeliveryCost(order.second_delivery_cost || 0)
      
      // Initialize customer details
      setCustomerFullName(order.customer_full_name || '')
      setCustomerPhone(order.customer_phone || '')
      setCustomerPhone2(order.customer_phone2 || '')
      setCustomerAddress(order.customer_address || '')
      setCustomerState(order.customer_state || '')
      setCustomerComments(order.customer_comments || '')
      setDiscount(order.discount || 0)
      
      // Try to find shipping wilaya ID from customer_state
      if (order.customer_state && wilayasData?.data) {
        const matchingWilaya = wilayasData.data.find(
          (w) => w.name.toLowerCase() === order.customer_state.toLowerCase()
        )
        if (matchingWilaya) {
          setShippingWilayaId(matchingWilaya.id)
          setShippingWilayaName(matchingWilaya.name)
        }
      }
      
      // Reset delivery fee initialization
      deliveryFeeInitializedRef.current = false
    }
  }, [order, wilayasData])

  // Set default from_wilaya_id from Yalidine config (only once)
  const defaultFromWilayaId = useMemo(() => {
    return defaultYalidineConfig?.from_wilaya_id
  }, [defaultYalidineConfig])
  
  useEffect(() => {
    // Only set once, and only if we have a valid value and haven't set it yet
    if (defaultFromWilayaId && !defaultFromWilayaIdSetRef.current && (!fromWilayaId || isNaN(fromWilayaId))) {
      setFromWilayaId(defaultFromWilayaId)
      defaultFromWilayaIdSetRef.current = true
    }
  }, [defaultFromWilayaId, fromWilayaId])

  // Sync shipping state to customer state
  useEffect(() => {
    if (shippingWilayaName) {
      setCustomerState(shippingWilayaName)
    }
  }, [shippingWilayaName])

  // Reset commune/center when wilaya changes
  useEffect(() => {
    setCommuneId(undefined)
    setCenterId(undefined)
    setSecondDeliveryCost(0)
    deliveryFeeInitializedRef.current = false
  }, [shippingWilayaId])

  // Sync delivery fee from React Query to editable state (only once when fee becomes available)
  useEffect(() => {
    if (firstDeliveryCost > 0 && !deliveryFeeInitializedRef.current) {
      setSecondDeliveryCost(firstDeliveryCost)
      deliveryFeeInitializedRef.current = true
    } else if (firstDeliveryCost === 0) {
      deliveryFeeInitializedRef.current = false
    }
  }, [firstDeliveryCost])

  const handleSubmit = async () => {
    if (!order) return

    if (!fromWilayaId) {
      toast.error('Please select an origin wilaya')
      return
    }

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

  const calculateTotal = useMemo(() => {
    const productTotal = items.reduce(
      (sum, item) =>
        sum + (item.confirmed_quantity ?? 0) * (item.confirmed_price ?? 0),
      0
    )
    return productTotal + secondDeliveryCost - discount
  }, [items, secondDeliveryCost, discount])

  const wilayas = wilayasData?.data || []
  const communes = communesData?.data || []

  if (!order) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="full" className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Order #{order.id}</DialogTitle>
          <DialogDescription>
            Review and update order details before confirming
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Main sections in flex layout */}
          <div className="flex gap-6">
            {/* Left column: Shipping */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Shipping Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping</CardTitle>
                  <CardDescription>
                    Select shipping provider and delivery details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>
                        Shipping Provider <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="shipping_provider_yalidine"
                            name="shipping_provider"
                            value="yalidine"
                            checked={shippingProvider === 'yalidine'}
                            onChange={(e) => setShippingProvider(e.target.value as 'yalidine')}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="shipping_provider_yalidine" className="font-normal cursor-pointer">
                            Yalidine
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="shipping_provider_my_delivery"
                            name="shipping_provider"
                            value="my_delivery"
                            checked={shippingProvider === 'my_delivery'}
                            onChange={(e) => setShippingProvider(e.target.value as 'yalidine' | 'my_delivery')}
                            className="h-4 w-4 text-primary focus:ring-primary"
                            disabled
                          />
                          <Label htmlFor="shipping_provider_my_delivery" className="font-normal cursor-pointer">
                            My Delivery Companies
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>
                        Delivery Type <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="delivery_type_home"
                            name="delivery_type"
                            value="home"
                            checked={deliveryType === 'home'}
                            onChange={(e) => {
                              setDeliveryType(e.target.value as 'home' | 'stop_desk')
                              setCommuneId(undefined)
                              setCenterId(undefined)
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="delivery_type_home" className="font-normal cursor-pointer">
                            Home
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="delivery_type_stop_desk"
                            name="delivery_type"
                            value="stop_desk"
                            checked={deliveryType === 'stop_desk'}
                            onChange={(e) => {
                              setDeliveryType(e.target.value as 'home' | 'stop_desk')
                              setCommuneId(undefined)
                              setCenterId(undefined)
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="delivery_type_stop_desk" className="font-normal cursor-pointer">
                            Stop Desk
                          </Label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="commune">
                        Select Commune <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={communeId?.toString() || ''}
                        onValueChange={(value) => setCommuneId(parseInt(value))}
                        disabled={!shippingWilayaId}
                      >
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="Select a commune" />
                        </SelectTrigger>
                        <SelectContent>
                          {communes.map((commune) => (
                            <SelectItem key={commune.id} value={commune.id.toString()}>
                              {commune.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle column: Customer Details */}
            <div className="flex-1 min-w-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Details</CardTitle>
                  <CardDescription>
                    Enter customer information for this order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="customer_full_name">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="customer_full_name"
                        value={customerFullName}
                        onChange={(e) => setCustomerFullName(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_phone">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="customer_phone"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_phone2">Phone Number 2</Label>
                      <Input
                        id="customer_phone2"
                        value={customerPhone2}
                        onChange={(e) => setCustomerPhone2(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_address">
                        Address <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="customer_address"
                        rows={2}
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customer_state">
                        State <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={shippingWilayaId?.toString() || ''}
                        onValueChange={(value) => {
                          const wilayaId = parseInt(value)
                          const wilaya = wilayas.find((w) => w.id === wilayaId)
                          setShippingWilayaId(wilayaId)
                          const wilayaName = wilaya?.name || ''
                          setShippingWilayaName(wilayaName)
                          setCustomerState(wilayaName)
                        }}
                      >
                        <SelectTrigger className="w-full mt-2">
                          <SelectValue placeholder="Select a wilaya" />
                        </SelectTrigger>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                              {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="customer_comments">Client Comments</Label>
                      <Textarea
                        id="customer_comments"
                        rows={2}
                        value={customerComments}
                        onChange={(e) => setCustomerComments(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: Order Items and Summary */}
            <div className="flex-1 min-w-0 space-y-6">
              {/* Order Items */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    Review and update order items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {items.map((item, index) => {
                    const orderItem = order.items.find((i) => i.id === item.id)
                    if (!orderItem) return null

                    // Find the selected variant
                    const selectedVariant = orderItem.product_variant_id
                      ? allVariants.find((v) => v.id === orderItem.product_variant_id)
                      : null


                    return (
                      <VariantSelectorItem
                        key={item.id}
                        index={index}
                        item={item}
                        orderItem={orderItem}
                        selectedVariant={selectedVariant}
                        allVariants={allVariants}
                        onSelectVariant={(_variant) => {
                          // Note: In confirm dialog, we typically don't change the variant, just display it
                          // But we'll keep the structure for consistency
                        }}
                        onUpdateQuantity={(value) => {
                          const newItems = [...items]
                          newItems[index].confirmed_quantity = value
                          setItems(newItems)
                        }}
                        onUpdatePrice={(value) => {
                          const newItems = [...items]
                          newItems[index].confirmed_price = value
                          setItems(newItems)
                        }}
                      />
                    )
                  })}
                </CardContent>
              </Card>

              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Product Total:</span>
                    <span className="font-medium">
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
                  <div>
                    <Label htmlFor="delivery_cost">
                      Delivery Cost <span className="text-red-500">*</span>
                      {loadingDeliveryFee && (
                        <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
                      )}
                    </Label>
                    <Input
                      id="delivery_cost"
                      type="number"
                      step="0.01"
                      min="0"
                      value={secondDeliveryCost}
                      onChange={(e) => setSecondDeliveryCost(parseFloat(e.target.value) || 0)}
                      disabled={loadingDeliveryFee}
                    />
                    {firstDeliveryCost > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Suggested fee: {firstDeliveryCost.toFixed(2)} DZD
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="discount">Discount</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-lg">
                    <span>Total:</span>
                    <span>{calculateTotal.toFixed(2)} DZD</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

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

