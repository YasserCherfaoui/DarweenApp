import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EmailComposer } from './EmailComposer'

interface EmailComposerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  companyId: number
}

export function EmailComposerDialog({
  open,
  onOpenChange,
  companyId,
}: EmailComposerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compose Email</DialogTitle>
          <DialogDescription>
            Create and send an email using your company's SMTP configuration
          </DialogDescription>
        </DialogHeader>
        <EmailComposer
          companyId={companyId}
          onSuccess={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

