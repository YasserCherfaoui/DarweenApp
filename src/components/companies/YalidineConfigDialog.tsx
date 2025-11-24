import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { YalidineConfig } from '@/types/api'
import { YalidineConfigForm } from './YalidineConfigForm'

interface YalidineConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: Partial<YalidineConfig>
  onSubmit: (data: {
    api_id: string
    api_token?: string
    is_active?: boolean
  }) => void
  isLoading?: boolean
  title?: string
  description?: string
}

export function YalidineConfigDialog({
  open,
  onOpenChange,
  initialData,
  onSubmit,
  isLoading,
  title,
  description,
}: YalidineConfigDialogProps) {
  const handleSubmit = (data: {
    api_id: string
    api_token?: string
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
            {title || (initialData ? 'Edit Yalidine Configuration' : 'Create Yalidine Configuration')}
          </DialogTitle>
          <DialogDescription>
            {description ||
              (initialData
                ? 'Update your Yalidine API configuration settings.'
                : 'Configure a new Yalidine API account for shipping management. Leave API token blank when editing to keep the current token.')}
          </DialogDescription>
        </DialogHeader>

        <YalidineConfigForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          submitLabel={initialData ? 'Update' : 'Create'}
        />
      </DialogContent>
    </Dialog>
  )
}

