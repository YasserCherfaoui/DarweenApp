import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ColumnKey, ColumnVisibility } from '@/hooks/use-column-visibility'
import { Columns } from 'lucide-react'

interface ColumnVisibilityDropdownProps {
  columnVisibility: ColumnVisibility
  onToggleColumn: (columnKey: ColumnKey) => void
  onResetToDefaults: () => void
}

const columnLabels: Record<ColumnKey, string> = {
  orderId: 'Order ID',
  customer: 'Customer',
  source: 'Source',
  status: 'Status',
  total: 'Total',
  date: 'Date',
  externalOrderId: 'External Order ID',
  customerPhone: 'Customer Phone',
  customerAddress: 'Customer Address',
  customerState: 'Customer State',
  productTotal: 'Product Total',
  deliveryCost: 'Delivery Cost',
  discount: 'Discount',
  shippingProvider: 'Shipping Provider',
  deliveryType: 'Delivery Type',
  customerComments: 'Customer Comments',
  orderItems: 'Order Items',
}

const defaultColumns: ColumnKey[] = [
  'orderId',
  'customer',
  'source',
  'status',
  'total',
  'date',
]

const additionalColumns: ColumnKey[] = [
  'externalOrderId',
  'customerPhone',
  'customerAddress',
  'customerState',
  'productTotal',
  'deliveryCost',
  'discount',
  'shippingProvider',
  'deliveryType',
  'customerComments',
  'orderItems',
]

export function ColumnVisibilityDropdown({
  columnVisibility,
  onToggleColumn,
  onResetToDefaults,
}: ColumnVisibilityDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns className="h-4 w-4 mr-2" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="max-h-[300px] overflow-y-auto">
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Default Columns
          </div>
          {defaultColumns.map((columnKey) => (
            <DropdownMenuCheckboxItem
              key={columnKey}
              checked={columnVisibility[columnKey]}
              onCheckedChange={() => onToggleColumn(columnKey)}
            >
              {columnLabels[columnKey]}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
            Additional Columns
          </div>
          {additionalColumns.map((columnKey) => (
            <DropdownMenuCheckboxItem
              key={columnKey}
              checked={columnVisibility[columnKey]}
              onCheckedChange={() => onToggleColumn(columnKey)}
            >
              {columnLabels[columnKey]}
            </DropdownMenuCheckboxItem>
          ))}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={onResetToDefaults}
          className="text-muted-foreground"
        >
          Reset to Defaults
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

