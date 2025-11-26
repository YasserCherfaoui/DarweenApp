import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useSupplierOutstandingBalance } from '@/hooks/queries/use-supplier-bills'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, Plus } from 'lucide-react'
import { Link } from '@tanstack/react-router'

interface SupplierOutstandingBalanceCardProps {
  companyId: number
  supplierId: number
}

export function SupplierOutstandingBalanceCard({
  companyId,
  supplierId,
}: SupplierOutstandingBalanceCardProps) {
  const { data: outstandingBalance, isLoading } = useSupplierOutstandingBalance(
    companyId,
    supplierId
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Outstanding Balance
        </CardTitle>
        <CardDescription>
          Total amount owed to this supplier
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              ${outstandingBalance?.outstanding_amount?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to={"/companies/$companyId/suppliers/$supplierId/payments/new" as any}
              params={{ companyId: companyId.toString(), supplierId: supplierId.toString() } as any}
            >
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


