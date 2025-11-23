import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useReserveStock, useReleaseStock } from '@/hooks/queries/use-inventory'
import type { Inventory } from '@/types/api'

interface StockReservationDialogProps {
  inventory: Inventory | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function StockReservationDialog({
  inventory,
  open,
  onOpenChange,
}: StockReservationDialogProps) {
  const [activeTab, setActiveTab] = useState<'reserve' | 'release'>('reserve')
  const [quantity, setQuantity] = useState<string>('')
  const [referenceType, setReferenceType] = useState('')
  const [referenceId, setReferenceId] = useState('')
  const [notes, setNotes] = useState('')

  const reserveStock = useReserveStock(inventory?.id || 0)
  const releaseStock = useReleaseStock(inventory?.id || 0)

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inventory) return

    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty <= 0) return

    try {
      await reserveStock.mutateAsync({
        quantity: qty,
        reference_type: referenceType || undefined,
        reference_id: referenceId || undefined,
        notes: notes || undefined,
      })
      handleClose()
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const handleRelease = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!inventory) return

    const qty = parseInt(quantity, 10)
    if (isNaN(qty) || qty <= 0) return

    try {
      await releaseStock.mutateAsync({
        quantity: qty,
        notes: notes || undefined,
      })
      handleClose()
    } catch (error) {
      // Error is handled by the mutation hook
    }
  }

  const handleClose = () => {
    setQuantity('')
    setReferenceType('')
    setReferenceId('')
    setNotes('')
    setActiveTab('reserve')
    onOpenChange(false)
  }

  const quantityNumber = parseInt(quantity, 10)
  const isValidQuantity = !isNaN(quantityNumber) && quantityNumber > 0

  const maxReserveQuantity = inventory?.available_stock || 0
  const maxReleaseQuantity = inventory?.reserved_stock || 0

  const isReserveValid = isValidQuantity && quantityNumber <= maxReserveQuantity
  const isReleaseValid = isValidQuantity && quantityNumber <= maxReleaseQuantity

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Reserve/Release Stock</DialogTitle>
          <DialogDescription>
            Manage stock reservations for {inventory?.variant_name || 'this variant'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Current Stock Information</Label>
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Stock</p>
                <p className="text-lg font-semibold">{inventory?.stock || 0}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Reserved</p>
                <p className="text-lg font-semibold text-orange-600">
                  {inventory?.reserved_stock || 0}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Available</p>
                <p className="text-lg font-semibold text-green-600">
                  {inventory?.available_stock || 0}
                </p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'reserve' | 'release')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="reserve">Reserve Stock</TabsTrigger>
              <TabsTrigger value="release">Release Stock</TabsTrigger>
            </TabsList>

            <TabsContent value="reserve" className="space-y-4">
              <form onSubmit={handleReserve}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reserve-quantity">
                      Quantity to Reserve
                      <span className="text-sm text-gray-500 ml-2">
                        (max: {maxReserveQuantity})
                      </span>
                    </Label>
                    <Input
                      id="reserve-quantity"
                      type="number"
                      min="1"
                      max={maxReserveQuantity}
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                    {!isReserveValid && isValidQuantity && (
                      <p className="text-sm text-red-600">
                        Quantity exceeds available stock
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference-type">
                      Reference Type <span className="text-gray-500">(optional)</span>
                    </Label>
                    <Input
                      id="reference-type"
                      placeholder="e.g., Order, Transfer"
                      value={referenceType}
                      onChange={(e) => setReferenceType(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference-id">
                      Reference ID <span className="text-gray-500">(optional)</span>
                    </Label>
                    <Input
                      id="reference-id"
                      placeholder="e.g., ORD-12345"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reserve-notes">
                      Notes <span className="text-gray-500">(optional)</span>
                    </Label>
                    <Textarea
                      id="reserve-notes"
                      placeholder="Reason for reservation..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={reserveStock.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isReserveValid || reserveStock.isPending}
                    >
                      {reserveStock.isPending ? 'Reserving...' : 'Reserve Stock'}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="release" className="space-y-4">
              <form onSubmit={handleRelease}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="release-quantity">
                      Quantity to Release
                      <span className="text-sm text-gray-500 ml-2">
                        (max: {maxReleaseQuantity})
                      </span>
                    </Label>
                    <Input
                      id="release-quantity"
                      type="number"
                      min="1"
                      max={maxReleaseQuantity}
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                    />
                    {!isReleaseValid && isValidQuantity && (
                      <p className="text-sm text-red-600">
                        Quantity exceeds reserved stock
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="release-notes">
                      Notes <span className="text-gray-500">(optional)</span>
                    </Label>
                    <Textarea
                      id="release-notes"
                      placeholder="Reason for releasing stock..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={releaseStock.isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={!isReleaseValid || releaseStock.isPending}
                    >
                      {releaseStock.isPending ? 'Releasing...' : 'Release Stock'}
                    </Button>
                  </DialogFooter>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}




