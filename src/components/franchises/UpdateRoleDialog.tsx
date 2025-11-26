import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { UserWithRole, UserRole } from '@/types/api'

const cn = (...classes: (string | boolean | undefined)[]) => {
  return classes.filter(Boolean).join(' ')
}

const updateRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'manager', 'employee'], {
    message: 'Please select a role',
  }),
})

type FormValues = z.infer<typeof updateRoleSchema>

interface UpdateRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: FormValues) => void
  user: UserWithRole | null
  isLoading?: boolean
}

export function UpdateRoleDialog({
  open,
  onOpenChange,
  onSubmit,
  user,
  isLoading,
}: UpdateRoleDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(updateRoleSchema),
    defaultValues: {
      role: user?.role || 'employee',
    },
    mode: 'onChange',
  })

  // Update form when user changes
  if (user && form.getValues('role') !== user.role) {
    form.reset({ role: user.role as UserRole })
  }

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

  const handleSubmit = (values: FormValues) => {
    onSubmit(values)
  }

  const handleCancel = () => {
    onOpenChange(false)
    if (user) {
      form.reset({ role: user.role as UserRole })
    }
  }

  if (!user) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            Update the role for {user.first_name} {user.last_name} ({user.email})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center justify-between">
                    <span>Role *</span>
                    {getValidationIcon('role')}
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    disabled={isLoading || user.role === 'owner'}
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          getFieldState('role') === 'error' && 'border-red-500 focus:ring-red-500',
                          getFieldState('role') === 'success' && 'border-green-500 focus:ring-green-500'
                        )}
                      >
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      {user.role === 'owner' && (
                        <SelectItem value="owner">Owner</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    <div className="space-y-1 pt-1">
                      <p><strong>Owner:</strong> Full control over the franchise</p>
                      <p><strong>Admin:</strong> Can manage users and settings</p>
                      <p><strong>Manager:</strong> Can manage inventory and operations</p>
                      <p><strong>Employee:</strong> Basic access to view and update inventory</p>
                      {user.role === 'owner' && (
                        <p className="text-orange-600 font-medium mt-2">
                          Note: Owner role cannot be changed
                        </p>
                      )}
                    </div>
                  </FormDescription>
                  <FormMessage className="text-red-600 font-medium" />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !form.formState.isValid || user.role === 'owner'} 
                className="flex-1"
              >
                {isLoading ? 'Updating...' : 'Update Role'}
              </Button>
            </div>
            
            {!form.formState.isValid && Object.keys(form.formState.dirtyFields).length > 0 && (
              <p className="text-sm text-center text-orange-600">
                Please fix the errors above to submit
              </p>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

