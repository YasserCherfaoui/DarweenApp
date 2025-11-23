import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface PrintTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrint: () => void
  onSkip: () => void
}

export function PrintTicketDialog({
  open,
  onOpenChange,
  onPrint,
  onSkip,
}: PrintTicketDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Print Ticket?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Do you want to print a receipt for this sale?
          </p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onSkip}>
            No, Skip
          </Button>
          <Button onClick={onPrint}>
            Yes, Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}


