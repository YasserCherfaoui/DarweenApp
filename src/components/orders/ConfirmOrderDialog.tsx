import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useDeliveryFee } from '@/hooks/queries/use-orders'
import { useProducts } from '@/hooks/queries/use-products'
import { useYalidineCenters, useYalidineCommunes, useYalidineWilayas } from '@/hooks/queries/use-yalidine-api'
import { useYalidineConfigs } from '@/hooks/queries/use-yalidine-configs'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import type { ConfirmOrderItemRequest, ConfirmOrderRequest, Order, OrderItem, Product, ProductVariant } from '@/types/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

// Zod schema for order confirmation
// Note: useFieldArray adds a UUID 'id' field automatically - we ignore it completely
// We only track items by product_variant_id, not by numeric IDs
const orderItemSchema = z.object({
  product_variant_id: z.number().optional(),
  confirmed_quantity: z.number().min(0.01, 'Quantity must be greater than 0'),
  confirmed_price: z.number().min(0, 'Price must be positive'),
}).passthrough() // Allow useFieldArray's UUID id field but ignore it

const confirmOrderSchema = z.object({
  shipping_provider: z.enum(['yalidine', 'my_delivery']),
  delivery_type: z.enum(['home', 'stop_desk']),
  from_wilaya_id: z.number().min(1, 'Origin wilaya is required'),
  shipping_wilaya_id: z.number().min(1, 'Shipping wilaya is required'),
  shipping_wilaya_name: z.string().optional(),
  commune_id: z.number().optional(),
  center_id: z.number().optional(),
  second_delivery_cost: z.number().min(0, 'Delivery cost must be positive'),
  customer_full_name: z.string().min(1, 'Full name is required'),
  customer_phone: z.string().min(1, 'Phone number is required'),
  customer_phone2: z.string().optional(),
  customer_address: z.string().min(1, 'Address is required'),
  customer_state: z.string().optional(),
  customer_comments: z.string().optional(),
  discount: z.number().min(0, 'Discount cannot be negative').optional(),
  items: z.array(orderItemSchema).min(1, 'At least one item is required'),
}).refine(
  (data) => {
    if (data.delivery_type === 'home') {
      return !!data.commune_id
    }
    return !!data.center_id
  },
  {
    message: 'Commune or center is required based on delivery type',
    path: ['commune_id'],
  }
)

type ConfirmOrderFormValues = z.infer<typeof confirmOrderSchema>

interface OrderItemTableRowProps {
  index: number
  item: ConfirmOrderItemRequest
  orderItem: OrderItem | null
  selectedVariant: (ProductVariant & { product?: Product }) | null | undefined
  allVariants: Array<ProductVariant & { product?: Product }>
  onUpdateQuantity: (value: number) => void
  onUpdatePrice: (value: number) => void
  onSelectVariant?: (variant: ProductVariant & { product?: Product }) => void
  onRemove?: () => void
}

function OrderItemTableRow({
  index: _index,
  item,
  orderItem,
  selectedVariant,
  allVariants,
  onUpdateQuantity,
  onUpdatePrice,
  onSelectVariant,
  onRemove,
}: OrderItemTableRowProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const getVariantDisplayValue = (variant: (ProductVariant & { product?: Product }) | null | undefined) => {
    if (!variant) {
      return 'Select variant...'
    }
    
    if (variant.sku) {
      return variant.sku
    }
    
    return 'No SKU'
  }

  const handleVariantSelect = (value: string) => {
    const variant = allVariants.find((v) => {
      const variantValue = `${v.product?.name || ''} ${v.name} ${v.sku}`
      return variantValue === value
    })
    if (variant && onSelectVariant) {
      onSelectVariant(variant)
      setComboboxOpen(false)
    } else {
      setComboboxOpen(false)
    }
  }

  return (
    <TableRow>
        <TableCell>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={comboboxOpen}
                className="w-full justify-between"
              >
                <span className="truncate">
                  {getVariantDisplayValue(selectedVariant)}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-0">
              <Command>
                <CommandInput placeholder="Search variant by name or SKU..." />
                <CommandList>
                  <CommandEmpty>No variant found.</CommandEmpty>
                  <CommandGroup>
                    {allVariants.map((variant) => {
                      const variantValue = `${variant.product?.name || ''} ${variant.name} ${variant.sku}`
                      return (
                        <CommandItem
                          key={variant.id}
                          value={variantValue}
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
                              <div className="font-medium truncate">
                                {variant.product?.name || ''} - {variant.name}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                {variant.sku}
                              </div>
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
        </TableCell>
        <TableCell>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={item.confirmed_quantity ?? orderItem?.quantity ?? 1}
            onChange={(e) => onUpdateQuantity(parseFloat(e.target.value) || 0)}
            required
            className="w-32"
          />
        </TableCell>
        <TableCell>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={
              selectedVariant && (item.confirmed_price === undefined || item.confirmed_price === null || item.confirmed_price === 0)
                ? selectedVariant.product?.base_retail_price ?? 0
                : item.confirmed_price !== undefined && item.confirmed_price !== null
                  ? item.confirmed_price
                  : orderItem?.price ?? 0
            }
            onChange={(e) => onUpdatePrice(parseFloat(e.target.value) || 0)}
            required
            className="w-32"
          />
        </TableCell>
        <TableCell>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={onRemove}
              className="h-8 w-8"
              title="Remove item"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </TableCell>
      </TableRow>
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
  const deliveryFeeInitializedRef = useRef(false)
  const defaultFromWilayaIdSetRef = useRef(false)
  const [selectedVariants, setSelectedVariants] = useState<Map<number, number>>(new Map())

  // Fetch Yalidine data
  const { data: wilayasData } = useYalidineWilayas(companyId)
  const { data: yalidineConfigs } = useYalidineConfigs(companyId)
  const defaultYalidineConfig = useMemo(() => {
    return yalidineConfigs?.find((config) => config.is_default && config.is_active)
  }, [yalidineConfigs])

  // Fetch products for variant information
  const { data: productsData } = useProducts(companyId, { page: 1, limit: 1000 })
  
  // Build all variants list
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

  // Initialize form with default values
  const form = useForm<ConfirmOrderFormValues>({
    resolver: zodResolver(confirmOrderSchema),
    defaultValues: {
      shipping_provider: 'yalidine',
      delivery_type: 'home',
      from_wilaya_id: defaultYalidineConfig?.from_wilaya_id || 0,
      shipping_wilaya_id: 0,
      shipping_wilaya_name: '',
      commune_id: undefined,
      center_id: undefined,
      second_delivery_cost: 0,
      customer_full_name: '',
      customer_phone: '',
      customer_phone2: '',
      customer_address: '',
      customer_state: '',
      customer_comments: '',
      discount: 0,
      items: [],
    },
    mode: 'onChange',
  })

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items',
  })


  // Watch form values for dependent queries
  const shippingWilayaId = form.watch('shipping_wilaya_id')
  const deliveryType = form.watch('delivery_type')
  const communeId = form.watch('commune_id')
  const centerId = form.watch('center_id')
  const fromWilayaId = form.watch('from_wilaya_id')

  // Fetch communes and centers based on selected wilaya
  const { data: communesDataForWilaya } = useYalidineCommunes(companyId, shippingWilayaId || undefined)
  const { data: centersDataForWilaya } = useYalidineCenters(companyId, shippingWilayaId || undefined)

  // Fetch delivery fee
  const { data: deliveryFeeData, isLoading: loadingDeliveryFee } = useDeliveryFee(
    companyId,
    {
      provider: form.watch('shipping_provider'),
      deliveryType: form.watch('delivery_type'),
      communeId: communeId || undefined,
      centerId: centerId || undefined,
      fromWilayaId: fromWilayaId || undefined,
      shippingWilayaId: shippingWilayaId || undefined,
    }
  )

  const firstDeliveryCost = deliveryFeeData?.fee || 0

  // Initialize form from order
  useEffect(() => {
    if (order && open) {
      // Initialize selected variants
      const initialVariants = new Map<number, number>()
      order.items.forEach((item) => {
        if (item.product_variant_id) {
          initialVariants.set(item.id, item.product_variant_id)
        }
      })
      setSelectedVariants(initialVariants)
      
      // Initialize items - don't include id, we'll match by product_variant_id instead
      const initialItems = order.items.map((item) => {
        let price = item.confirmed_price ?? item.price
        
        if (!item.confirmed_price && item.product_variant_id && allVariants.length > 0) {
          const variant = allVariants.find((v) => v.id === item.product_variant_id)
          if (variant?.product?.base_retail_price !== undefined) {
            price = variant.product.base_retail_price
          }
        }
        
        return {
          // Don't include id - we'll match by product_variant_id
          // useFieldArray will add its own UUID id, but we ignore it
          product_variant_id: item.product_variant_id ?? undefined,
          confirmed_quantity: item.confirmed_quantity ?? item.quantity,
          confirmed_price: price,
        }
      })

      // Find shipping wilaya from customer_state
      let shippingWilayaId = 0
      let shippingWilayaName = ''
      if (order.customer_state && wilayasData?.data) {
        const matchingWilaya = wilayasData.data.find(
          (w) => w.name.toLowerCase() === order.customer_state.toLowerCase()
        )
        if (matchingWilaya) {
          shippingWilayaId = matchingWilaya.id
          shippingWilayaName = matchingWilaya.name
        }
      }

      // Reset form with order data
      form.reset({
        shipping_provider: (order.shipping_provider === 'yalidine' || order.shipping_provider === 'my_delivery') 
          ? order.shipping_provider 
          : 'yalidine',
        delivery_type: order.delivery_type || 'home',
        from_wilaya_id: defaultYalidineConfig?.from_wilaya_id || 0,
        shipping_wilaya_id: shippingWilayaId,
        shipping_wilaya_name: shippingWilayaName,
        commune_id: order.commune_id || undefined,
        center_id: order.center_id || undefined,
        second_delivery_cost: order.second_delivery_cost || 0,
        customer_full_name: order.customer_full_name || '',
        customer_phone: order.customer_phone || '',
        customer_phone2: order.customer_phone2 || '',
        customer_address: order.customer_address || '',
        customer_state: shippingWilayaName,
        customer_comments: order.customer_comments || '',
        discount: order.discount || 0,
        items: initialItems,
      })

      deliveryFeeInitializedRef.current = false
      defaultFromWilayaIdSetRef.current = false
    }
  }, [order, open, wilayasData, allVariants, defaultYalidineConfig, form])

  // Set default from_wilaya_id from config
  useEffect(() => {
    const currentFromWilayaId = form.getValues('from_wilaya_id')
    if (defaultYalidineConfig?.from_wilaya_id && !defaultFromWilayaIdSetRef.current && (!currentFromWilayaId || currentFromWilayaId === 0)) {
      form.setValue('from_wilaya_id', defaultYalidineConfig.from_wilaya_id)
      defaultFromWilayaIdSetRef.current = true
    }
  }, [defaultYalidineConfig, form])

  // Sync shipping wilaya name to customer state
  const shippingWilayaName = form.watch('shipping_wilaya_name')
  useEffect(() => {
    if (shippingWilayaName) {
      form.setValue('customer_state', shippingWilayaName)
    }
  }, [shippingWilayaName, form])

  // Reset commune/center when wilaya changes
  useEffect(() => {
    if (shippingWilayaId) {
      form.setValue('commune_id', undefined)
      form.setValue('center_id', undefined)
    deliveryFeeInitializedRef.current = false
    }
  }, [shippingWilayaId, form])

  // Sync delivery fee from React Query
  useEffect(() => {
    if (firstDeliveryCost > 0 && !deliveryFeeInitializedRef.current) {
      form.setValue('second_delivery_cost', firstDeliveryCost)
      deliveryFeeInitializedRef.current = true
    } else if (firstDeliveryCost === 0) {
      deliveryFeeInitializedRef.current = false
    }
  }, [firstDeliveryCost, form])

  const onSubmit = async (data: ConfirmOrderFormValues) => {
    if (!order) {
      return
    }

    // Filter valid items - only require product_variant_id
    // All items are sent without ID - API will always create new items (no updates to snapshot items)
    // Completely ignore the UUID 'id' field from useFieldArray
    const validItems = data.items
      .filter((item) => item.product_variant_id !== undefined && item.product_variant_id !== null)
      .map((item) => ({
        product_variant_id: item.product_variant_id!,
        confirmed_quantity: item.confirmed_quantity,
        confirmed_price: item.confirmed_price,
      }))

    if (validItems.length === 0) {
      toast.error('At least one valid order item is required to confirm the order.')
      return
    }

    // Build items for API - all items sent without ID (API will create all items fresh)
    const itemsWithVariants: ConfirmOrderItemRequest[] = validItems.map((item) => ({
      product_variant_id: item.product_variant_id,
      confirmed_quantity: item.confirmed_quantity,
      confirmed_price: item.confirmed_price,
    }))

    if (itemsWithVariants.length === 0) {
      toast.error('All items must have a product variant selected.')
      return
    }
      
      const request: ConfirmOrderRequest = {
      shipping_provider: data.shipping_provider,
      delivery_type: data.delivery_type,
      commune_id: data.delivery_type === 'home' ? data.commune_id : undefined,
      center_id: data.delivery_type === 'stop_desk' ? data.center_id : undefined,
      second_delivery_cost: data.second_delivery_cost,
      from_wilaya_id: data.from_wilaya_id,
      customer_full_name: data.customer_full_name || undefined,
      customer_phone: data.customer_phone || undefined,
      customer_phone2: data.customer_phone2 || undefined,
      customer_address: data.customer_address || undefined,
      customer_state: data.shipping_wilaya_name || undefined,
      customer_comments: data.customer_comments || undefined,
      discount: data.discount || undefined,
        items: itemsWithVariants,
      }

    try {
      await apiClient.orders.confirm(companyId, order.id, request)
      toast.success('Order confirmed successfully')
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error('=== FORM SUBMISSION ERROR ===')
      console.error('29. Error confirming order:', error)
      console.error('30. Error message:', error.message)
      console.error('31. Error response:', error.response)
      console.error('32. Error response data:', error.response?.data)
      console.error('33. Error stack:', error.stack)
      console.error('=== END FORM SUBMISSION ERROR ===')
      toast.error(error.message || 'Failed to confirm order')
    }
  }

  // Helper to get item price
  const getItemPrice = useMemo(() => {
    return (item: { product_variant_id?: number; confirmed_price?: number }, orderItem: OrderItem | null) => {
      if (item.confirmed_price !== undefined && item.confirmed_price !== null) {
        return item.confirmed_price
      }
      // Try to get price from variant's product
      if (item.product_variant_id) {
        const variant = allVariants.find((v) => v.id === item.product_variant_id)
        if (variant?.product?.base_retail_price !== undefined) {
          return variant.product.base_retail_price
        }
      }
      return orderItem?.price ?? 0
    }
  }, [allVariants])

  // Calculate total
  const calculateTotal = useMemo(() => {
    const items = form.watch('items')
    const secondDeliveryCost = form.watch('second_delivery_cost')
    const discount = form.watch('discount') || 0

    const productTotal = items.reduce((sum, item) => {
      // Find order item by product_variant_id
      const orderItem = item.product_variant_id
        ? order?.items.find((oi) => oi.product_variant_id === item.product_variant_id) || null
        : null
      
      // Only include items that have a product_variant_id (selected variant)
      if (!item.product_variant_id) {
        return sum
      }
      
      const price = getItemPrice(item, orderItem)
      return sum + (item.confirmed_quantity ?? 0) * price
    }, 0)
    
    return productTotal + secondDeliveryCost - discount
  }, [form.watch('items'), form.watch('second_delivery_cost'), form.watch('discount'), getItemPrice, order])

  // Add new item
  const addNewItem = () => {
    try {
      const newItem: z.infer<typeof orderItemSchema> = {
      product_variant_id: undefined,
      confirmed_quantity: 1,
      confirmed_price: 0,
    }
      
      append(newItem, { shouldFocus: false })
    } catch (error) {
      console.error('Error adding new item:', error)
      toast.error('Failed to add new item')
    }
  }

  const wilayas = wilayasData?.data || []
  const communes = communesDataForWilaya?.data || []
  const centers = centersDataForWilaya?.data || []

  const selectedCommune = useMemo(() => {
    if (communeId && communesDataForWilaya?.data) {
      return communesDataForWilaya.data.find((c) => c.id === communeId) || null
    }
    return null
  }, [communeId, communesDataForWilaya])

  const selectedCenter = useMemo(() => {
    if (centerId && centersDataForWilaya?.data) {
      return centersDataForWilaya.data.find((c) => c.center_id === centerId) || null
    }
    return null
  }, [centerId, centersDataForWilaya])

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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
          <div className="flex gap-6">
            {/* Left column: Shipping & Customer Details */}
            <div className="flex-1 min-w-0 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Shipping & Customer Details</CardTitle>
                  <CardDescription>
                    Configure shipping and customer information for this order
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Shipping Section */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Shipping</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="shipping_provider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                        Shipping Provider <span className="text-red-500">*</span>
                              </FormLabel>
                      <Select
                                value={field.value}
                                onValueChange={field.onChange}
                      >
                                <FormControl>
                                  <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                                </FormControl>
                        <SelectContent>
                          <SelectItem value="yalidine">Yalidine</SelectItem>
                        </SelectContent>
                      </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="delivery_type"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                        Delivery Type <span className="text-red-500">*</span>
                              </FormLabel>
                      <div className="flex gap-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="delivery_type_home"
                                    checked={field.value === 'home'}
                                    onChange={() => {
                                      field.onChange('home')
                                      form.setValue('commune_id', undefined)
                                      form.setValue('center_id', undefined)
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
                                    checked={field.value === 'stop_desk'}
                                    onChange={() => {
                                      field.onChange('stop_desk')
                                      form.setValue('commune_id', undefined)
                                      form.setValue('center_id', undefined)
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary"
                          />
                          <Label htmlFor="delivery_type_stop_desk" className="font-normal cursor-pointer">
                            Stop Desk
                          </Label>
                        </div>
                      </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="from_wilaya_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                        Origin Wilaya (From) <span className="text-red-500">*</span>
                              </FormLabel>
                      <Select
                                value={field.value?.toString() || ''}
                        onValueChange={(value) => {
                          const wilayaId = parseInt(value, 10)
                          if (!isNaN(wilayaId)) {
                                    field.onChange(wilayaId)
                                    defaultFromWilayaIdSetRef.current = true
                          }
                        }}
                      >
                                <FormControl>
                                  <SelectTrigger>
                          <SelectValue placeholder="Select origin wilaya" />
                        </SelectTrigger>
                                </FormControl>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                              {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="shipping_wilaya_id"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                        State (Wilaya) <span className="text-red-500">*</span>
                              </FormLabel>
                      <Select
                                value={field.value?.toString() || ''}
                        onValueChange={(value) => {
                          const wilayaId = parseInt(value)
                          const wilaya = wilayas.find((w) => w.id === wilayaId)
                                  field.onChange(wilayaId)
                                  if (wilaya) {
                                    form.setValue('shipping_wilaya_name', wilaya.name)
                                    form.setValue('customer_state', wilaya.name)
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                          <SelectValue placeholder="Select wilaya" />
                        </SelectTrigger>
                                </FormControl>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                              {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                    {deliveryType === 'home' ? (
                          <FormField
                            control={form.control}
                            name="commune_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                          Commune <span className="text-red-500">*</span>
                                </FormLabel>
                        <Select
                                  value={field.value?.toString() || ''}
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled={!shippingWilayaId}
                        >
                                  <FormControl>
                                    <SelectTrigger>
                            <SelectValue placeholder={shippingWilayaId ? "Select commune" : "Select wilaya first"} />
                          </SelectTrigger>
                                  </FormControl>
                          <SelectContent>
                            {communes.map((commune) => (
                              <SelectItem key={commune.id} value={commune.id.toString()}>
                                {commune.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <FormField
                            control={form.control}
                            name="center_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                          Stop Desk <span className="text-red-500">*</span>
                                </FormLabel>
                        <Select
                                  value={field.value?.toString() || ''}
                                  onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled={!shippingWilayaId}
                        >
                                  <FormControl>
                                    <SelectTrigger>
                            <SelectValue placeholder={shippingWilayaId ? "Select center" : "Select wilaya first"} />
                          </SelectTrigger>
                                  </FormControl>
                          <SelectContent>
                            {centers.map((center) => (
                              <SelectItem key={center.center_id} value={center.center_id.toString()}>
                                {center.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                    )}
                  </div>

                  {/* Display delivery fee information */}
                  {(selectedCommune || selectedCenter) && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <h4 className="font-semibold mb-2">Delivery Fee Information</h4>
                      <div className="space-y-2 text-sm">
                        {loadingDeliveryFee ? (
                          <div className="text-gray-500">Loading fee...</div>
                        ) : firstDeliveryCost > 0 ? (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Suggested Fee:</span>
                              <span className="font-medium">{firstDeliveryCost.toFixed(2)} DZD</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-500">Current Fee:</span>
                                  <span className="font-medium">{form.watch('second_delivery_cost').toFixed(2)} DZD</span>
                            </div>
                          </>
                        ) : (
                          <div className="text-gray-500">Fee will be calculated after selecting destination</div>
                        )}
                      </div>
                    </div>
                  )}
                  </div>

                  {/* Customer Details Section */}
                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-semibold mb-4">Customer Details</h3>
                    <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="customer_full_name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                        Full Name <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customer_phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                        Phone Number <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customer_phone2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number 2</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customer_address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                        Address <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Textarea rows={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customer_state"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                        State <span className="text-red-500">*</span>
                              </FormLabel>
                      <Select
                        value={shippingWilayaId?.toString() || ''}
                        onValueChange={(value) => {
                          const wilayaId = parseInt(value)
                          const wilaya = wilayas.find((w) => w.id === wilayaId)
                                  form.setValue('shipping_wilaya_id', wilayaId)
                                  if (wilaya) {
                                    form.setValue('shipping_wilaya_name', wilaya.name)
                                    field.onChange(wilaya.name)
                                  }
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                          <SelectValue placeholder="Select a wilaya" />
                        </SelectTrigger>
                                </FormControl>
                        <SelectContent>
                          {wilayas.map((wilaya) => (
                            <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                              {wilaya.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customer_comments"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Client Comments</FormLabel>
                              <FormControl>
                                <Textarea rows={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
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
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product Variant</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {fields
                          .map((field, actualIndex) => {
                            const item = field as any
                            
                            // Find order item by product_variant_id
                            const orderItem = item.product_variant_id
                              ? order.items.find((oi) => oi.product_variant_id === item.product_variant_id) || null
                              : null
                            
                            // Filter: only show items that have a product_variant_id (existing or new)
                            // New items (added via "Add Item") won't have product_variant_id initially, so show them
                            // Existing items must have product_variant_id to match an order item
                            if (!item.product_variant_id && !orderItem) {
                              // This is a new item without variant selected yet - show it
                              // Or it's an invalid state - show it anyway so user can fix it
                            }
                            
                            // Get numeric ID from order item if found
                            const numericId = orderItem?.id

                            // Priority: form data (item.product_variant_id) > selectedVariants Map > orderItem
                            const storedVariantId = numericId ? selectedVariants.get(numericId) : undefined
                            const variantIdToUse = item.product_variant_id ?? storedVariantId ?? orderItem?.product_variant_id
                          const selectedVariant = variantIdToUse
                            ? allVariants.find((v) => v.id === variantIdToUse)
                            : null

                          return (
                            <OrderItemTableRow
                                key={field.id}
                              index={actualIndex}
                              item={item}
                              orderItem={orderItem}
                              selectedVariant={selectedVariant}
                              allVariants={allVariants}
                              onUpdateQuantity={(value) => {
                                  update(actualIndex, { ...item, confirmed_quantity: value })
                              }}
                              onUpdatePrice={(value) => {
                                  update(actualIndex, { ...item, confirmed_price: value })
                              }}
                              onSelectVariant={(variant) => {
                                  // Find order item by the newly selected variant
                                  const matchingOrderItem = order.items.find(
                                    (oi) => oi.product_variant_id === variant.id
                                  )
                                  
                                  // Update selectedVariants map if we found a matching order item
                                  if (matchingOrderItem) {
                                setSelectedVariants((prev) => {
                                  const next = new Map(prev)
                                      next.set(matchingOrderItem.id, variant.id)
                                  return next
                                })
                                  }
                                  
                                const variantPrice = variant.product?.base_retail_price ?? orderItem?.price ?? 0
                                  const updatedItem = {
                                    ...item,
                                      product_variant_id: variant.id,
                                      confirmed_price: variantPrice,
                                    }
                                  
                                  update(actualIndex, updatedItem)
                              }}
                              onRemove={() => {
                                  // Find order item by product_variant_id before removing
                                  const matchingOrderItem = item.product_variant_id
                                    ? order.items.find((oi) => oi.product_variant_id === item.product_variant_id)
                                    : null
                                  
                                  remove(actualIndex)
                                  
                                  // Remove from selectedVariants if it was an existing order item
                                  if (matchingOrderItem) {
                                setSelectedVariants((prev) => {
                                  const next = new Map(prev)
                                      next.delete(matchingOrderItem.id)
                                  return next
                                })
                                  }
                              }}
                            />
                          )
                          })
                          .filter(Boolean)}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              addNewItem()
                            }}
                            className="w-full"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Item
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
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
                        {form.watch('items')
                        .reduce((sum, item) => {
                          // Only include items that have a product_variant_id (selected variant)
                          if (!item.product_variant_id) {
                            return sum
                          }
                          
                          // Find order item by product_variant_id
                          const orderItem = order?.items.find((oi) => oi.product_variant_id === item.product_variant_id) || null
                          const price = getItemPrice(item, orderItem)
                          return sum + (item.confirmed_quantity ?? 0) * price
                        }, 0)
                        .toFixed(2)}{' '}
                      DZD
                    </span>
                  </div>
                    <FormField
                      control={form.control}
                      name="second_delivery_cost"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                      Delivery Cost <span className="text-red-500">*</span>
                      {loadingDeliveryFee && (
                        <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
                      )}
                          </FormLabel>
                          <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={loadingDeliveryFee}
                    />
                          </FormControl>
                    {firstDeliveryCost > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Suggested fee: {firstDeliveryCost.toFixed(2)} DZD
                      </p>
                    )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount</FormLabel>
                          <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                onClick={() => {
                  // Trigger validation manually
                  form.trigger()
                }}
              >
                {form.formState.isSubmitting ? 'Confirming...' : 'Confirm Order'}
            </Button>
          </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
