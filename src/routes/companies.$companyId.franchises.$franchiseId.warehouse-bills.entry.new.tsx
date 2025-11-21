import { createRoute, useParams, useNavigate, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Plus, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateEntryBill, useWarehouseBill, useWarehouseBills } from '@/hooks/queries/use-warehouse-bills'
import { rootRoute } from '@/main'
import { useFranchise } from '@/hooks/queries/use-franchises'
import { EntryBillItemVerification } from '@/components/warehousebills/EntryBillItemVerification'
import { DiscrepancyWarningDialog } from '@/components/warehousebills/DiscrepancyWarningDialog'
import { AddExtraItemDialog } from '@/components/warehousebills/AddExtraItemDialog'
import type { WarehouseBillItem, ProductVariant } from '@/types/api'

const entryBillFormSchema = z.object({
  exit_bill_id: z.number().min(1, 'Please select an exit bill'),
  notes: z.string().optional(),
})

type EntryBillFormValues = z.infer<typeof entryBillFormSchema>

export const CompanyFranchiseWarehouseBillsEntryNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/franchises/$franchiseId/warehouse-bills/entry/new',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      exit_bill_id: search.exit_bill_id
        ? parseInt(String(search.exit_bill_id))
        : undefined,
    }
  },
  component: CompanyFranchiseWarehouseBillsEntryNewPage,
})

function CompanyFranchiseWarehouseBillsEntryNewPage() {
  const { companyId, franchiseId } = useParams({
    from: '/companies/$companyId/franchises/$franchiseId/warehouse-bills/entry/new',
  })
  const search = useSearch({
    from: '/companies/$companyId/franchises/$franchiseId/warehouse-bills/entry/new',
  })
  const companyIdNum = parseInt(companyId)
  const franchiseIdNum = parseInt(franchiseId)
  const navigate = useNavigate()
  const createBill = useCreateEntryBill()

  // State for item verification
  const [selectedExitBillId, setSelectedExitBillId] = useState<number | null>(
    search.exit_bill_id || null
  )
  const [receivedItems, setReceivedItems] = useState<Map<number, number>>(new Map())
  const [extraItems, setExtraItems] = useState<
    Array<{ product_variant_id: number; variant?: ProductVariant }>
  >([])
  const [showAddExtraDialog, setShowAddExtraDialog] = useState(false)
  const [showWarningDialog, setShowWarningDialog] = useState(false)

  // Get franchise to verify it exists
  const { data: franchise } = useFranchise(franchiseIdNum)

  // Get completed exit bills for this franchise
  const { data: exitBillsData } = useWarehouseBills(companyIdNum, {
    page: 1,
    limit: 100,
    franchise_id: franchiseIdNum,
    bill_type: 'exit',
    status: 'completed',
  })

  const exitBills =
    exitBillsData?.data.filter(
      (bill) =>
        bill.bill_type === 'exit' &&
        bill.franchise_id === franchiseIdNum &&
        bill.status === 'completed'
    ) || []

  // Get selected exit bill details
  const { data: exitBill } = useWarehouseBill(
    companyIdNum,
    selectedExitBillId || 0
  )

  const form = useForm<EntryBillFormValues>({
    resolver: zodResolver(entryBillFormSchema),
    defaultValues: {
      exit_bill_id: search.exit_bill_id || undefined,
      notes: '',
    },
  })

  // Initialize received items when exit bill is selected
  useEffect(() => {
    if (exitBill?.items) {
      const initialMap = new Map<number, number>()
      exitBill.items.forEach((item) => {
        initialMap.set(item.product_variant_id, item.expected_quantity)
      })
      setReceivedItems(initialMap)
    }
  }, [exitBill])

  // Update form when exit bill changes
  useEffect(() => {
    if (selectedExitBillId) {
      form.setValue('exit_bill_id', selectedExitBillId)
    }
  }, [selectedExitBillId, form])

  const handleReceivedQuantityChange = (variantId: number, quantity: number) => {
    const newMap = new Map(receivedItems)
    newMap.set(variantId, Math.max(0, quantity))
    setReceivedItems(newMap)
  }

  const handleMarkMissing = (variantId: number) => {
    handleReceivedQuantityChange(variantId, 0)
  }

  const handleAddExtraItem = (variant: ProductVariant) => {
    // Check if already added
    if (extraItems.some((item) => item.product_variant_id === variant.id)) {
      return
    }
    setExtraItems([...extraItems, { product_variant_id: variant.id, variant }])
    // Initialize received quantity to 1 for extra items
    const newMap = new Map(receivedItems)
    newMap.set(variant.id, 1)
    setReceivedItems(newMap)
  }

  const handleRemoveExtraItem = (variantId: number) => {
    setExtraItems(extraItems.filter((item) => item.product_variant_id !== variantId))
    const newMap = new Map(receivedItems)
    newMap.delete(variantId)
    setReceivedItems(newMap)
  }

  // Calculate discrepancy summary
  const calculateDiscrepancySummary = () => {
    if (!exitBill?.items) return null

    const missingItems: Array<{ item: WarehouseBillItem; expected: number }> = []
    const mismatchItems: Array<{ item: WarehouseBillItem; expected: number; received: number }> = []

    exitBill.items.forEach((item) => {
      const received = receivedItems.get(item.product_variant_id) || 0
      const expected = item.expected_quantity

      if (received === 0 && expected > 0) {
        missingItems.push({ item, expected })
      } else if (received !== expected && received > 0 && expected > 0) {
        mismatchItems.push({ item, expected, received })
      }
    })

    const extraItemsWithReceived = extraItems.map((extra) => ({
      product_variant_id: extra.product_variant_id,
      received: receivedItems.get(extra.product_variant_id) || 0,
      variant: extra.variant,
    }))

    return {
      missingCount: missingItems.length,
      mismatchCount: mismatchItems.length,
      extraCount: extraItems.length,
      missingItems,
      mismatchItems,
      extraItems: extraItemsWithReceived,
    }
  }

  const discrepancySummary = calculateDiscrepancySummary()
  const hasDiscrepancies =
    discrepancySummary &&
    (discrepancySummary.missingCount > 0 ||
      discrepancySummary.mismatchCount > 0 ||
      discrepancySummary.extraCount > 0)

  const handleSubmit = async (values: EntryBillFormValues) => {
    if (!exitBill?.items) return

    // Prepare items array
    const items: Array<{ product_variant_id: number; received_quantity: number }> = []

    // Add items from exit bill
    exitBill.items.forEach((item) => {
      items.push({
        product_variant_id: item.product_variant_id,
        received_quantity: receivedItems.get(item.product_variant_id) || 0,
      })
    })

    // Add extra items
    extraItems.forEach((extra) => {
      const received = receivedItems.get(extra.product_variant_id) || 0
      if (received > 0) {
        items.push({
          product_variant_id: extra.product_variant_id,
          received_quantity: received,
        })
      }
    })

    // If discrepancies exist, show warning dialog
    if (hasDiscrepancies) {
      setShowWarningDialog(true)
      return
    }

    // No discrepancies, submit directly
    await createBill.mutateAsync({
      franchiseId: franchiseIdNum,
      data: {
        exit_bill_id: values.exit_bill_id,
        notes: values.notes,
        items,
      },
    })
    navigate({ to: `/companies/${companyId}/franchises/${franchiseId}` })
  }

  const handleConfirmSubmit = async (values: EntryBillFormValues) => {
    if (!exitBill?.items) return

    // Prepare items array
    const items: Array<{ product_variant_id: number; received_quantity: number }> = []

    // Add items from exit bill
    exitBill.items.forEach((item) => {
      items.push({
        product_variant_id: item.product_variant_id,
        received_quantity: receivedItems.get(item.product_variant_id) || 0,
      })
    })

    // Add extra items
    extraItems.forEach((extra) => {
      const received = receivedItems.get(extra.product_variant_id) || 0
      if (received > 0) {
        items.push({
          product_variant_id: extra.product_variant_id,
          received_quantity: received,
        })
      }
    })

    setShowWarningDialog(false)
    await createBill.mutateAsync({
      franchiseId: franchiseIdNum,
      data: {
        exit_bill_id: values.exit_bill_id,
        notes: values.notes,
        items,
      },
    })
    navigate({ to: `/companies/${companyId}/franchises/${franchiseId}` })
  }


  const existingVariantIds = [
    ...(exitBill?.items?.map((item) => item.product_variant_id) || []),
    ...extraItems.map((item) => item.product_variant_id),
  ]

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: `/companies/${companyId}/franchises/${franchiseId}` })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Franchise
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Entry Bill
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Verify items one-by-one before creating entry bill for{' '}
            {franchise?.name || 'franchise'}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Step 1: Select Exit Bill */}
            <Card>
              <CardHeader>
                <CardTitle>Select Exit Bill</CardTitle>
                <CardDescription>
                  Choose a completed exit bill to create entry bill from
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="exit_bill_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Bill</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const billId = parseInt(value)
                          setSelectedExitBillId(billId)
                          field.onChange(billId)
                          // Reset verification state
                          setReceivedItems(new Map())
                          setExtraItems([])
                        }}
                        value={field.value?.toString()}
                        disabled={createBill.isPending}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an exit bill" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {exitBills.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No completed exit bills available for this franchise
                            </SelectItem>
                          ) : (
                            exitBills.map((bill) => (
                              <SelectItem key={bill.id} value={bill.id.toString()}>
                                {bill.bill_number} - ${bill.total_amount.toFixed(2)} -{' '}
                                {new Date(bill.created_at).toLocaleDateString()}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Step 2: Verify Items */}
            {exitBill?.items && exitBill.items.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Verify Items</CardTitle>
                      <CardDescription>
                        Check each item and enter received quantities
                      </CardDescription>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddExtraDialog(true)}
                      disabled={createBill.isPending}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Extra Item
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <EntryBillItemVerification
                    exitBillItems={exitBill.items}
                    receivedItems={receivedItems}
                    extraItems={extraItems}
                    onReceivedQuantityChange={handleReceivedQuantityChange}
                    onMarkMissing={handleMarkMissing}
                    onRemoveExtraItem={handleRemoveExtraItem}
                    isLoading={createBill.isPending}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 3: Discrepancy Summary */}
            {exitBill?.items && discrepancySummary && (
              <Card>
                <CardHeader>
                  <CardTitle>Discrepancy Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                        {exitBill.items.length}
                      </div>
                      <div className="text-sm text-gray-500">Total Items</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-red-600">
                        {discrepancySummary.missingCount}
                      </div>
                      <div className="text-sm text-gray-500">Missing</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">
                        {discrepancySummary.mismatchCount}
                      </div>
                      <div className="text-sm text-gray-500">Mismatches</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {discrepancySummary.extraCount}
                      </div>
                      <div className="text-sm text-gray-500">Extra Items</div>
                    </div>
                  </div>

                  {hasDiscrepancies && (
                    <Alert className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Discrepancies detected. Review the items above and confirm to proceed.
                        Inventory will be updated according to received quantities.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 4: Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about this entry bill..."
                          rows={4}
                          {...field}
                          disabled={createBill.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={
                createBill.isPending ||
                !selectedExitBillId ||
                !exitBill?.items ||
                exitBill.items.length === 0
              }
            >
              {createBill.isPending ? 'Creating...' : 'Create Entry Bill'}
            </Button>
          </form>
        </Form>

        {/* Discrepancy Warning Dialog */}
        {discrepancySummary && (
          <DiscrepancyWarningDialog
            open={showWarningDialog}
            onOpenChange={setShowWarningDialog}
            summary={discrepancySummary}
            onConfirm={() => handleConfirmSubmit(form.getValues())}
            isLoading={createBill.isPending}
          />
        )}

        {/* Add Extra Item Dialog */}
        <AddExtraItemDialog
          open={showAddExtraDialog}
          onOpenChange={setShowAddExtraDialog}
          companyId={companyIdNum}
          onAddItem={handleAddExtraItem}
          existingVariantIds={existingVariantIds}
        />
      </div>
    </RoleBasedLayout>
  )
}