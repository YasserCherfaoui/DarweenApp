import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Product, Supplier } from '@/types/api'

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(2, 'SKU must be at least 2 characters'),
  base_retail_price: z.number().min(0, 'Retail price must be positive'),
  base_wholesale_price: z.number().min(0, 'Wholesale price must be positive'),
  description: z.string().optional(),
  supplier_id: z.string().optional(),
  supplier_cost: z.number().min(0, 'Supplier cost must be positive').optional().or(z.literal(0)),
})

type FormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  initialData?: Partial<Product>
  suppliers?: Supplier[]
  onSubmit: (data: FormValues) => void
  isLoading?: boolean
  submitLabel?: string
}

export function ProductForm({ 
  initialData, 
  suppliers = [],
  onSubmit, 
  isLoading, 
  submitLabel = 'Save' 
}: ProductFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      sku: initialData?.sku || '',
      base_retail_price: initialData?.base_retail_price || 0,
      base_wholesale_price: initialData?.base_wholesale_price || 0,
      description: initialData?.description || '',
      supplier_id: initialData?.supplier_id?.toString() || '',
      supplier_cost: initialData?.supplier_cost || 0,
    },
    mode: 'onChange',
  })

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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Product Name *</span>
                  {getValidationIcon('name')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="T-Shirt"
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
                  Enter a descriptive name for your product
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
                    placeholder="TSHIRT-001"
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
                  Stock Keeping Unit - unique identifier for this product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="base_retail_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Base Retail Price *</span>
                    {getValidationIcon('base_retail_price')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="29.99"
                      className={cn(
                        getFieldState('base_retail_price') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                        getFieldState('base_retail_price') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      disabled={isLoading}
                      autoComplete="off"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Retail price for direct customers
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_wholesale_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Base Wholesale Price *</span>
                    {getValidationIcon('base_wholesale_price')}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="19.99"
                      className={cn(
                        getFieldState('base_wholesale_price') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                        getFieldState('base_wholesale_price') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                      )}
                      disabled={isLoading}
                      autoComplete="off"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Wholesale price for bulk orders
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => {
              const descLength = form.watch('description')?.length || 0
              
              return (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Description</span>
                    <span className="text-sm font-normal text-gray-500">
                      {descLength} characters
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description..."
                      className="resize-none"
                      rows={4}
                      disabled={isLoading}
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of your product (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          {/* Supplier Information Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Supplier Information (Optional)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="supplier_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Supplier</span>
                      {getValidationIcon('supplier_id')}
                    </FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(value === 'none' ? '' : value)} 
                      value={field.value || 'none'}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger
                          className={cn(
                            'w-full',
                            getFieldState('supplier_id') === 'error' && 'border-red-500 focus:ring-red-500',
                            getFieldState('supplier_id') === 'success' && 'border-green-500 focus:ring-green-500'
                          )}
                        >
                          <SelectValue placeholder="No supplier selected" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-w-[300px]">
                        <SelectItem value="none">
                          <span className="text-gray-500 italic">No supplier</span>
                        </SelectItem>
                        {suppliers
                          .filter(s => s.is_active)
                          .map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the supplier for this product (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="supplier_cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center justify-between">
                      <span>Supplier Cost</span>
                      {getValidationIcon('supplier_cost')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="15.00"
                        className={cn(
                          getFieldState('supplier_cost') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                          getFieldState('supplier_cost') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                        )}
                        disabled={isLoading}
                        autoComplete="off"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>
                      Cost you pay to the supplier
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
