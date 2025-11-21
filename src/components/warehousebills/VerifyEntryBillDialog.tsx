import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import type {
  WarehouseBill,
  WarehouseBillItem,
  VerifyEntryBillRequest,
  VerifyEntryBillItemRequest,
} from '@/types/api'

const verifyFormSchema = z.object({
  notes: z.string().optional(),
})

type VerifyFormValues = z.infer<typeof verifyFormSchema>

interface VerifyEntryBillDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bill: WarehouseBill | null
  onSubmit: (data: VerifyEntryBillRequest) => void
  isLoading?: boolean
}

export function VerifyEntryBillDialog({
  open,
  onOpenChange,
  bill,
  onSubmit,
  isLoading,
}: VerifyEntryBillDialogProps) {
  const [receivedItems, setReceivedItems] = useState<
    Map<number, number>
  >(new Map())

  const form = useForm<VerifyFormValues>({
    resolver: zodResolver(verifyFormSchema),
    defaultValues: {
      notes: '',
    },
  })

  useEffect(() => {
    if (bill && bill.items) {
      // Initialize received items with expected quantities
      const initialMap = new Map<number, number>()
      bill.items.forEach((item) => {
        initialMap.set(item.product_variant_id, item.expected_quantity)
      })
      setReceivedItems(initialMap)
    }
  }, [bill])

  const handleQuantityChange = (variantId: number, quantity: number) => {
    const newMap = new Map(receivedItems)
    newMap.set(variantId, Math.max(0, quantity))
    setReceivedItems(newMap)
  }

  const handleSubmit = (values: VerifyFormValues) => {
    if (!bill) return

    const items: VerifyEntryBillItemRequest[] = Array.from(
      receivedItems.entries()
    ).map(([product_variant_id, received_quantity]) => ({
      product_variant_id,
      received_quantity,
    }))

    onSubmit({
      items,
      notes: values.notes,
    })
  }

  if (!bill || !bill.items) return null

  const getDiscrepancyInfo = (item: WarehouseBillItem) => {
    const received = receivedItems.get(item.product_variant_id) || 0
    const expected = item.expected_quantity

    if (received === 0 && expected > 0) {
      return { type: 'missing', message: 'Missing item' }
    }
    if (received > 0 && expected === 0) {
      return { type: 'extra', message: 'Extra item' }
    }
    if (received !== expected && received > 0 && expected > 0) {
      return {
        type: 'mismatch',
        message: `Expected ${expected}, received ${received}`,
      }
    }
    return { type: 'none', message: 'No discrepancy' }
  }

  const hasDiscrepancies = bill.items.some((item) => {
    const info = getDiscrepancyInfo(item)
    return info.type !== 'none'
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Verify Entry Bill</DialogTitle>
          <DialogDescription>
            Record the actual quantities received and check for discrepancies
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 font-semibold text-sm border-b pb-2">
                <div>Product</div>
                <div className="text-right">Expected</div>
                <div className="text-right">Received</div>
                <div className="text-center">Status</div>
                <div className="text-right">Difference</div>
              </div>

              {bill.items.map((item) => {
                const received = receivedItems.get(item.product_variant_id) || 0
                const expected = item.expected_quantity
                const difference = received - expected
                const discrepancy = getDiscrepancyInfo(item)

                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-5 gap-4 items-center p-3 border rounded-lg"
                  >
                    <div>
                      <div className="font-medium">
                        {item.variant_name ||
                          item.product_name ||
                          `Variant #${item.product_variant_id}`}
                      </div>
                      {item.variant_sku && (
                        <div className="text-sm text-gray-500">
                          SKU: {item.variant_sku}
                        </div>
                      )}
                    </div>
                    <div className="text-right">{expected}</div>
                    <div className="text-right">
                      <Input
                        type="number"
                        min="0"
                        value={received}
                        onChange={(e) =>
                          handleQuantityChange(
                            item.product_variant_id,
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-24 ml-auto"
                        disabled={isLoading}
                      />
                    </div>
                    <div className="text-center">
                      {discrepancy.type === 'none' ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          OK
                        </Badge>
                      ) : discrepancy.type === 'missing' ? (
                        <Badge className="bg-red-500">
                          <XCircle className="h-3 w-3 mr-1" />
                          Missing
                        </Badge>
                      ) : discrepancy.type === 'extra' ? (
                        <Badge className="bg-yellow-500">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Extra
                        </Badge>
                      ) : (
                        <Badge className="bg-orange-500">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Mismatch
                        </Badge>
                      )}
                    </div>
                    <div
                      className={`text-right font-semibold ${
                        difference > 0
                          ? 'text-green-600'
                          : difference < 0
                          ? 'text-red-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {difference > 0 ? '+' : ''}
                      {difference}
                    </div>
                  </div>
                )
              })}
            </div>

            {hasDiscrepancies && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Discrepancies detected. Please review the items above before
                  submitting.
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add notes about the verification..."
                      rows={3}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify & Record Discrepancies'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

