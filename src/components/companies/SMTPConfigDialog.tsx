import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { SMTPConfigForm } from './SMTPConfigForm'
import type { SMTPConfig, SMTPSecurityType } from '@/types/api'

interface SMTPConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
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
  title?: string
  description?: string
}

export function SMTPConfigDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
  title,
  description,
}: SMTPConfigDialogProps) {
  const handleSubmit = (data: {
    host: string
    user: string
    password?: string
    port: number
    from_name?: string
    security: SMTPSecurityType
    rate_limit?: number
    is_active?: boolean
  }) => {
    onSubmit(data)
    // Don't close automatically - let parent handle it after success
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {title || (initialData ? 'Edit SMTP Configuration' : 'Create SMTP Configuration')}
          </DialogTitle>
          <DialogDescription>
            {description ||
              (initialData
                ? 'Update your SMTP email configuration settings.'
                : 'Configure a new SMTP email account for sending emails. Leave password blank when editing to keep the current password.')}
          </DialogDescription>
        </DialogHeader>

        <SMTPConfigForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel={initialData ? 'Update' : 'Create'}
        />
      </DialogContent>
    </Dialog>
  )
}

