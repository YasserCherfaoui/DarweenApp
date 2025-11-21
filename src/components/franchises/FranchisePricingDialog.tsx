import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CheckCircle2, XCircle, Search, AlertCircle } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { FranchisePricing, ProductVariant } from '@/types/api'
import { useEffect, useState, useMemo } from 'react'
import { useProducts } from '@/hooks/queries/use-products'
import { Skeleton } from '@/components/ui/skeleton'

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

const pricingSchema = z.object({
  product_variant_id: z.number().optional(),
  retail_price: z.string().optional(),
  wholesale_price: z.string().optional(),
}).refine(
  (data) => {
    // At least one price should be provided
    return data.retail_price || data.wholesale_price
  },
  {
    message: 'Please enter at least one custom price',
    path: ['retail_price'],
  }
)

type FormValues = z.infer<typeof pricingSchema>

interface FranchisePricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: number
  franchiseId: number
  existingPricing?: FranchisePricing | null
  onSubmit: (data: {
    product_variant_id?: number
    product_id?: number
    retail_price?: number
    wholesale_price?: number
  }) => void
  isLoading?: boolean
}

export function FranchisePricingDialog({
  open,
  onOpenChange,
  companyId,
  franchiseId,
  existingPricing,
  onSubmit,
  isLoading,
}: FranchisePricingDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [step, setStep] = useState<'product' | 'pricing'>('product')
  const [selectedProduct, setSelectedProduct] = useState<{
    id: number
    name: string
    variants: ProductVariant[]
    baseRetail: number
    baseWholesale: number
  } | null>(null)
  const [pricingMode, setPricingMode] = useState<'all' | 'individual'>('all')
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null)

  // Fetch products with variants for the company (max 100 due to backend pagination limit)
  const { data: productsResponse, isLoading: productsLoading } = useProducts(companyId, { page: 1, limit: 100 })

  // Get all products
  const allProducts = useMemo(() => {
    if (!productsResponse?.data) return []
    return productsResponse.data.filter(product => (product.variants || []).length > 0)
  }, [productsResponse])

  // Filter products based on search
  const filteredProducts = useMemo(() => {
    if (!searchQuery) return allProducts
    
    const query = searchQuery.toLowerCase()
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    )
  }, [allProducts, searchQuery])

  const form = useForm<FormValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      product_variant_id: existingPricing?.product_variant_id,
      retail_price: existingPricing?.retail_price?.toString() || '',
      wholesale_price: existingPricing?.wholesale_price?.toString() || '',
    },
    mode: 'onChange',
  })

  // Get selected variant details
  const selectedVariant = useMemo(() => {
    if (!selectedProduct || !selectedVariantId) return null
    const variant = selectedProduct.variants.find(v => v.id === selectedVariantId)
    if (!variant) return null
    return {
      variant,
      defaultRetail: variant.retail_price || selectedProduct.baseRetail,
      defaultWholesale: variant.wholesale_price || selectedProduct.baseWholesale,
    }
  }, [selectedProduct, selectedVariantId])

  const getFieldState = (fieldName: keyof FormValues) => {
    const fieldState = form.getFieldState(fieldName)
    const fieldValue = form.watch(fieldName)
    
    if (!fieldState.isDirty) return 'idle'
    if (fieldState.error) return 'error'
    if (fieldValue && !fieldState.error) return 'success'
    return 'idle'
  }

  const getValidationIcon = (fieldName: keyof FormValues) => {
    const state = getFieldState(fieldName)
    
    if (state === 'success') {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />
    }
    if (state === 'error') {
      return <XCircle className="h-5 w-5 text-red-600" />
    }
    return null
  }

  useEffect(() => {
    if (open && existingPricing) {
      // Editing existing pricing - skip to pricing step
      setStep('pricing')
      form.reset({
        product_variant_id: existingPricing.product_variant_id,
        retail_price: existingPricing.retail_price?.toString() || '',
        wholesale_price: existingPricing.wholesale_price?.toString() || '',
      })
    } else if (!open) {
      // Reset everything when dialog closes
      setStep('product')
      setSelectedProduct(null)
      setPricingMode('all')
      setSelectedVariantId(null)
      form.reset({
        product_variant_id: undefined,
        retail_price: '',
        wholesale_price: '',
      })
      setSearchQuery('')
    }
  }, [open, existingPricing, form])

  const handleProductSelect = (product: typeof allProducts[0]) => {
    setSelectedProduct({
      id: product.id,
      name: product.name,
      variants: product.variants || [],
      baseRetail: product.base_retail_price,
      baseWholesale: product.base_wholesale_price,
    })
    setSearchQuery('')
    setStep('pricing')
  }

  const handleBack = () => {
    setStep('product')
    setSelectedProduct(null)
    setPricingMode('all')
    setSelectedVariantId(null)
    form.reset({
      product_variant_id: undefined,
      retail_price: '',
      wholesale_price: '',
    })
  }

  const handleSubmit = (values: FormValues) => {
    if (existingPricing) {
      // Editing existing pricing - single variant update
      const data = {
        product_variant_id: values.product_variant_id,
        retail_price: values.retail_price ? parseFloat(values.retail_price) : undefined,
        wholesale_price: values.wholesale_price ? parseFloat(values.wholesale_price) : undefined,
      }
      onSubmit(data)
    } else {
      // New pricing - handle based on mode
      if (pricingMode === 'all' && selectedProduct) {
        // Apply to all variants - use bulk endpoint
        const data = {
          product_id: selectedProduct.id,
          retail_price: values.retail_price ? parseFloat(values.retail_price) : undefined,
          wholesale_price: values.wholesale_price ? parseFloat(values.wholesale_price) : undefined,
        }
        onSubmit(data)
      } else if (pricingMode === 'individual' && selectedVariantId) {
        // Apply to single variant
        const data = {
          product_variant_id: selectedVariantId,
          retail_price: values.retail_price ? parseFloat(values.retail_price) : undefined,
          wholesale_price: values.wholesale_price ? parseFloat(values.wholesale_price) : undefined,
        }
        onSubmit(data)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existingPricing ? 'Edit Pricing' : step === 'product' ? 'Select Product' : 'Set Custom Pricing'}
          </DialogTitle>
          <DialogDescription>
            {existingPricing 
              ? 'Update custom pricing for this variant. Leave fields empty to use default pricing.'
              : step === 'product'
              ? 'Choose a product to set custom pricing for its variants.'
              : 'Configure pricing for the selected product variants.'}
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: Product Selection */}
        {!existingPricing && step === 'product' && (
          <div className="space-y-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Products List */}
            {productsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto border rounded-md">
                {filteredProducts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    {searchQuery ? 'No products found matching your search' : 'No products available'}
                  </div>
                ) : (
                  <div className="divide-y">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => handleProductSelect(product)}
                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{product.name}</p>
                            <p className="text-xs text-gray-500 mt-1">SKU: {product.sku}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                              {product.variants?.length || 0} variant{product.variants?.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="ml-3 text-right text-xs space-y-1">
                            <div>
                              <span className="text-gray-500">Base Retail:</span>
                              <span className="ml-1 font-semibold text-green-600">
                                ${product.base_retail_price.toFixed(2)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Base Wholesale:</span>
                              <span className="ml-1 font-semibold text-blue-600">
                                ${product.base_wholesale_price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                    {allProducts.length >= 100 && (
                      <div className="p-3 text-center text-xs text-amber-600 bg-amber-50 dark:bg-amber-950">
                        Showing first 100 products. Use search to find specific products.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Pricing Configuration */}
        {(existingPricing || step === 'pricing') && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              {/* Form Status Indicator */}
              {Object.keys(form.formState.dirtyFields).length > 0 && (
                <Alert className={cn(
                  "border-2",
                  form.formState.isValid ? "border-blue-200 bg-blue-50 dark:bg-blue-950" : "border-orange-200 bg-orange-50 dark:bg-orange-950"
                )}>
                  <AlertCircle className={cn(
                    "h-4 w-4",
                    form.formState.isValid ? "text-blue-600" : "text-orange-600"
                  )} />
                  <AlertDescription className={cn(
                    form.formState.isValid ? "text-blue-800 dark:text-blue-200" : "text-orange-800 dark:text-orange-200"
                  )}>
                    <div className="space-y-1">
                      <div className="font-medium">Form Status:</div>
                      <div className="text-sm">
                        {form.formState.isValid ? (
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            ✓ Ready to submit!
                          </span>
                        ) : (
                          <span>
                            {Object.keys(form.formState.errors).length > 0 
                              ? `${Object.keys(form.formState.errors).length} field(s) need attention`
                              : 'Fill in at least one price field'}
                          </span>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Show selected product info */}
              {!existingPricing && selectedProduct && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{selectedProduct.name}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {selectedProduct.variants.length} variant{selectedProduct.variants.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                    >
                      Change
                    </Button>
                  </div>
                </div>
              )}

              {/* Pricing Mode Selection (only for new pricing) */}
              {!existingPricing && selectedProduct && (
                <div className="space-y-3">
                  <Label>Apply Pricing To</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPricingMode('all')
                        setSelectedVariantId(null)
                      }}
                      className={cn(
                        'p-4 border-2 rounded-lg text-left transition-all',
                        pricingMode === 'all'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          pricingMode === 'all' ? 'border-blue-500' : 'border-gray-300'
                        )}>
                          {pricingMode === 'all' && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <span className="font-medium text-sm">All Variants</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Apply same pricing to all {selectedProduct.variants.length} variants
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPricingMode('individual')}
                      className={cn(
                        'p-4 border-2 rounded-lg text-left transition-all',
                        pricingMode === 'individual'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={cn(
                          'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                          pricingMode === 'individual' ? 'border-blue-500' : 'border-gray-300'
                        )}>
                          {pricingMode === 'individual' && (
                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <span className="font-medium text-sm">Individual Variant</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Set pricing for one specific variant
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {/* Variant Selection (for individual mode) */}
              {!existingPricing && pricingMode === 'individual' && selectedProduct && (
                <div className="space-y-2">
                  <Label>Select Variant *</Label>
                  <div className="max-h-48 overflow-y-auto border rounded-md divide-y">
                    {selectedProduct.variants.map((variant) => {
                      const defaultRetail = variant.retail_price || selectedProduct.baseRetail
                      const defaultWholesale = variant.wholesale_price || selectedProduct.baseWholesale
                      
                      return (
                        <button
                          key={variant.id}
                          type="button"
                          onClick={() => {
                            setSelectedVariantId(variant.id)
                            form.setValue('product_variant_id', variant.id)
                          }}
                          className={cn(
                            'w-full p-3 text-left transition-colors',
                            selectedVariantId === variant.id
                              ? 'bg-green-50 dark:bg-green-950 border-l-4 border-green-500'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{variant.name}</p>
                              <p className="text-xs text-gray-500 mt-1">SKU: {variant.sku}</p>
                            </div>
                            <div className="ml-3 text-right text-xs space-y-1">
                              <div>
                                <span className="text-gray-500">R:</span>
                                <span className="ml-1 font-semibold text-green-600">
                                  ${defaultRetail.toFixed(2)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500">W:</span>
                                <span className="ml-1 font-semibold text-blue-600">
                                  ${defaultWholesale.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                  {pricingMode === 'individual' && !selectedVariantId && (
                    <p className="text-sm text-red-500">Please select a variant to continue</p>
                  )}
                </div>
              )}

              {/* Existing pricing display */}
              {existingPricing && (
                <div className="space-y-2">
                  <Label>Product Variant</Label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="font-medium">{existingPricing.variant_name}</p>
                    <p className="text-sm text-gray-500">SKU: {existingPricing.variant_sku}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm pt-2">
                    <div>
                      <span className="text-gray-500">Default Retail:</span>
                      <span className="ml-2 font-medium text-green-600">
                        ${existingPricing.default_retail_price.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Default Wholesale:</span>
                      <span className="ml-2 font-medium text-green-600">
                        ${existingPricing.default_wholesale_price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

            <FormField
              control={form.control}
              name="retail_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Custom Retail Price</span>
                    {getValidationIcon('retail_price')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Leave empty to use default"
                      className={cn(
                        getFieldState('retail_price') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                        getFieldState('retail_price') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {pricingMode === 'all' && selectedProduct && (
                      <span>
                        Default: <span className="font-semibold text-green-600">${selectedProduct.baseRetail.toFixed(2)}</span>
                        {' • '}Will apply to all {selectedProduct.variants.length} variants
                      </span>
                    )}
                    {pricingMode === 'individual' && selectedVariant && (
                      <span>
                        Default: <span className="font-semibold text-green-600">${selectedVariant.defaultRetail.toFixed(2)}</span>
                        {' • '}Leave empty to use default
                      </span>
                    )}
                    {existingPricing && (
                      <span>
                        Default: <span className="font-semibold text-green-600">${existingPricing.default_retail_price.toFixed(2)}</span>
                        {' • '}Leave empty to use default
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage className="text-red-600 font-medium" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wholesale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Custom Wholesale Price</span>
                    {getValidationIcon('wholesale_price')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Leave empty to use default"
                      className={cn(
                        getFieldState('wholesale_price') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                        getFieldState('wholesale_price') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {pricingMode === 'all' && selectedProduct && (
                      <span>
                        Default: <span className="font-semibold text-blue-600">${selectedProduct.baseWholesale.toFixed(2)}</span>
                        {' • '}Will apply to all {selectedProduct.variants.length} variants
                      </span>
                    )}
                    {pricingMode === 'individual' && selectedVariant && (
                      <span>
                        Default: <span className="font-semibold text-blue-600">${selectedVariant.defaultWholesale.toFixed(2)}</span>
                        {' • '}Leave empty to use default
                      </span>
                    )}
                    {existingPricing && (
                      <span>
                        Default: <span className="font-semibold text-blue-600">${existingPricing.default_wholesale_price.toFixed(2)}</span>
                        {' • '}Leave empty to use default
                      </span>
                    )}
                  </FormDescription>
                  <FormMessage className="text-red-600 font-medium" />
                </FormItem>
              )}
            />

              <div className="flex gap-2 pt-4">
                {!existingPricing && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={
                    isLoading || 
                    (!existingPricing && pricingMode === 'individual' && !selectedVariantId) ||
                    (!existingPricing && pricingMode === 'all' && !selectedProduct)
                  }
                  className="flex-1"
                >
                  {isLoading ? 'Saving...' : existingPricing ? 'Update' : pricingMode === 'all' ? `Set for ${selectedProduct?.variants.length} Variants` : 'Set Pricing'}
                </Button>
              </div>
              
              {pricingMode === 'individual' && !selectedVariantId && !existingPricing && (
                <p className="text-sm text-center text-orange-600">
                  Please select a variant to continue
                </p>
              )}
              {pricingMode === 'all' && !selectedProduct && !existingPricing && (
                <p className="text-sm text-center text-orange-600">
                  Please select a product first
                </p>
              )}
              {form.formState.errors.retail_price && form.formState.errors.retail_price.message && (
                <p className="text-sm text-center text-orange-600">
                  {String(form.formState.errors.retail_price.message)}
                </p>
              )}
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}

