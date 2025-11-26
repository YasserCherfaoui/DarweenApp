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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

// Utility function for className merging
const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

// Zod validation schema for label configuration
const labelConfigSchema = z.object({
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
})

type LabelConfigFormValues = z.infer<typeof labelConfigSchema>

interface GenerateLabelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: number
  productId: number
  variantId?: number
  sku: string
  itemName: string
}

export function GenerateLabelDialog({
  open,
  onOpenChange,
  companyId,
  productId,
  variantId,
  sku,
  itemName,
}: GenerateLabelDialogProps) {
  const [isGenerating, setIsGenerating] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)

  const form = useForm<LabelConfigFormValues>({
    resolver: zodResolver(labelConfigSchema),
    defaultValues: {
      width_mm: '',
      height_mm: '',
      margin_mm: '',
      qr_size_mm: '',
      font_size: '',
    },
    mode: 'onChange',
  })

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

  async function onSubmit(values: LabelConfigFormValues) {
    setIsGenerating(true)
    setError(null)
    setSuccess(false)

    try {
      // Build config object, only including non-empty values
      const config: any = {}
      if (values.width_mm) config.width_mm = Number(values.width_mm)
      if (values.height_mm) config.height_mm = Number(values.height_mm)
      if (values.margin_mm) config.margin_mm = Number(values.margin_mm)
      if (values.qr_size_mm) config.qr_size_mm = Number(values.qr_size_mm)
      if (values.font_size) config.font_size = Number(values.font_size)


      let blob: Blob
      if (variantId) {
        blob = await apiClient.labels.generateVariantLabel(
          companyId,
          productId,
          variantId
        )
      } else {
        blob = await apiClient.labels.generateProductLabel(
          companyId,
          productId
        )
      }

      // Download the PDF
      downloadBlob(blob, `label-${sku}.pdf`)

      setSuccess(true)

      // Close dialog after 1.5 seconds
      setTimeout(() => {
        onOpenChange(false)
        setSuccess(false)
        form.reset()
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate label')
    } finally {
      setIsGenerating(false)
    }
  }

  // Helper to get field validation state
  const getFieldState = (fieldName: keyof LabelConfigFormValues) => {
    const fieldState = form.getFieldState(fieldName)
    const fieldValue = form.watch(fieldName)

    if (!fieldState.isDirty) return 'idle'
    if (fieldState.error) return 'error'
    if (fieldValue && !fieldState.error) return 'success'
    return 'idle'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generate Label</DialogTitle>
          <DialogDescription>
            Generate a printable label for <span className="font-medium">{itemName}</span> (SKU: {sku})
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
              Label generated successfully and downloaded!
            </AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Customize label dimensions (optional). Leave blank to use defaults (80mm x 50mm).
              </p>

              <div className="grid grid-cols-2 gap-3">
                {/* Width Field */}
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
                          className={cn(
                            'text-sm',
                            getFieldState('width_mm') === 'error' &&
                              'border-red-500 focus-visible:ring-red-500',
                            getFieldState('width_mm') === 'success' &&
                              'border-green-500 focus-visible:ring-green-500'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Height Field */}
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
                          className={cn(
                            'text-sm',
                            getFieldState('height_mm') === 'error' &&
                              'border-red-500 focus-visible:ring-red-500',
                            getFieldState('height_mm') === 'success' &&
                              'border-green-500 focus-visible:ring-green-500'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* Margin Field */}
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
                          className={cn(
                            'text-sm',
                            getFieldState('margin_mm') === 'error' &&
                              'border-red-500 focus-visible:ring-red-500',
                            getFieldState('margin_mm') === 'success' &&
                              'border-green-500 focus-visible:ring-green-500'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />

                {/* QR Size Field */}
                <FormField
                  control={form.control}
                  name="qr_size_mm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">QR Size (mm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="40"
                          className={cn(
                            'text-sm',
                            getFieldState('qr_size_mm') === 'error' &&
                              'border-red-500 focus-visible:ring-red-500',
                            getFieldState('qr_size_mm') === 'success' &&
                              'border-green-500 focus-visible:ring-green-500'
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Font Size Field */}
              <FormField
                control={form.control}
                name="font_size"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Font Size (pt)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="24.0"
                        className={cn(
                          'text-sm',
                          getFieldState('font_size') === 'error' &&
                            'border-red-500 focus-visible:ring-red-500',
                          getFieldState('font_size') === 'success' &&
                            'border-green-500 focus-visible:ring-green-500'
                        )}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Text size for SKU label
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isGenerating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate Label
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

