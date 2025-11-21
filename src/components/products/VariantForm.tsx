import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ProductVariant } from '@/types/api'

const variantSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  retail_price: z.number().min(0, 'Retail price must be positive').optional(),
  wholesale_price: z.number().min(0, 'Wholesale price must be positive').optional(),
  use_parent_pricing: z.boolean(),
})

type FormValues = z.infer<typeof variantSchema>

interface VariantFormProps {
  initialData?: Partial<ProductVariant>
  onSubmit: (data: FormValues & { attributes?: Record<string, any> }) => void
  isLoading?: boolean
  submitLabel?: string
}

export function VariantForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  submitLabel = 'Save' 
}: VariantFormProps) {
  const [attributes, setAttributes] = useState<Record<string, string>>(
    initialData?.attributes || {}
  )
  const [newAttrKey, setNewAttrKey] = useState('')
  const [newAttrValue, setNewAttrValue] = useState('')

  const form = useForm<FormValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: {
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      retail_price: initialData?.retail_price || undefined,
      wholesale_price: initialData?.wholesale_price || undefined,
      use_parent_pricing: !initialData?.retail_price && !initialData?.wholesale_price,
    },
    mode: 'onChange',
  })

  const useParentPricing = form.watch('use_parent_pricing')

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

  const addAttribute = () => {
    if (newAttrKey && newAttrValue) {
      setAttributes({ ...attributes, [newAttrKey]: newAttrValue })
      setNewAttrKey('')
      setNewAttrValue('')
    }
  }

  const removeAttribute = (key: string) => {
    const newAttrs = { ...attributes }
    delete newAttrs[key]
    setAttributes(newAttrs)
  }

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      ...values,
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    })
  }

  return (
    <>
      {Object.keys(form.formState.dirtyFields).length > 0 && (
        <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            <div className="space-y-1">
              <div className="font-medium">Form Status:</div>
              <div className="text-sm">
                {form.formState.isValid ? (
                  <span className="text-green-700 dark:text-green-400 font-medium">
                    ✓ All fields are valid! Ready to submit.
                  </span>
                ) : (
                  <span className="text-orange-700 dark:text-orange-400">
                    {Object.keys(form.formState.errors).length} field(s) need attention
                  </span>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Variant Name *</span>
                  {getValidationIcon('name')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Small Blue"
                    className={cn(
                      getFieldState('name') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('name') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    disabled={isLoading}
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Descriptive name for this variant (e.g., size, color)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>SKU *</span>
                  {getValidationIcon('sku')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="TSHIRT-001-S-BLU"
                    className={cn(
                      getFieldState('sku') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('sku') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    disabled={isLoading || !!initialData?.sku}
                    autoComplete="off"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>
                  Unique identifier for this variant
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="use_parent_pricing"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    className="h-4 w-4 rounded border-gray-300 mt-1"
                  />
                </FormControl>
                <div className="space-y-1 leading-none flex-1">
                  <FormLabel className="font-normal cursor-pointer">
                    Use parent product pricing
                  </FormLabel>
                  <FormDescription>
                    Inherit pricing from the base product
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="retail_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Retail Price</span>
                    {!useParentPricing && getValidationIcon('retail_price')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="29.99"
                      className={cn(
                        !useParentPricing && getFieldState('retail_price') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                        !useParentPricing && getFieldState('retail_price') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      disabled={isLoading || useParentPricing}
                      autoComplete="off"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty to use parent pricing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="wholesale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Wholesale Price</span>
                    {!useParentPricing && getValidationIcon('wholesale_price')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="19.99"
                      className={cn(
                        !useParentPricing && getFieldState('wholesale_price') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                        !useParentPricing && getFieldState('wholesale_price') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      disabled={isLoading || useParentPricing}
                      autoComplete="off"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty to use parent pricing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-2">
            <FormLabel>Attributes</FormLabel>
            <div className="space-y-2">
              {Object.entries(attributes).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Input value={`${key}: ${value}`} disabled className="flex-1" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttribute(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <div className="flex gap-2">
                <Input
                  name="attr_key"
                  placeholder="Key (e.g., size)"
                  value={newAttrKey}
                  onChange={(e) => setNewAttrKey(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                />
                <Input
                  name="attr_value"
                  placeholder="Value (e.g., L)"
                  value={newAttrValue}
                  onChange={(e) => setNewAttrValue(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAttribute}
                  disabled={!newAttrKey || !newAttrValue || isLoading}
                >
                  Add
                </Button>
              </div>
              <FormDescription>
                Add custom attributes like size, color, material, etc.
              </FormDescription>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading || form.formState.isSubmitting || !form.formState.isValid}
            >
              {isLoading || form.formState.isSubmitting ? 'Saving...' : submitLabel}
            </Button>
            {!form.formState.isValid && Object.keys(form.formState.dirtyFields).length > 0 && (
              <p className="text-sm text-center text-orange-600 dark:text-orange-400">
                Please fix the errors above to submit the form
              </p>
            )}
          </div>
        </form>
      </Form>
    </>
  )
}
