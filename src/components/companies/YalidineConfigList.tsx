import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Edit, Star, StarOff } from 'lucide-react'
import type { YalidineConfigResponse } from '@/types/api'
import { useYalidineWilayas } from '@/hooks/queries/use-yalidine-api'
import { useSelectedCompany } from '@/hooks/use-selected-company'

interface YalidineConfigListProps {
  configs: YalidineConfigResponse[]
  onEdit: (config: YalidineConfigResponse) => void
  onDelete: (config: YalidineConfigResponse) => void
  onSetDefault: (config: YalidineConfigResponse) => void
}

export function YalidineConfigList({
  configs,
  onEdit,
  onDelete,
  onSetDefault,
}: YalidineConfigListProps) {
  const { selectedCompany } = useSelectedCompany()
  const companyId = selectedCompany?.id || 0
  const { data: wilayasData } = useYalidineWilayas(companyId)
  const wilayas = wilayasData?.data || []

  if (configs.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No Yalidine configurations found. Create one to get started.</p>
      </div>
    )
  }

  // Helper function to mask API ID for security (show first 4 and last 4 characters)
  const maskApiId = (apiId: string) => {
    if (apiId.length <= 8) {
      return '••••••••'
    }
    return `${apiId.substring(0, 4)}${'•'.repeat(Math.max(0, apiId.length - 8))}${apiId.substring(apiId.length - 4)}`
  }

  // Helper function to get wilaya name by ID
  const getWilayaName = (wilayaId?: number | null) => {
    if (!wilayaId) return 'Not set'
    const wilaya = wilayas.find((w) => w.id === wilayaId)
    return wilaya?.name || `Wilaya #${wilayaId}`
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>API ID</TableHead>
            <TableHead>Origin Wilaya</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Default</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {configs.map((config) => (
            <TableRow key={config.id}>
              <TableCell className="font-medium font-mono text-sm">
                {maskApiId(config.api_id)}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {getWilayaName(config.from_wilaya_id)}
                </span>
              </TableCell>
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

