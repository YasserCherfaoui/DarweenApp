import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { X } from 'lucide-react'
import { useCompanyFranchises } from '@/hooks/queries/use-franchises'
import type { WarehouseBillStatus, WarehouseBillType } from '@/types/api'

interface WarehouseBillFiltersProps {
  companyId: number
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  onClear: () => void
}

export interface FilterState {
  franchise_id?: number
  status?: WarehouseBillStatus
  bill_type?: WarehouseBillType
  date_from?: string
  date_to?: string
}

export function WarehouseBillFilters({
  companyId,
  filters,
  onFiltersChange,
  onClear,
}: WarehouseBillFiltersProps) {
  const { data: franchises } = useCompanyFranchises(companyId)

  const hasActiveFilters =
    filters.franchise_id !== undefined ||
    filters.status !== undefined ||
    filters.bill_type !== undefined ||
    filters.date_from !== undefined ||
    filters.date_to !== undefined

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === '' || value === 'all' ? undefined : value,
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Filters</CardTitle>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={onClear}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Franchise Filter */}
          <div>
            <Label htmlFor="franchise">Franchise</Label>
            <Select
              value={filters.franchise_id?.toString() || 'all'}
              onValueChange={(value) =>
                updateFilter('franchise_id', value === 'all' ? undefined : parseInt(value))
              }
            >
              <SelectTrigger id="franchise">
                <SelectValue placeholder="All Franchises" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Franchises</SelectItem>
                {franchises?.map((franchise) => (
                  <SelectItem key={franchise.id} value={franchise.id.toString()}>
                    {franchise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => updateFilter('status', value)}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bill Type Filter */}
          <div>
            <Label htmlFor="bill_type">Bill Type</Label>
            <Select
              value={filters.bill_type || 'all'}
              onValueChange={(value) => updateFilter('bill_type', value)}
            >
              <SelectTrigger id="bill_type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="exit">Exit</SelectItem>
                <SelectItem value="entry">Entry</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From Filter */}
          <div>
            <Label htmlFor="date_from">Date From</Label>
            <Input
              id="date_from"
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => updateFilter('date_from', e.target.value)}
            />
          </div>

          {/* Date To Filter */}
          <div>
            <Label htmlFor="date_to">Date To</Label>
            <Input
              id="date_to"
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => updateFilter('date_to', e.target.value)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


