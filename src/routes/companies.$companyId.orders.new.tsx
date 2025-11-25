import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
import { useCreateOrder } from '@/hooks/queries/use-orders'
import { useCompany } from '@/hooks/queries/use-companies'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { useYalidineWilayas, useYalidineCommunes, useYalidineCenters } from '@/hooks/queries/use-yalidine-api'
import { useSearchProductsForSale } from '@/hooks/queries/use-pos-queries'
import { useProducts } from '@/hooks/queries/use-products'
import { apiClient } from '@/lib/api-client'
import { ArrowLeft, Plus, Trash, Check, ChevronsUpDown } from 'lucide-react'
import { rootRoute } from '@/main'
import { cn } from '@/lib/utils'
import type { CreateOrderRequest, CreateOrderItemRequest, ProductVariant, Product, YalidineCommune, YalidineCenter } from '@/types/api'

interface VariantSelectorProps {
  index: number
  item: CreateOrderItemRequest
  selectedVariant: (ProductVariant & { product?: Product }) | null | undefined
  allVariants: Array<ProductVariant & { product?: Product }>
  onSelectVariant: (index: number, variant: ProductVariant & { product?: Product }) => void
  onUpdateItem: (index: number, field: keyof CreateOrderItemRequest, value: any) => void
  onRemove?: () => void
}

function VariantSelector({
  index,
  item,
  selectedVariant,
  allVariants,
  onSelectVariant,
  onUpdateItem,
  onRemove,
}: VariantSelectorProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false)

  return (
    <div className="flex items-end gap-4 p-4 border rounded-md">
      <div className="flex-1">
        <Label>Product Variant <span className="text-red-500">*</span></Label>
        <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
          <PopoverTrigger asChild>
            <Button
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
                  {allVariants.map((variant) => (
                    <CommandItem
                      key={variant.id}
                      value={`${variant.product?.name || ''} ${variant.name} ${variant.sku}`}
                      onSelect={() => {
                        onSelectVariant(index, variant)
                        setComboboxOpen(false)
                      }}
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
                  ))}
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
          onChange={(e) =>
            onUpdateItem(index, 'quantity', parseFloat(e.target.value) || 0)
          }
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
          onChange={(e) =>
            onUpdateItem(index, 'price', parseFloat(e.target.value) || 0)
          }
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
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
        >
          <Trash className="h-4 w-4 text-red-500" />
        </Button>
      )}
    </div>
  )
}

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
  const [communeId, setCommuneId] = useState<number | undefined>()
  const [centerId, setCenterId] = useState<number | undefined>()
  const [firstDeliveryCost, setFirstDeliveryCost] = useState(0)
  const [secondDeliveryCost, setSecondDeliveryCost] = useState(0)
  const [loadingDeliveryFee, setLoadingDeliveryFee] = useState(false)
  const [selectedCommune, setSelectedCommune] = useState<YalidineCommune | null>(null)
  const [selectedCenter, setSelectedCenter] = useState<YalidineCenter | null>(null)

  // Form data
  const [formData, setFormData] = useState<CreateOrderRequest>({
    customer_full_name: '',
    customer_phone: '',
    customer_phone2: '',
    customer_address: '',
    customer_state: '',
    customer_comments: '',
    items: [{ quantity: 1, price: 0 }],
    discount: 0,
  })

  // Fetch Yalidine data
  const { data: wilayasData } = useYalidineWilayas(companyIdNum)
  const { data: communesData } = useYalidineCommunes(companyIdNum, shippingWilayaId)
  const { data: centersData } = useYalidineCenters(companyIdNum, shippingWilayaId)

  // Fetch products for variant search
  const { data: productsData } = useProducts(companyIdNum, { page: 1, limit: 1000 })
  
  // Build all variants list
  const allVariants: Array<ProductVariant & { product?: Product }> = []
  if (productsData?.data) {
    productsData.data.forEach((product: Product) => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant) => {
          if (variant.is_active) {
            allVariants.push({ ...variant, product })
          }
        })
      }
    })
  }

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  // Sync shipping state to customer state
  useEffect(() => {
    if (shippingWilayaName) {
      setFormData((prev) => ({
        ...prev,
        customer_state: shippingWilayaName,
      }))
    }
  }, [shippingWilayaName])

  // Reset commune/center when wilaya changes
  useEffect(() => {
    setCommuneId(undefined)
    setCenterId(undefined)
    setSelectedCommune(null)
    setSelectedCenter(null)
    setFirstDeliveryCost(0)
    setSecondDeliveryCost(0)
  }, [shippingWilayaId])

  // Update selected commune/center when IDs change
  useEffect(() => {
    if (communeId && communesData?.data) {
      const commune = communesData.data.find((c) => c.id === communeId)
      setSelectedCommune(commune || null)
    } else {
      setSelectedCommune(null)
    }
  }, [communeId, communesData])

  useEffect(() => {
    if (centerId && centersData?.data) {
      const center = centersData.data.find((c) => c.center_id === centerId)
      setSelectedCenter(center || null)
    } else {
      setSelectedCenter(null)
    }
  }, [centerId, centersData])

  // Fetch delivery fee when commune or center is selected
  useEffect(() => {
    const fetchDeliveryFee = async () => {
      if (!shippingWilayaId) {
        setFirstDeliveryCost(0)
        setSecondDeliveryCost(0)
        return
      }

      if (deliveryType === 'home' && communeId) {
        setLoadingDeliveryFee(true)
        try {
          // Use the shipping provider's delivery fee endpoint
          const response = await apiClient.orders.getDeliveryFee(companyIdNum, {
            provider: shippingProvider,
            commune_id: communeId,
          })
          if (response.success && response.data) {
            const fee = response.data.fee || 0
            setFirstDeliveryCost(fee)
            setSecondDeliveryCost(fee)
          } else {
            setFirstDeliveryCost(0)
            setSecondDeliveryCost(0)
          }
        } catch (error) {
          console.error('Failed to fetch delivery fee:', error)
          setFirstDeliveryCost(0)
          setSecondDeliveryCost(0)
        } finally {
          setLoadingDeliveryFee(false)
        }
      } else if (deliveryType === 'stop_desk' && centerId) {
        setLoadingDeliveryFee(true)
        try {
          // Use the shipping provider's delivery fee endpoint
          const response = await apiClient.orders.getDeliveryFee(companyIdNum, {
            provider: shippingProvider,
            center_id: centerId,
          })
          if (response.success && response.data) {
            const fee = response.data.fee || 0
            setFirstDeliveryCost(fee)
            setSecondDeliveryCost(fee)
          } else {
            setFirstDeliveryCost(0)
            setSecondDeliveryCost(0)
          }
        } catch (error) {
          console.error('Failed to fetch delivery fee:', error)
          setFirstDeliveryCost(0)
          setSecondDeliveryCost(0)
        } finally {
          setLoadingDeliveryFee(false)
        }
      } else {
        setFirstDeliveryCost(0)
        setSecondDeliveryCost(0)
      }
    }

    fetchDeliveryFee()
  }, [deliveryType, communeId, centerId, shippingWilayaId, shippingProvider, companyIdNum])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate
    if (!formData.customer_full_name || !formData.customer_phone || !formData.customer_address || !formData.customer_state) {
      alert('Please fill in all required fields')
      return
    }

    if (!shippingWilayaId) {
      alert('Please select a state/wilaya in the shipping section')
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

    if (formData.items.length === 0 || formData.items.some(item => item.quantity <= 0 || item.price < 0)) {
      alert('Please add at least one valid order item')
      return
    }

    try {
      const result = await createOrder.mutateAsync(formData)
      if (result.success && result.data) {
        navigate({ to: `/companies/${companyId}/orders/${result.data.id}` })
      }
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { quantity: 1, price: 0 }],
    })
  }

  const removeItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const updateItem = (index: number, field: keyof CreateOrderItemRequest, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    setFormData({ ...formData, items: newItems })
  }

  const selectVariant = (index: number, variant: ProductVariant & { product?: Product }) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      product_variant_id: variant.id,
      price: variant.retail_price || variant.product?.base_retail_price || 0,
    }
    setFormData({ ...formData, items: newItems })
  }

  const calculateTotal = () => {
    const productTotal = formData.items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    )
    return productTotal + secondDeliveryCost - formData.discount
  }

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

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
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
                      <SelectTrigger>
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
                    <Label htmlFor="shipping_wilaya">
                      State (Wilaya) <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={shippingWilayaId?.toString() || ''}
                      onValueChange={(value) => {
                        const wilayaId = parseInt(value)
                        const wilaya = wilayas.find((w) => w.id === wilayaId)
                        setShippingWilayaId(wilayaId)
                        setShippingWilayaName(wilaya?.name || '')
                      }}
                    >
                      <SelectTrigger>
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
                        <SelectTrigger>
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
                        <SelectTrigger>
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

                {/* Display selected commune/center details */}
                {deliveryType === 'home' && selectedCommune && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h4 className="font-semibold mb-2">Selected Commune Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium">{selectedCommune.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Wilaya:</span>
                        <span className="ml-2 font-medium">{selectedCommune.wilaya_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">ID:</span>
                        <span className="ml-2 font-medium">{selectedCommune.id}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Deliverable:</span>
                        <span className="ml-2 font-medium">
                          {selectedCommune.is_deliverable === 1 ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {deliveryType === 'stop_desk' && selectedCenter && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <h4 className="font-semibold mb-2">Selected Center Details</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 font-medium">{selectedCenter.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Address:</span>
                        <span className="ml-2 font-medium">{selectedCenter.address}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Commune:</span>
                        <span className="ml-2 font-medium">{selectedCenter.commune_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Wilaya:</span>
                        <span className="ml-2 font-medium">{selectedCenter.wilaya_name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">GPS:</span>
                        <span className="ml-2 font-medium">{selectedCenter.gps || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Center ID:</span>
                        <span className="ml-2 font-medium">{selectedCenter.center_id}</span>
                      </div>
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
                  <div>
                    <Label htmlFor="customer_full_name">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_full_name"
                      value={formData.customer_full_name}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_full_name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_phone">
                      Phone <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_phone"
                      value={formData.customer_phone}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_phone2">Phone 2</Label>
                    <Input
                      id="customer_phone2"
                      value={formData.customer_phone2}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_phone2: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="customer_state">
                      State (Wilaya) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="customer_state"
                      value={formData.customer_state}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_state: e.target.value })
                      }
                      required
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically set from shipping section
                    </p>
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="customer_address">
                      Address <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      id="customer_address"
                      value={formData.customer_address}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_address: e.target.value })
                      }
                      required
                      rows={2}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="customer_comments">Comments</Label>
                    <Textarea
                      id="customer_comments"
                      value={formData.customer_comments}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_comments: e.target.value })
                      }
                      rows={2}
                    />
                  </div>
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
                {formData.items.map((item, index) => {
                  const selectedVariant = item.product_variant_id
                    ? allVariants.find((v) => v.id === item.product_variant_id)
                    : null

                  return (
                    <VariantSelector
                      key={index}
                      index={index}
                      item={item}
                      selectedVariant={selectedVariant}
                      allVariants={allVariants}
                      onSelectVariant={selectVariant}
                      onUpdateItem={updateItem}
                      onRemove={formData.items.length > 1 ? () => removeItem(index) : undefined}
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
                    {formData.items
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
                <div>
                  <Label htmlFor="discount">Discount</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="flex justify-between border-t pt-2 font-bold text-lg">
                  <span>Total:</span>
                  <span>{calculateTotal().toFixed(2)} DZD</span>
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
              <Button type="submit" disabled={createOrder.isPending}>
                {createOrder.isPending ? 'Creating...' : 'Create Order'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </RoleBasedLayout>
  )
}
