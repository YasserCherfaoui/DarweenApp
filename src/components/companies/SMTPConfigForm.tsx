import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import type { SMTPConfig, SMTPSecurityType } from '@/types/api'

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

const smtpConfigSchema = z.object({
  host: z.string().min(1, { message: 'Host is required' }),
  user: z.string().min(1, { message: 'User is required' }).email({ message: 'Please enter a valid email address' }),
  password: z.string().optional(),
  port: z.string().refine((val) => {
    const num = Number(val)
    return !isNaN(num) && num >= 1 && num <= 65535
  }, { message: 'Port must be between 1 and 65535' }),
  from_name: z.string().optional(),
  security: z.enum(['none', 'ssl', 'tls', 'starttls'], {
    required_error: 'Please select a security type',
  }),
  rate_limit: z.string().refine((val) => {
    const num = Number(val)
    return !isNaN(num) && num >= 1
  }, { message: 'Rate limit must be at least 1' }),
  is_active: z.boolean().default(true),
})

type FormValues = z.infer<typeof smtpConfigSchema>

interface SMTPConfigFormProps {
  initialData?: Partial<SMTPConfig>
  onSubmit: (data: {
    host: string
    user: string
    password?: string
    port: number
    from_name?: string
    security: SMTPSecurityType
    rate_limit?: number
    is_active?: boolean
  }) => void
  isLoading?: boolean
  submitLabel?: string
}

export function SMTPConfigForm({
  initialData,
  onSubmit,
  isLoading,
  submitLabel = 'Save',
}: SMTPConfigFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(smtpConfigSchema),
    defaultValues: {
      host: initialData?.host || '',
      user: initialData?.user || '',
      password: '',
      port: initialData?.port?.toString() || '587',
      from_name: initialData?.from_name || '',
      security: (initialData?.security || 'tls') as SMTPSecurityType,
      rate_limit: initialData?.rate_limit?.toString() || '80',
      is_active: initialData?.is_active ?? true,
    },
    mode: 'onChange',
  })

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
    onSubmit({
      host: values.host,
      user: values.user,
      password: values.password || undefined,
      port: Number(values.port),
      from_name: values.from_name || undefined,
      security: values.security,
      rate_limit: Number(values.rate_limit),
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

        {/* Host Field */}
        <FormField
          control={form.control}
          name="host"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>SMTP Host *</span>
                {getValidationIcon('host')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="smtp.gmail.com"
                  className={cn(
                    getFieldState('host') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('host') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The SMTP server hostname (e.g., smtp.gmail.com, smtp.outlook.com)
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* User Field */}
        <FormField
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>SMTP User (Email) *</span>
                {getValidationIcon('user')}
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  className={cn(
                    getFieldState('user') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('user') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The email address used for SMTP authentication
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* Password Field */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Password {initialData ? '(leave blank to keep current)' : '*'}</span>
                {field.value && getValidationIcon('password')}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    field.value && getFieldState('password') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    field.value && getFieldState('password') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {initialData 
                  ? 'Leave blank to keep the current password unchanged'
                  : 'The password for SMTP authentication'}
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Port Field */}
          <FormField
            control={form.control}
            name="port"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Port *</span>
                  {getValidationIcon('port')}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="587"
                    className={cn(
                      getFieldState('port') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                      getFieldState('port') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                    )}
                    disabled={isLoading}
                    min={1}
                    max={65535}
                    {...field}
                  />
                </FormControl>
                <FormDescription>SMTP server port (1-65535)</FormDescription>
                <FormMessage className="text-red-600 font-medium" />
              </FormItem>
            )}
          />

          {/* Security Field */}
          <FormField
            control={form.control}
            name="security"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center justify-between">
                  <span>Security *</span>
                  {getValidationIcon('security')}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger
                      className={cn(
                        getFieldState('security') === 'error' && 'border-red-500 focus:ring-red-500',
                        getFieldState('security') === 'success' && 'border-green-500 focus:ring-green-500'
                      )}
                    >
                      <SelectValue placeholder="Select security type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="starttls">STARTTLS</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Encryption method for SMTP connection</FormDescription>
                <FormMessage className="text-red-600 font-medium" />
              </FormItem>
            )}
          />
        </div>

        {/* From Name Field */}
        <FormField
          control={form.control}
          name="from_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>From Name</span>
                {field.value && getValidationIcon('from_name')}
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Company Name"
                  className={cn(
                    field.value && getFieldState('from_name') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Display name shown in the "From" field of sent emails (optional)
              </FormDescription>
              <FormMessage className="text-red-600 font-medium" />
            </FormItem>
          )}
        />

        {/* Rate Limit Field */}
        <FormField
          control={form.control}
          name="rate_limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center justify-between">
                <span>Rate Limit (emails per hour) *</span>
                {getValidationIcon('rate_limit')}
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="80"
                  className={cn(
                    getFieldState('rate_limit') === 'error' && 'border-red-500 focus-visible:ring-red-500',
                    getFieldState('rate_limit') === 'success' && 'border-green-500 focus-visible:ring-green-500'
                  )}
                  disabled={isLoading}
                  min={1}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Maximum number of emails that can be sent per hour. Default is 80 emails/hour.
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
                  Enable this SMTP configuration for sending emails. Inactive configs will not be used.
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

