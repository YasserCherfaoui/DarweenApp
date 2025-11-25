import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useYalidineWilayas } from '@/hooks/queries/use-yalidine-api'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import type { YalidineConfig } from '@/types/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

const yalidineConfigSchema = z.object({
  api_id: z.string().min(1, { message: 'API ID is required' }),
  api_token: z.string().optional(),
  from_wilaya_id: z.number().nullable().optional(),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof yalidineConfigSchema>

interface YalidineConfigFormProps {
  initialData?: Partial<YalidineConfig>
  onSubmit: (data: {
    api_id: string
    api_token?: string
    from_wilaya_id?: number | null
    is_active?: boolean
  }) => void
  isLoading?: boolean
  submitLabel?: string
  hasValidDefaultYalidineConfig?: boolean
}

export function YalidineConfigForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Save',
  hasValidDefaultYalidineConfig = false,
}: YalidineConfigFormProps) {
  const { selectedCompany } = useSelectedCompany()
  const companyId = selectedCompany?.id || 0
  const canLoadWilayas = Boolean(companyId && hasValidDefaultYalidineConfig)
  const { data: wilayasData } = useYalidineWilayas(canLoadWilayas ? companyId : 0)

  const form = useForm<FormValues>({
    resolver: zodResolver(yalidineConfigSchema),
    defaultValues: {
      api_id: initialData?.api_id || '',
      api_token: '',
      from_wilaya_id: initialData?.from_wilaya_id ?? null,
      is_active: initialData?.is_active ?? true,
    },
    mode: 'onChange',
  })

  const wilayas = wilayasData?.data || []

  // Helper to get field validation state
  const getFieldState = (fieldName: keyof FormValues) => {
    const fieldState = form.getFieldState(fieldName)
    const fieldValue = form.watch(fieldName)
    
    if (!fieldState.isDirty) return 'idle'
    if (fieldState.error) return 'error'
    if (fieldValue && !fieldState.error) return 'success'
    return 'idle'
  }

  // Get validation icon based on field state
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

  const handleSubmit = (values: FormValues) => {
    // Validate that api_token is provided for new configs
    if (!initialData && !values.api_token) {
      form.setError('api_token', { message: 'API Token is required' })
      return
    }

    onSubmit({
      api_id: values.api_id,
      api_token: values.api_token || undefined,
      from_wilaya_id: values.from_wilaya_id ?? null,
      is_active: values.is_active,
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Form State Indicator */}
        {Object.keys(form.formState.dirtyFields).length > 0 && (
          <Alert className={cn(
            form.formState.isValid 
              ? "border-green-200 bg-green-50" 
              : "border-orange-200 bg-orange-50"
          )}>
            {form.formState.isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-orange-600" />
            )}
            <AlertDescription className={cn(
              form.formState.isValid ? "text-green-800" : "text-orange-800"
            )}>
              <div className="space-y-1">
                <div className="font-medium">Form Status:</div>
                <div className="text-sm">
                  {form.formState.isValid ? (
                    <span className="text-green-700 font-medium">✓ All fields are valid! Ready to submit.</span>
                  ) : (
                    <span className="text-orange-700">
                      {Object.keys(form.formState.errors).length} field(s) need attention
                    </span>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* API ID Field */}
        <FormField
          control={form.control}
          name="api_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>API ID *</span>
                {getValidationIcon('api_id')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter your Yalidine API ID"
                  className={cn(
                    getFieldState('api_id') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('api_id') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Your Yalidine API ID. You can find this in your Yalidine dashboard.
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* API Token Field */}
        <FormField
          control={form.control}
          name="api_token"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>API Token {initialData ? '(leave blank to keep current)' : '*'}</span>
                {field.value && getValidationIcon('api_token')}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    field.value && getFieldState('api_token') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    field.value && getFieldState('api_token') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {initialData 
                  ? 'Leave blank to keep the current API token unchanged'
                  : 'Your Yalidine API Token. Keep this secure and never share it.'}
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* From Wilaya ID Field */}
        <FormField
          control={form.control}
          name="from_wilaya_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Origin Wilaya (From Wilaya)</span>
                {field.value && getValidationIcon('from_wilaya_id')}
              </FormLabel>
              <FormControl>
                <Select
                  value={field.value?.toString() || 'none'}
                  onValueChange={(value) => {
                    field.onChange(value === 'none' ? null : parseInt(value))
                  }}
                  disabled={isLoading || !companyId || !canLoadWilayas}
                >
                  <SelectTrigger
                    className={cn(
                      getFieldState('from_wilaya_id') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('from_wilaya_id') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                  >
                    <SelectValue placeholder="Select origin wilaya (where you ship from)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Optional)</SelectItem>
                    {wilayas.map((wilaya) => (
                      <SelectItem key={wilaya.id} value={wilaya.id.toString()}>
                        {wilaya.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormDescription>
                {canLoadWilayas
                  ? 'Select the wilaya (state) where your company ships from. This is required for calculating delivery fees using the Yalidine fees API.'
                  : 'Set a default Yalidine configuration to fetch available wilayas, then edit again to choose the origin wilaya.'}
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* Is Active Checkbox */}
        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className={cn(
              "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4",
              getFieldState('is_active') === 'error' && 'border-red-500 bg-red-50'
            )}>
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <div className="space-y-1 leading-none flex-1">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Enable this Yalidine configuration for API calls. Inactive configs will not be used.
                </FormDescription>
                <FormMessage className="text-red-600 font-medium" />
              </div>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="space-y-2">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || form.formState.isSubmitting || !form.formState.isValid}
          >
            {isLoading || form.formState.isSubmitting ? 'Saving...' : submitLabel}
          </Button>
          {!form.formState.isValid && Object.keys(form.formState.dirtyFields).length > 0 && (
            <p className="text-sm text-center text-orange-600">
              Please fix the errors above to submit the form
            </p>
          )}
        </div>
      </form>
    </Form>
  )
}

