import { createRoute, useParams, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft } from 'lucide-react'
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
import { useCreateEntryBill, useWarehouseBills } from '@/hooks/queries/use-warehouse-bills'
import { rootRoute } from '@/main'
import { useFranchise } from '@/hooks/queries/use-franchises'

const entryBillFormSchema = z.object({
  exit_bill_id: z.number().min(1, 'Please select an exit bill'),
  notes: z.string().optional(),
})

type EntryBillFormValues = z.infer<typeof entryBillFormSchema>

export const FranchiseWarehouseBillsNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId/warehouse-bills/new',
  component: FranchiseWarehouseBillsNewPage,
})

function FranchiseWarehouseBillsNewPage() {
  const { franchiseId } = useParams({
    from: '/franchises/$franchiseId/warehouse-bills/new',
  })
  const franchiseIdNum = parseInt(franchiseId)
  const navigate = useNavigate()
  const createBill = useCreateEntryBill()

  // Get franchise to find parent company
  const { data: franchise } = useFranchise(franchiseIdNum)

  // Get completed exit bills for this franchise
  const { data: exitBillsData } = useWarehouseBills(
    franchise?.parent_company_id || 0,
    {
      page: 1,
      limit: 100,
    }
  )

  const exitBills =
    exitBillsData?.data.filter(
      (bill) =>
        bill.bill_type === 'exit' &&
        bill.franchise_id === franchiseIdNum &&
        bill.status === 'completed'
    ) || []

  const form = useForm<EntryBillFormValues>({
    resolver: zodResolver(entryBillFormSchema),
    defaultValues: {
      notes: '',
    },
  })

  const handleSubmit = async (values: EntryBillFormValues) => {
    await createBill.mutateAsync({
      franchiseId: franchiseIdNum,
      data: {
        exit_bill_id: values.exit_bill_id,
        notes: values.notes,
      },
    })
    navigate({ to: `/franchises/${franchiseId}/warehouse-bills` })
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: `/franchises/${franchiseId}/warehouse-bills` })}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Warehouse Bills
        </Button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create Entry Bill
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create an entry bill linked to a completed exit bill
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Entry Bill Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="exit_bill_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exit Bill</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(parseInt(value))
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
                              No completed exit bills available
                            </SelectItem>
                          ) : (
                            exitBills.map((bill) => (
                              <SelectItem
                                key={bill.id}
                                value={bill.id.toString()}
                              >
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

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createBill.isPending || exitBills.length === 0}
                >
                  {createBill.isPending ? 'Creating...' : 'Create Entry Bill'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}

