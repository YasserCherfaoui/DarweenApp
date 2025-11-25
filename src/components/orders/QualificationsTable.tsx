import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Trash } from 'lucide-react'
import type { Qualification } from '@/types/api'

interface QualificationsTableProps {
  qualifications: Qualification[]
  onEdit?: (qualification: Qualification) => void
  onDelete?: (qualificationId: number) => void
}

export function QualificationsTable({
  qualifications,
  onEdit,
  onDelete,
}: QualificationsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Parent</TableHead>
            <TableHead>Color</TableHead>
            <TableHead>Order History</TableHead>
            <TableHead>Sub-qualifications</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {qualifications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                No qualifications found
              </TableCell>
            </TableRow>
          ) : (
            qualifications.map((qualification) => (
              <TableRow key={qualification.id}>
                <TableCell className="font-medium">{qualification.name}</TableCell>
                <TableCell>
                  {qualification.parent_name ? (
                    <span className="text-gray-500">{qualification.parent_name}</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: qualification.color }}
                    />
                    <span className="text-sm">{qualification.color}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={qualification.is_order_history ? 'default' : 'secondary'}>
                    {qualification.is_order_history ? 'Yes' : 'No'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {qualification.sub_qualifications?.length || 0}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {onEdit && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onEdit(qualification)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => onDelete(qualification.id)}
                      >
                        <Trash className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}



