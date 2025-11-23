import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, CheckCircle2, AlertCircle, Loader2, X, Plus, ChevronsUpDown, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import type { Product, ProductVariant } from '@/types/api'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Extended variant with parent product name
interface VariantWithProduct extends ProductVariant {
  parent_product_name: string
}

// Selected variant with quantity
interface SelectedVariant {
  variant_id: number
  variant: VariantWithProduct
  quantity: number
}

// Zod validation schema
const bulkLabelSchema = z.object({
  width_mm: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      { message: 'Width must be a positive number' }
    ),
  height_mm: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      { message: 'Height must be a positive number' }
    ),
  margin_mm: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) >= 0),
      { message: 'Margin must be a non-negative number' }
    ),
  labels_per_row: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val))),
      { message: 'Labels per row must be a positive integer' }
    ),
})

type BulkLabelFormValues = z.infer<typeof bulkLabelSchema>

interface GenerateBulkLabelsDialogEnhancedProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: number
  products: Product[]
}

export function GenerateBulkLabelsDialogEnhanced({
  open,
  onOpenChange,
  companyId,
  products,
}: GenerateBulkLabelsDialogEnhancedProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [selectedVariants, setSelectedVariants] = React.useState<SelectedVariant[]>([])
  const [comboboxOpen, setComboboxOpen] = React.useState(false)
  const [allVariants, setAllVariants] = React.useState<VariantWithProduct[]>([])
  const [isLoadingVariants, setIsLoadingVariants] = React.useState(false)

  const form = useForm<BulkLabelFormValues>({
    resolver: zodResolver(bulkLabelSchema),
    defaultValues: {
      width_mm: '',
      height_mm: '',
      margin_mm: '',
      labels_per_row: '',
    },
    mode: 'onChange',
  })

  // Fetch all variants when dialog opens
  React.useEffect(() => {
    if (open && products.length > 0) {
      fetchAllVariants()
    }
  }, [open, products])

  const fetchAllVariants = async () => {
    setIsLoadingVariants(true)
    try {
      const variantsPromises = products.map(async (product) => {
        try {
          const response = await apiClient.productVariants.list(companyId, product.id)
          return response.data.map((variant: ProductVariant) => ({
            ...variant,
            parent_product_name: product.name,
          }))
        } catch (err) {
          return []
        }
      })

      const variantsArrays = await Promise.all(variantsPromises)
      const flatVariants = variantsArrays.flat()
      setAllVariants(flatVariants)
    } catch (err) {
      console.error('Failed to fetch variants:', err)
    } finally {
      setIsLoadingVariants(false)
    }
  }

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  const addVariant = (variant: VariantWithProduct) => {
    // Check if already added
    if (selectedVariants.some((sv) => sv.variant_id === variant.id)) {
      return
    }

    setSelectedVariants([
      ...selectedVariants,
      {
        variant_id: variant.id,
        variant,
        quantity: 1,
      },
    ])
    setComboboxOpen(false)
  }

  const removeVariant = (variantId: number) => {
    setSelectedVariants(selectedVariants.filter((sv) => sv.variant_id !== variantId))
  }

  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity < 1) return
    setSelectedVariants(
      selectedVariants.map((sv) =>
        sv.variant_id === variantId ? { ...sv, quantity } : sv
      )
    )
  }

  const getTotalLabels = () => {
    return selectedVariants.reduce((sum, sv) => sum + sv.quantity, 0)
  }

  async function onSubmit(values: BulkLabelFormValues) {
    if (selectedVariants.length === 0) {
      setError('Please select at least one variant')
      return
    }

    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      // Build config object
      const config: any = {}
      if (values.width_mm) config.width_mm = Number(values.width_mm)
      if (values.height_mm) config.height_mm = Number(values.height_mm)
      if (values.margin_mm) config.margin_mm = Number(values.margin_mm)
      if (values.labels_per_row) config.labels_per_row = Number(values.labels_per_row)

      const requestData: any = {
        variants: selectedVariants.map((sv) => ({
          variant_id: sv.variant_id,
          quantity: sv.quantity,
        })),
      }

      if (Object.keys(config).length > 0) {
        requestData.config = config
      }

      const blob = await apiClient.labels.generateBulkLabels(companyId, requestData)

      // Download the PDF
      downloadBlob(blob, 'labels-bulk.pdf')

      setSuccess(true)

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        form.reset()
        setSelectedVariants([])
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate labels')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Bulk Labels</DialogTitle>
          <DialogDescription>
            Search and select variants, then specify quantities for each
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Bulk labels generated successfully and downloaded!
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Variant Selection */}
            <div className="space-y-3">
              <FormLabel className="text-sm font-medium">
                Select Variants ({selectedVariants.length} selected, {getTotalLabels()} total labels)
              </FormLabel>

              {/* Combobox */}
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between"
                  >
                    <span className="truncate">
                      {isLoadingVariants
                        ? 'Loading variants...'
                        : 'Search and select variant...'}
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
                            value={`${variant.parent_product_name} ${variant.name} ${variant.sku}`}
                            onSelect={() => addVariant(variant)}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <Check
                                className={cn(
                                  'h-4 w-4',
                                  selectedVariants.some((sv) => sv.variant_id === variant.id)
                                    ? 'opacity-100'
                                    : 'opacity-0'
                                )}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium truncate">
                                  {variant.parent_product_name} - {variant.name}
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

              {/* Selected Variants List */}
              {selectedVariants.length > 0 && (
                <div className="border rounded-md divide-y max-h-[300px] overflow-y-auto">
                  {selectedVariants.map((sv) => (
                    <div
                      key={sv.variant_id}
                      className="flex items-center gap-3 p-3 hover:bg-slate-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {sv.variant.parent_product_name} - {sv.variant.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {sv.variant.sku}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="1"
                          value={sv.quantity}
                          onChange={(e) =>
                            updateQuantity(sv.variant_id, parseInt(e.target.value) || 1)
                          }
                          className="w-20 h-8 text-center"
                        />
                        <Badge variant="secondary" className="text-xs">
                          {sv.quantity} {sv.quantity === 1 ? 'label' : 'labels'}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeVariant(sv.variant_id)}
                        >
                          <X className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedVariants.length === 0 && (
                <div className="text-center py-8 text-sm text-muted-foreground border rounded-md">
                  No variants selected. Use the search box above to find and add variants.
                </div>
              )}
            </div>

            {/* Configuration Section */}
            <div className="border-t pt-4">
              <FormLabel className="text-sm font-medium mb-3 block">
                Label Configuration (Optional)
              </FormLabel>
              <p className="text-xs text-muted-foreground mb-3">
                Customize label dimensions. Leave blank to use defaults.
              </p>

              <div className="grid grid-cols-4 gap-2">
                <FormField
                  control={form.control}
                  name="width_mm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Width (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="80"
                          className="text-sm h-8"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height_mm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Height (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="50"
                          className="text-sm h-8"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="margin_mm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Margin (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="1.0"
                          className="text-sm h-8"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="labels_per_row"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Per Row</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="1"
                          className="text-sm h-8"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isGenerating || selectedVariants.length === 0}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate {getTotalLabels()} Label{getTotalLabels() !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}




