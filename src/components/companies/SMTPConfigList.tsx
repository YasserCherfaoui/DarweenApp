import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Star, StarOff } from 'lucide-react'
import type { SMTPConfigResponse } from '@/types/api'

interface SMTPConfigListProps {
  configs: SMTPConfigResponse[]
  onEdit: (config: SMTPConfigResponse) => void
  onDelete: (config: SMTPConfigResponse) => void
  onSetDefault: (config: SMTPConfigResponse) => void
}

export function SMTPConfigList({
  configs,
  onEdit,
  onDelete,
  onSetDefault,
}: SMTPConfigListProps) {
  if (configs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No SMTP configurations found. Create one to get started.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Host</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Port</TableHead>
            <TableHead>Security</TableHead>
            <TableHead>From Name</TableHead>
            <TableHead>Rate Limit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {configs.map((config) => (
            <TableRow key={config.id}>
              <TableCell className="font-medium">{config.host}</TableCell>
              <TableCell>{config.user}</TableCell>
              <TableCell>{config.port}</TableCell>
              <TableCell>
                <Badge variant="outline">
                  {config.security.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{config.from_name || '-'}</TableCell>
              <TableCell>{config.rate_limit}/hour</TableCell>
              <TableCell>
                <Badge variant={config.is_active ? 'default' : 'secondary'}>
                  {config.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                {config.is_default ? (
                  <Badge variant="default">
                    <Star className="h-3 w-3 mr-1" />
                    Default
                  </Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onSetDefault(config)}
                    className="h-6"
                  >
                    <StarOff className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(config)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(config)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

