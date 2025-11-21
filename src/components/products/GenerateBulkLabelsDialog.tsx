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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { apiClient } from '@/lib/api-client'
import type { Product, ProductVariant } from '@/types/api'

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Zod validation schema
const bulkLabelSchema = z.object({
  selectedProducts: z.array(z.number()).optional(),
  selectedVariants: z.array(z.number()).optional(),
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
  qr_size_mm: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      { message: 'QR size must be a positive number' }
    ),
  font_size: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      { message: 'Font size must be a positive number' }
    ),
  labels_per_row: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0 && Number.isInteger(Number(val))),
      { message: 'Labels per row must be a positive integer' }
    ),
}).refine(
  (data) =>
    (data.selectedProducts && data.selectedProducts.length > 0) ||
    (data.selectedVariants && data.selectedVariants.length > 0),
  {
    message: 'Please select at least one product or variant',
    path: ['selectedProducts'],
  }
)

type BulkLabelFormValues = z.infer<typeof bulkLabelSchema>

interface GenerateBulkLabelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: number
  products: Product[]
  variants?: ProductVariant[]
}

export function GenerateBulkLabelsDialog({
  open,
  onOpenChange,
  companyId,
  products,
  variants = [],
}: GenerateBulkLabelsDialogProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const form = useForm<BulkLabelFormValues>({
    resolver: zodResolver(bulkLabelSchema),
    defaultValues: {
      selectedProducts: [],
      selectedVariants: [],
      width_mm: '',
      height_mm: '',
      margin_mm: '',
      qr_size_mm: '',
      font_size: '',
      labels_per_row: '',
    },
    mode: 'onChange',
  })

  const selectedProducts = form.watch('selectedProducts') || []
  const selectedVariants = form.watch('selectedVariants') || []

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

  async function onSubmit(values: BulkLabelFormValues) {
    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      // Build config object
      const config: any = {}
      if (values.width_mm) config.width_mm = Number(values.width_mm)
      if (values.height_mm) config.height_mm = Number(values.height_mm)
      if (values.margin_mm) config.margin_mm = Number(values.margin_mm)
      if (values.qr_size_mm) config.qr_size_mm = Number(values.qr_size_mm)
      if (values.font_size) config.font_size = Number(values.font_size)
      if (values.labels_per_row)
        config.labels_per_row = Number(values.labels_per_row)

      const requestData: any = {}
      if (values.selectedProducts && values.selectedProducts.length > 0) {
        requestData.product_ids = values.selectedProducts
      }
      if (values.selectedVariants && values.selectedVariants.length > 0) {
        requestData.variant_ids = values.selectedVariants
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
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate labels')
    } finally {
      setIsGenerating(false)
    }
  }

  const toggleProduct = (productId: number) => {
    const current = form.getValues('selectedProducts') || []
    if (current.includes(productId)) {
      form.setValue(
        'selectedProducts',
        current.filter((id) => id !== productId),
        { shouldValidate: true }
      )
    } else {
      form.setValue('selectedProducts', [...current, productId], {
        shouldValidate: true,
      })
    }
  }

  const toggleVariant = (variantId: number) => {
    const current = form.getValues('selectedVariants') || []
    if (current.includes(variantId)) {
      form.setValue(
        'selectedVariants',
        current.filter((id) => id !== variantId),
        { shouldValidate: true }
      )
    } else {
      form.setValue('selectedVariants', [...current, variantId], {
        shouldValidate: true,
      })
    }
  }

  const selectAllProducts = () => {
    form.setValue(
      'selectedProducts',
      products.map((p) => p.id),
      { shouldValidate: true }
    )
  }

  const deselectAllProducts = () => {
    form.setValue('selectedProducts', [], { shouldValidate: true })
  }

  const selectAllVariants = () => {
    form.setValue(
      'selectedVariants',
      variants.map((v) => v.id),
      { shouldValidate: true }
    )
  }

  const deselectAllVariants = () => {
    form.setValue('selectedVariants', [], { shouldValidate: true })
  }

  const totalSelected = selectedProducts.length + selectedVariants.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Bulk Labels</DialogTitle>
          <DialogDescription>
            Select products and/or variants to generate labels for multiple items at
            once
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
            {/* Selection Status */}
            {totalSelected > 0 && (
              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  {totalSelected} item(s) selected for label generation
                </AlertDescription>
              </Alert>
            )}

            {/* Product Selection */}
            {products.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium">
                    Products ({selectedProducts.length}/{products.length})
                  </FormLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllProducts}
                      className="h-7 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllProducts}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center space-x-2 hover:bg-slate-50 p-2 rounded"
                    >
                      <Checkbox
                        checked={selectedProducts.includes(product.id)}
                        onCheckedChange={() => toggleProduct(product.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {product.sku}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Variant Selection */}
            {variants.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-medium">
                    Variants ({selectedVariants.length}/{variants.length})
                  </FormLabel>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={selectAllVariants}
                      className="h-7 text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={deselectAllVariants}
                      className="h-7 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto space-y-2">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="flex items-center space-x-2 hover:bg-slate-50 p-2 rounded"
                    >
                      <Checkbox
                        checked={selectedVariants.includes(variant.id)}
                        onCheckedChange={() => toggleVariant(variant.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {variant.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {variant.sku}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FormMessage />

            {/* Configuration Section */}
            <div className="border-t pt-4">
              <FormLabel className="text-sm font-medium mb-3 block">
                Label Configuration (Optional)
              </FormLabel>
              <p className="text-xs text-muted-foreground mb-3">
                Customize label dimensions. Leave blank to use defaults.
              </p>

              <div className="grid grid-cols-3 gap-2">
                {/* Width */}
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

                {/* Height */}
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

                {/* Per Row */}
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
              <Button type="submit" disabled={isGenerating || totalSelected === 0}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate {totalSelected} Label{totalSelected !== 1 ? 's' : ''}
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

