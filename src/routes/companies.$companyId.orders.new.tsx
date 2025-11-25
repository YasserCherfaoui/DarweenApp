import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Form,
  FormControl,
  FormDescription,
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
import { Textarea } from '@/components/ui/textarea'
import { useCompany } from '@/hooks/queries/use-companies'
import { useCreateOrder, useDeliveryFee } from '@/hooks/queries/use-orders'
import { useProducts } from '@/hooks/queries/use-products'
import { useYalidineCenters, useYalidineCommunes, useYalidineWilayas } from '@/hooks/queries/use-yalidine-api'
import { useYalidineConfigs } from '@/hooks/queries/use-yalidine-configs'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { cn } from '@/lib/utils'
import { rootRoute } from '@/main'
import type { CreateOrderItemRequest, CreateOrderRequest, Product, ProductVariant } from '@/types/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { createRoute, useNavigate } from '@tanstack/react-router'
import { AlertCircle, ArrowLeft, Check, CheckCircle2, ChevronsUpDown, Plus, Trash, XCircle } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import * as z from 'zod'

interface VariantSelectorProps {
  index: number
  item: CreateOrderItemRequest
  selectedVariant: (ProductVariant & { product?: Product }) | null | undefined
  allVariants: Array<ProductVariant & { product?: Product }>
  onSelectVariant: (index: number, variant: ProductVariant & { product?: Product }) => void
  onUpdateItem: (index: number, field: keyof CreateOrderItemRequest, value: any) => void
  onRemove?: (index: number) => void
  canRemove?: boolean
}

function VariantSelectorComponent({
  index,
  item,
  selectedVariant,
  allVariants,
  onSelectVariant,
  onUpdateItem,
  onRemove,
  canRemove,
}: VariantSelectorProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false)

  const handleSelectVariant = useCallback((variant: ProductVariant & { product?: Product }) => {
    console.log('[useCallback] handleSelectVariant - called', { index, variantId: variant.id })
    onSelectVariant(index, variant)
    setComboboxOpen(false)
  }, [index, onSelectVariant])
  console.log('[useCallback] handleSelectVariant - recreated', { index })

  // Stable handler that finds variant by value string
  const handleVariantSelect = useCallback((value: string) => {
    console.log('[useCallback] handleVariantSelect - called', { value, index })
    // Find variant by matching the value string
    const variant = allVariants.find((v) => {
      const variantValue = `${v.product?.name || ''} ${v.name} ${v.sku}`
      return variantValue === value
    })
    if (variant) {
      handleSelectVariant(variant)
    }
  }, [allVariants, handleSelectVariant])
  console.log('[useCallback] handleVariantSelect - recreated', { index, allVariantsLength: allVariants.length })

  const handleUpdateQuantity = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[useCallback] handleUpdateQuantity - called', { index, value: e.target.value })
    onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)
  }, [index, onUpdateItem])
  console.log('[useCallback] handleUpdateQuantity - recreated', { index })

  const handleUpdatePrice = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('[useCallback] handleUpdatePrice - called', { index, value: e.target.value })
    onUpdateItem(index, 'price', parseFloat(e.target.value) || 0)
  }, [index, onUpdateItem])
  console.log('[useCallback] handleUpdatePrice - recreated', { index })

  const handleRemoveClick = useCallback(() => {
    console.log('[useCallback] handleRemoveClick - called', { index })
    if (onRemove) {
      onRemove(index)
    }
  }, [index, onRemove])
  console.log('[useCallback] handleRemoveClick - recreated', { index })

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
              className="w-full justify-between"
            >
              <span className="truncate">
                {selectedVariant
                  ? `${selectedVariant.product?.name || ''} - ${selectedVariant.name}`
                  : 'Select variant...'}
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
      </div>
      <div className="w-32">
        <Label>Quantity <span className="text-red-500">*</span></Label>
        <Input
          type="number"
          step="0.01"
          min="0.01"
          value={item.quantity}
          onChange={handleUpdateQuantity}
          required
        />
      </div>
      <div className="w-32">
        <Label>Price <span className="text-red-500">*</span></Label>
        <Input
          type="number"
          step="0.01"
          min="0"
          value={item.price}
          onChange={handleUpdatePrice}
          required
        />
      </div>
      <div className="w-32">
        <Label>Line Total</Label>
        <Input
          type="text"
          value={(item.quantity * item.price).toFixed(2)}
          disabled
          className="bg-gray-50"
        />
      </div>
      {canRemove && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemoveClick}
        >
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  )
}

// Memoize with a simpler comparison - only check if critical props changed
const VariantSelector = React.memo(VariantSelectorComponent, (prevProps, nextProps) => {
  // Return true if props are equal (skip re-render), false if different (re-render)
  // Skip function comparisons as they're wrapped in useCallback and should be stable
  return (
    prevProps.index === nextProps.index &&
    prevProps.item.quantity === nextProps.item.quantity &&
    prevProps.item.price === nextProps.item.price &&
    prevProps.item.product_variant_id === nextProps.item.product_variant_id &&
    prevProps.selectedVariant?.id === nextProps.selectedVariant?.id &&
    prevProps.canRemove === nextProps.canRemove &&
    prevProps.allVariants.length === nextProps.allVariants.length
  )
})

// Zod validation schema for order form
const orderItemSchema = z.object({
  product_variant_id: z.number().optional(),
  quantity: z.number().min(0.01, { message: 'Quantity must be greater than 0' }),
  price: z.number().min(0, { message: 'Price must be greater than or equal to 0' }),
})

const orderFormSchema = z.object({
  customer_full_name: z.string().min(1, { message: 'Full name is required' }),
  customer_phone: z.string().min(1, { message: 'Phone number is required' }),
  customer_phone2: z.string().optional(),
  customer_address: z.string().min(1, { message: 'Address is required' }),
  customer_state: z.string().min(1, { message: 'State is required' }),
  customer_comments: z.string().optional(),
  items: z.array(orderItemSchema).min(1, { message: 'At least one item is required' }),
  discount: z.number().min(0, { message: 'Discount must be greater than or equal to 0' }).optional(),
})

type OrderFormValues = z.infer<typeof orderFormSchema>

export const CreateOrderRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/orders/new',
  component: CreateOrderPage,
})

function CreateOrderPage() {
  const navigate = useNavigate()
  const { companyId } = CreateOrderRoute.useParams()
  const companyIdNum = Number(companyId)
  const { data: company } = useCompany(companyIdNum)
  const { selectCompany } = useSelectedCompany()
  const createOrder = useCreateOrder(companyIdNum)

  // Shipping state
  const [shippingProvider, setShippingProvider] = useState<'yalidine'>('yalidine')
  const [deliveryType, setDeliveryType] = useState<'home' | 'stop_desk'>('home')
  const [shippingWilayaId, setShippingWilayaId] = useState<number | undefined>()
  const [shippingWilayaName, setShippingWilayaName] = useState<string>('')
  const [fromWilayaId, setFromWilayaId] = useState<number | undefined>()
  const [communeId, setCommuneId] = useState<number | undefined>()
  const [centerId, setCenterId] = useState<number | undefined>()
  const [secondDeliveryCost, setSecondDeliveryCost] = useState(0)
  const deliveryFeeInitializedRef = useRef(false)
  const defaultFromWilayaIdSetRef = useRef(false)

  // Get Yalidine configs to get default from_wilaya_id
  const { data: yalidineConfigs } = useYalidineConfigs(companyIdNum)
  const defaultYalidineConfig = useMemo(() => {
    return yalidineConfigs?.find((config) => config.is_default && config.is_active)
  }, [yalidineConfigs])

  // Form with react-hook-form and Zod validation
  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customer_full_name: '',
      customer_phone: '',
      customer_phone2: '',
      customer_address: '',
      customer_state: '',
      customer_comments: '',
      items: [{ quantity: 1, price: 0 }],
      discount: 0,
    },
    mode: 'onBlur', // Validate on blur to reduce re-renders
    reValidateMode: 'onChange', // Re-validate on change after first blur
  })

  // Watch items array efficiently
  const items = useWatch({ control: form.control, name: 'items' })
  const discount = useWatch({ control: form.control, name: 'discount' })

  // Extract stable form methods for use in callbacks
  const { setValue: setFormValue, getValues: getFormValues } = form

  // Fetch Yalidine data
  const { data: wilayasData } = useYalidineWilayas(companyIdNum)
  const { data: communesData } = useYalidineCommunes(companyIdNum, shippingWilayaId)
  const { data: centersData } = useYalidineCenters(companyIdNum, shippingWilayaId)

  // Fetch products for variant search
  const { data: productsData } = useProducts(companyIdNum, { page: 1, limit: 1000 })
  
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
    companyIdNum,
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

  // Helper to get field validation state - memoized to prevent recreation
  const getFieldState = useCallback((fieldName: keyof OrderFormValues) => {
    const fieldState = form.getFieldState(fieldName, form.formState)
    
    if (!fieldState.isDirty) return 'idle'
    if (fieldState.error) return 'error'
    if (fieldState.isDirty && !fieldState.error) return 'success'
    return 'idle'
  }, [form.formState])

  // Get validation icon based on field state - memoized
  const getValidationIcon = useCallback((fieldName: keyof OrderFormValues) => {
    const state = getFieldState(fieldName)
    
    if (state === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }
    if (state === 'error') {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
    return null
  }, [getFieldState])

  // Compute selected commune/center from React Query data - use stable references
  const selectedCommune = useMemo(() => {
    if (communeId && communesData?.data) {
      return communesData.data.find((c) => c.id === communeId) || null
    }
    return null
  }, [communeId, communesData])

  const selectedCenter = useMemo(() => {
    if (centerId && centersData?.data) {
      return centersData.data.find((c) => c.center_id === centerId) || null
    }
    return null
  }, [centerId, centersData])

  // Sync the selected company with the URL param
  const companyIdRef = useRef<number | undefined>(undefined)
  useEffect(() => {
    if (company && company.id !== companyIdRef.current) {
      selectCompany(company)
      companyIdRef.current = company.id
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [company]) // selectCompany is stable from the hook

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
      setFormValue('customer_state', shippingWilayaName, { shouldValidate: false })
    }
  }, [shippingWilayaName, setFormValue])

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

  const onSubmit = async (values: OrderFormValues) => {
    // Additional validation for shipping fields
    if (!shippingWilayaId) {
      form.setError('customer_state', { message: 'Please select a state/wilaya in the shipping section' })
      alert('Please select a state/wilaya in the shipping section')
      return
    }

    if (!fromWilayaId) {
      alert('Please select an origin wilaya in the shipping section')
      return
    }

    if (deliveryType === 'home' && !communeId) {
      alert('Please select a commune for home delivery')
      return
    }

    if (deliveryType === 'stop_desk' && !centerId) {
      alert('Please select a center for stop desk delivery')
      return
    }

    try {
      const orderData: CreateOrderRequest = {
        ...values,
        items: values.items.map(item => ({
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          price: item.price,
        })),
      }
      const result = await createOrder.mutateAsync(orderData)
      if (result.success && result.data) {
        navigate({ to: `/companies/${companyId}/orders/${result.data.id}` })
      }
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const addItem = useCallback(() => {
    const currentItems = getFormValues('items')
    setFormValue('items', [...currentItems, { quantity: 1, price: 0 }], { shouldValidate: false })
  }, [setFormValue, getFormValues])

  const removeItem = useCallback((index: number) => {
    const currentItems = getFormValues('items')
    if (currentItems.length > 1) {
      setFormValue('items', currentItems.filter((_, i) => i !== index), { shouldValidate: false })
    }
  }, [setFormValue, getFormValues])

  const updateItem = useCallback((index: number, field: keyof CreateOrderItemRequest, value: any) => {
    const currentItems = getFormValues('items')
    const newItems = [...currentItems]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormValue('items', newItems, { shouldValidate: false })
  }, [setFormValue, getFormValues])

  const selectVariant = useCallback((index: number, variant: ProductVariant & { product?: Product }) => {
    const currentItems = getFormValues('items')
    const newItems = [...currentItems]
    newItems[index] = {
      ...newItems[index],
      product_variant_id: variant.id,
      price: variant.retail_price || variant.product?.base_retail_price || 0,
    }
    setFormValue('items', newItems, { shouldValidate: false })
  }, [setFormValue, getFormValues])

  const calculateTotal = useMemo(() => {
    const productTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    )
    return productTotal + secondDeliveryCost - (discount ?? 0)
  }, [items, secondDeliveryCost, discount])

  const wilayas = wilayasData?.data || []
  const communes = communesData?.data || []
  const centers = centersData?.data || []

  return (
    <RoleBasedLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/orders` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Order
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create a manual order entry
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
            {/* Form Status Indicator */}
            {Object.keys(form.formState.dirtyFields).length > 0 && (
              <Alert className={cn(
                "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
                form.formState.isValid && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
              )}>
                <AlertCircle className={cn(
                  "h-4 w-4",
                  form.formState.isValid ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
                )} />
                <AlertDescription className={cn(
                  form.formState.isValid ? "text-green-800 dark:text-green-200" : "text-blue-800 dark:text-blue-200"
                )}>
                  <div className="space-y-1">
                    <div className="font-medium">Form Status:</div>
                    <div className="text-sm">
                      {form.formState.isValid ? (
                        <span className="text-green-700 dark:text-green-300 font-medium">✓ All fields are valid! Ready to submit.</span>
                      ) : (
                        <span className="text-orange-700 dark:text-orange-300">
                          {Object.keys(form.formState.errors).length} field(s) need attention
                        </span>
                      )}
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Shipping Section */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping</CardTitle>
                <CardDescription>
                  Select shipping provider and delivery details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shipping_provider">
                      Shipping Provider <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={shippingProvider}
                      onValueChange={(value) => setShippingProvider(value as 'yalidine')}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yalidine">Yalidine</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="delivery_type">
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
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home</SelectItem>
                        <SelectItem value="stop_desk">Stop Desk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="from_wilaya">
                      Origin Wilaya (From) <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={fromWilayaId?.toString() || ''}
                      onValueChange={(value) => {
                        const wilayaId = parseInt(value, 10)
                        if (!isNaN(wilayaId)) {
                          setFromWilayaId(wilayaId)
                          defaultFromWilayaIdSetRef.current = true // Mark as manually set
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select origin wilaya" />
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
                    <Label htmlFor="shipping_wilaya">
                      State (Wilaya) <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={shippingWilayaId?.toString() || ''}
                      onValueChange={(value) => {
                        const wilayaId = parseInt(value)
                        const wilaya = wilayas.find((w) => w.id === wilayaId)
                        setShippingWilayaId(wilayaId)
                        const wilayaName = wilaya?.name || ''
                        setShippingWilayaName(wilayaName)
                        // Update customer state directly in form
                        form.setValue('customer_state', wilayaName, { shouldValidate: true })
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select wilaya" />
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
                  {deliveryType === 'home' ? (
                    <div>
                      <Label htmlFor="commune">
                        Commune <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={communeId?.toString() || ''}
                        onValueChange={(value) => setCommuneId(parseInt(value))}
                        disabled={!shippingWilayaId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={shippingWilayaId ? "Select commune" : "Select wilaya first"} />
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
                  ) : (
                    <div>
                      <Label htmlFor="center">
                        Stop Desk <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={centerId?.toString() || ''}
                        onValueChange={(value) => setCenterId(parseInt(value))}
                        disabled={!shippingWilayaId}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={shippingWilayaId ? "Select center" : "Select wilaya first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {centers.map((center) => (
                            <SelectItem key={center.center_id} value={center.center_id.toString()}>
                              {center.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
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
                            <span className="font-medium">{secondDeliveryCost.toFixed(2)} DZD</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-gray-500">Fee will be calculated after selecting destination</div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Details */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Details</CardTitle>
                <CardDescription>
                  Enter customer information for this order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="customer_full_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between">
                            <span>Full Name <span className="text-red-500">*</span></span>
                            {getValidationIcon('customer_full_name')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={cn(
                                getFieldState('customer_full_name') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                                getFieldState('customer_full_name') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                              )}
                              {...field}
                            />
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
                          <FormLabel className="flex items-center justify-between">
                            <span>Phone <span className="text-red-500">*</span></span>
                            {getValidationIcon('customer_phone')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={cn(
                                getFieldState('customer_phone') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                                getFieldState('customer_phone') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                              )}
                              {...field}
                            />
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
                          <FormLabel className="flex items-center justify-between">
                            <span>Phone 2</span>
                            {getValidationIcon('customer_phone2')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={cn(
                                getFieldState('customer_phone2') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                                getFieldState('customer_phone2') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                              )}
                              {...field}
                            />
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
                          <FormLabel className="flex items-center justify-between">
                            <span>State (Wilaya) <span className="text-red-500">*</span></span>
                            {getValidationIcon('customer_state')}
                          </FormLabel>
                          <FormControl>
                            <Input
                              disabled
                              className="bg-gray-50"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Automatically set from shipping section
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customer_address"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="flex items-center justify-between">
                            <span>Address <span className="text-red-500">*</span></span>
                            {getValidationIcon('customer_address')}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              className={cn(
                                getFieldState('customer_address') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                                getFieldState('customer_address') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                              )}
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customer_comments"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel className="flex items-center justify-between">
                            <span>Comments</span>
                            {getValidationIcon('customer_comments')}
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              className={cn(
                                getFieldState('customer_comments') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                                getFieldState('customer_comments') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                              )}
                              rows={2}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
                <CardDescription>
                  Add products to this order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item, index) => {
                  const selectedVariant = item.product_variant_id
                    ? allVariants.find((v) => v.id === item.product_variant_id)
                    : null

                  // Use a stable key: product_variant_id if available, otherwise index
                  // This prevents React from recreating components unnecessarily
                  const itemKey = item.product_variant_id ? `variant-${item.product_variant_id}-${index}` : `item-${index}`

                  return (
                    <VariantSelector
                      key={itemKey}
                      index={index}
                      item={item}
                      selectedVariant={selectedVariant}
                      allVariants={allVariants}
                      onSelectVariant={selectVariant}
                      onUpdateItem={updateItem}
                      onRemove={removeItem}
                      canRemove={items.length > 1}
                    />
                  )
                })}
                <Button type="button" variant="outline" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
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
                      .reduce((sum, item) => sum + item.quantity * item.price, 0)
                      .toFixed(2)}{' '}
                    DZD
                  </span>
                </div>
                <div>
                  <Label htmlFor="first_delivery_cost" className="sr-only">
                    First Delivery Cost (Hidden)
                  </Label>
                  <Input
                    id="first_delivery_cost"
                    type="number"
                    step="0.01"
                    value={firstDeliveryCost}
                    readOnly
                    className="hidden"
                  />
                  <Label htmlFor="second_delivery_cost">
                    Delivery Cost <span className="text-red-500">*</span>
                    {loadingDeliveryFee && (
                      <span className="ml-2 text-xs text-gray-500">(Loading...)</span>
                    )}
                  </Label>
                  <Input
                    id="second_delivery_cost"
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
                <FormField
                  control={form.control}
                  name="discount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Discount</span>
                        {getValidationIcon('discount')}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          className={cn(
                            getFieldState('discount') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                            getFieldState('discount') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                          )}
                          value={field.value ?? 0}
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

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate({ to: `/companies/${companyId}/orders` })}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createOrder.isPending || !form.formState.isValid}
              >
                {createOrder.isPending ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
            </div>
          </form>
        </Form>
      </div>
    </RoleBasedLayout>
  )
}
