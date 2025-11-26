import { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInventoryMovements, useInventoryMovementsWithFilters } from '@/hooks/queries/use-inventory'
import { Label } from '@/components/ui/label'
import { SaleDetailsDialog } from '@/components/pos/SaleDetailsDialog'
import { apiClient } from '@/lib/api-client'
import type { Inventory, InventoryMovement, SupplierBill, WarehouseBill } from '@/types/api'
import {
  ArrowUp,
  ArrowDown,
  Settings,
  Lock,
  Unlock,
  ShoppingCart,
  RotateCcw,
  Package,
  ArrowRightLeft,
  Receipt,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface InventoryHistoryPageProps {
  inventory: Inventory | null
  companyId: number
}

const movementTypeConfig = {
  adjustment: {
    label: 'Adjustment',
    icon: Settings,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  in: {
    label: 'Stock In',
    icon: ArrowUp,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  out: {
    label: 'Stock Out',
    icon: ArrowDown,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  reserve: {
    label: 'Reserved',
    icon: Lock,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  },
  release: {
    label: 'Released',
    icon: Unlock,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  },
  sale: {
    label: 'Sale',
    icon: ShoppingCart,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  return: {
    label: 'Return',
    icon: RotateCcw,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  purchase: {
    label: 'Purchase',
    icon: Package,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  supplier_bill: {
    label: 'Supplier Bill',
    icon: Receipt,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  },
  'supplier_bill_update': {
    label: 'Bill Update',
    icon: Receipt,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
  'supplier_bill_delete': {
    label: 'Bill Deletion',
    icon: Receipt,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  },
  transfer: {
    label: 'Transfer',
    icon: ArrowRightLeft,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  },
}

export function InventoryHistoryPage({ inventory, companyId }: InventoryHistoryPageProps) {
  const navigate = useNavigate()
  const [saleDetailsDialogOpen, setSaleDetailsDialogOpen] = useState(false)
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null)
  const [movementTypeFilter, setMovementTypeFilter] = useState<string>('all')
  const [dateFilterMode, setDateFilterMode] = useState<'none' | 'single' | 'range'>('none')
  const [singleDate, setSingleDate] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Fetch movements with filters for table
  const filterParams = useMemo(() => {
    let formattedStartDate: string | undefined
    let formattedEndDate: string | undefined
    
    if (dateFilterMode === 'single' && singleDate) {
      // Single date: filter for that specific day (start to end of day)
      formattedStartDate = `${singleDate}T00:00:00Z`
      formattedEndDate = `${singleDate}T23:59:59Z`
    } else if (dateFilterMode === 'range') {
      // Date range: use start and end dates
      if (startDate) {
        formattedStartDate = `${startDate}T00:00:00Z`
      }
      if (endDate) {
        formattedEndDate = `${endDate}T23:59:59Z`
      }
    }
    
    return {
      page: currentPage,
      limit: itemsPerPage,
      movement_type: movementTypeFilter && movementTypeFilter !== 'all' ? movementTypeFilter : undefined,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
    }
  }, [currentPage, movementTypeFilter, dateFilterMode, singleDate, startDate, endDate])

  const { data: movementsData, isLoading } = useInventoryMovementsWithFilters(
    inventory?.id || 0,
    filterParams
  )

  // Fetch all movements for charts (no filters, limited to reasonable amount)
  const { data: allMovementsData } = useInventoryMovements(
    inventory?.id || 0,
    { page: 1, limit: 1000 }
  )
  
  const allMovements = allMovementsData?.movements || []

  const movements = movementsData?.movements || []
  const totalPages = movementsData?.total_pages || 0
  const totalMovements = movementsData?.total || 0

  // Helper function to check if movement is clickable
  const isClickable = (movement: InventoryMovement) => {
    if (!movement.reference_type || !movement.reference_id || !inventory?.company_id) {
      return false
    }
    return (
      movement.reference_type === 'sale' ||
      movement.reference_type === 'supplier_bill' ||
      movement.reference_type === 'supplier_bill_update' ||
      movement.reference_type === 'supplier_bill_delete' ||
      movement.reference_type === 'warehouse_bill'
    )
  }

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1)
  }

  const handleDateModeChange = (mode: 'none' | 'single' | 'range') => {
    setDateFilterMode(mode)
    setSingleDate('')
    setStartDate('')
    setEndDate('')
    handleFilterChange()
  }

  // Prepare chart data for stock over time (using all movements)
  const stockChartData = useMemo(() => {
    if (!allMovements || allMovements.length === 0) return []
    
    // Sort by date ascending for the chart
    const sorted = [...allMovements].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    
    return sorted.map((m) => {
      const movementType = m.movement_type.toLowerCase() as keyof typeof movementTypeConfig
      const config = movementTypeConfig[movementType] || movementTypeConfig.adjustment
      
      return {
        date: new Date(m.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        timestamp: new Date(m.created_at).getTime(),
        stock: m.new_stock,
        movement: m, // Store full movement data
        movementType: config.label,
        quantity: m.quantity,
        previousStock: m.previous_stock,
        referenceType: m.reference_type,
        referenceId: m.reference_id,
        notes: m.notes,
        isClickable: isClickable(m),
      }
    })
  }, [allMovements, inventory?.company_id])

  // Prepare chart data for movement types (using all movements)
  const movementTypeChartData = useMemo(() => {
    if (!allMovements || allMovements.length === 0) return []
    
    const typeCounts: Record<string, number> = {}
    
    allMovements.forEach((m) => {
      const type = m.movement_type.toLowerCase()
      typeCounts[type] = (typeCounts[type] || 0) + 1
    })
    
    return Object.entries(typeCounts).map(([type, count]) => {
      const config = movementTypeConfig[type as keyof typeof movementTypeConfig]
      return {
        type: config?.label || type,
        count,
      }
    }).sort((a, b) => b.count - a.count)
  }, [allMovements])

  const handleMovementClick = async (movement: InventoryMovement) => {
    if (!movement.reference_type || !movement.reference_id || !inventory?.company_id) {
      return
    }

    if (movement.reference_type === 'sale') {
      const saleId = parseInt(movement.reference_id, 10)
      if (!isNaN(saleId)) {
        setSelectedSaleId(saleId)
        setSaleDetailsDialogOpen(true)
      }
    } else if (
      movement.reference_type === 'supplier_bill' ||
      movement.reference_type === 'supplier_bill_update' ||
      movement.reference_type === 'supplier_bill_delete'
    ) {
      const billId = parseInt(movement.reference_id, 10)
      if (!isNaN(billId) && inventory?.product_variant_id) {
        try {
          const billResponse = await apiClient.suppliers.bills.getById(companyId, billId)
          const bill: SupplierBill | undefined = billResponse.data
          if (!bill) return

          const matchingItem = bill.items?.find(
            (item) => item.product_variant_id === inventory.product_variant_id
          )

          if (bill && bill.supplier_id) {
            // Navigate to the bill details page with highlighted item
            navigate({
              to: '/companies/$companyId/suppliers/$supplierId/bills/$billId',
              params: {
                companyId: companyId.toString(),
                supplierId: bill.supplier_id.toString(),
                billId: billId.toString(),
              },
              search: { highlightedItemId: matchingItem?.id },
            })
          }
        } catch (error) {
          console.error('Failed to fetch supplier bill:', error)
        }
      }
    } else if (movement.reference_type === 'warehouse_bill') {
      const billId = parseInt(movement.reference_id, 10)
      if (!isNaN(billId) && inventory?.product_variant_id) {
        try {
          // Fetch the warehouse bill to find matching item
          const billResponse = await apiClient.warehouseBills.getByCompany(companyId, billId)
          const bill: WarehouseBill | undefined = billResponse.data

          if (!bill) {
            return
          }

          // Find the item that matches this product variant
          const matchingItem = bill.items?.find(
            (item) => item.product_variant_id === inventory.product_variant_id
          )

          // Navigate to the warehouse bill details page with highlighted item
          navigate({
            to: '/companies/$companyId/warehouse-bills/$billId',
            params: {
              companyId: companyId.toString(),
              billId: billId.toString(),
            },
            search: { highlightedItemId: matchingItem?.id },
          })
        } catch (error) {
          console.error('Failed to fetch warehouse bill:', error)
        }
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Stock</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory?.stock || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Reserved</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {inventory?.reserved_stock || 0}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {inventory?.available_stock || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Over Time Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Over Time</CardTitle>
            <CardDescription>Historical stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : stockChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart 
                  data={stockChartData}
                  onClick={(data: any) => {
                    // Handle clicks anywhere on the chart
                    if (data && data.activePayload && data.activePayload[0]) {
                      const chartData = data.activePayload[0].payload
                      if (chartData.movement && chartData.isClickable) {
                        handleMovementClick(chartData.movement)
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval="preserveStartEnd"
                  />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload[0]) {
                        const data = payload[0].payload
                        const movement = data.movement as InventoryMovement
                        const movementType = movement.movement_type.toLowerCase() as keyof typeof movementTypeConfig
                        const config = movementTypeConfig[movementType] || movementTypeConfig.adjustment
                        const Icon = config.icon
                        
                        return (
                          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 min-w-[250px]">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className={`flex items-center justify-center h-6 w-6 rounded-full ${config.color}`}>
                                  <Icon className="h-3 w-3" />
                                </div>
                                <span className="font-semibold text-sm">{config.label}</span>
                              </div>
                              <div className="text-xs space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Stock:</span>
                                  <span className="font-medium">{data.stock}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Quantity:</span>
                                  <span className={`font-medium ${data.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {data.quantity > 0 ? '+' : ''}{data.quantity}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Previous:</span>
                                  <span className="font-medium">{data.previousStock}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Date:</span>
                                  <span className="font-medium">
                                    {new Date(movement.created_at).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                    })}
                                  </span>
                                </div>
                                {data.referenceType && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-500">Reference:</span>
                                    <span className="font-medium">
                                      {data.referenceType.replace('_', ' ')}
                                      {data.referenceId && ` #${data.referenceId}`}
                                    </span>
                                  </div>
                                )}
                                {data.notes && (
                                  <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-500">Notes:</span>
                                    <p className="text-gray-700 dark:text-gray-300 mt-1">{data.notes}</p>
                                  </div>
                                )}
                                {data.isClickable && (
                                  <div className="pt-1 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-blue-600 dark:text-blue-400 text-xs font-medium cursor-pointer">
                                      Click to view details →
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return <g />
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="stock"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    dot={((props: any) => {
                      const { cx, cy, payload } = props
                      const isClickable = payload?.isClickable
                      if (!cx || !cy) return false
                      
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isClickable ? 8 : 4}
                          fill={isClickable ? 'var(--chart-1)' : 'var(--chart-1)'}
                          stroke={isClickable ? '#fff' : 'none'}
                          strokeWidth={isClickable ? 2 : 0}
                          opacity={isClickable ? 1 : 0.7}
                          style={{ 
                            cursor: isClickable ? 'pointer' : 'default',
                            pointerEvents: 'all'
                          }}
                          onClick={(e: React.MouseEvent<SVGCircleElement>) => {
                            e.stopPropagation()
                            e.preventDefault()
                            if (isClickable && payload?.movement) {
                              handleMovementClick(payload.movement)
                            }
                          }}
                          onMouseEnter={(e: React.MouseEvent<SVGCircleElement>) => {
                            if (isClickable) {
                              e.currentTarget.style.cursor = 'pointer'
                              e.currentTarget.setAttribute('r', '10')
                            }
                          }}
                          onMouseLeave={(e: React.MouseEvent<SVGCircleElement>) => {
                            if (isClickable) {
                              e.currentTarget.setAttribute('r', '8')
                            }
                          }}
                        />
                      )
                    }) as any}
                    activeDot={((props: any) => {
                      const { cx, cy, payload } = props
                      const isClickable = payload?.isClickable
                      if (!cx || !cy) return null
                      
                      return (
                        <g>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={10}
                            fill="var(--chart-1)"
                            stroke="#fff"
                            strokeWidth={2}
                            style={{ 
                              cursor: isClickable ? 'pointer' : 'default',
                              pointerEvents: 'all'
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              if (isClickable && payload?.movement) {
                                handleMovementClick(payload.movement)
                              }
                            }}
                            onMouseEnter={(e) => {
                              if (isClickable) {
                                e.currentTarget.style.cursor = 'pointer'
                                e.currentTarget.setAttribute('r', '12')
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isClickable) {
                                e.currentTarget.setAttribute('r', '10')
                              }
                            }}
                          />
                        </g>
                      )
                    }) as any}
                    name="Stock Level"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Movement Types Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Movement Types Distribution</CardTitle>
            <CardDescription>Count by movement type</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : movementTypeChartData.length === 0 ? (
              <div className="h-[300px] flex items-center justify-center text-gray-500">
                No data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={movementTypeChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="var(--chart-2)" name="Count" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters and Movements Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Movement History</CardTitle>
              <CardDescription>
                Complete history of inventory movements for {inventory?.variant_name || 'this variant'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex flex-col gap-1">
                <Label htmlFor="movement-type" className="text-xs">Movement Type</Label>
                <Select 
                  value={movementTypeFilter} 
                  onValueChange={(value) => {
                    setMovementTypeFilter(value)
                    handleFilterChange()
                  }}
                >
                  <SelectTrigger className="w-[180px]" id="movement-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.entries(movementTypeConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="date-mode" className="text-xs">Date Filter</Label>
                <Select 
                  value={dateFilterMode}
                  onValueChange={(value: 'none' | 'single' | 'range') => handleDateModeChange(value)}
                >
                  <SelectTrigger className="w-[180px]" id="date-mode">
                    <SelectValue placeholder="No date filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Date Filter</SelectItem>
                    <SelectItem value="single">Single Date</SelectItem>
                    <SelectItem value="range">Date Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {dateFilterMode === 'single' && (
                <div className="flex flex-col gap-1">
                  <Label htmlFor="single-date" className="text-xs">Date</Label>
                  <Input
                    id="single-date"
                    type="date"
                    value={singleDate}
                    onChange={(e) => {
                      setSingleDate(e.target.value)
                      handleFilterChange()
                    }}
                    className="w-[180px]"
                  />
                </div>
              )}
              
              {dateFilterMode === 'range' && (
                <>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="start-date" className="text-xs">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={startDate}
                      onChange={(e) => {
                        setStartDate(e.target.value)
                        handleFilterChange()
                      }}
                      className="w-[180px]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="end-date" className="text-xs">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={endDate}
                      onChange={(e) => {
                        setEndDate(e.target.value)
                        handleFilterChange()
                      }}
                      className="w-[180px]"
                      min={startDate || undefined}
                    />
                  </div>
                </>
              )}
              
              {(dateFilterMode !== 'none' || (movementTypeFilter && movementTypeFilter !== 'all')) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMovementTypeFilter('all')
                    handleDateModeChange('none')
                  }}
                  className="mt-6"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No movements found
            </div>
          ) : (
            <>
              <div className="rounded-md border max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Stock Change</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements.map((movement) => {
                      const movementType = movement.movement_type.toLowerCase() as keyof typeof movementTypeConfig
                      const config =
                        movementTypeConfig[movementType] || movementTypeConfig.adjustment
                      const Icon = config.icon
                      const clickable = isClickable(movement)

                      return (
                        <TableRow
                          key={movement.id}
                          onClick={() => handleMovementClick(movement)}
                          className={clickable ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
                        >
                          <TableCell>
                            <Badge variant="outline" className={config.color}>
                              <Icon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(movement.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="font-medium">
                              {movement.quantity > 0 ? '+' : ''}
                              {movement.quantity}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-500">
                              {movement.previous_stock} → {movement.new_stock}
                            </span>
                          </TableCell>
                          <TableCell>
                            {movement.reference_type ? (
                              <span className="text-sm">
                                {movement.reference_type.replace('_', ' ')}
                                {movement.reference_id && ` #${movement.reference_id}`}
                                {clickable && (
                                  <span className="ml-2 text-blue-600 dark:text-blue-400 text-xs">
                                    (Click to view)
                                  </span>
                                )}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {movement.notes ? (
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {movement.notes}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, totalMovements)} of{' '}
                    {totalMovements} movements
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Sale Details Dialog */}
      {selectedSaleId && inventory?.company_id && (
        <SaleDetailsDialog
          companyId={inventory.company_id}
          saleId={selectedSaleId}
          open={saleDetailsDialogOpen}
          onOpenChange={setSaleDetailsDialogOpen}
        />
      )}

    </div>
  )
}

