import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Mail, Edit } from 'lucide-react'
import type { UserWithRole } from '@/types/api'

interface FranchiseUsersTableProps {
  users: UserWithRole[]
  onRemoveUser: (user: UserWithRole) => void
  onUpdateRole?: (user: UserWithRole) => void
  currentUserId?: number
}

export function FranchiseUsersTable({ users, onRemoveUser, onUpdateRole, currentUserId }: FranchiseUsersTableProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'
      case 'admin':
        return 'secondary'
      case 'manager':
        return 'outline'
      default:
        return 'outline'
    }
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No users assigned to this franchise yet.</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                {user.first_name} {user.last_name}
                {user.id === currentUserId && (
                  <span className="ml-2 text-xs text-gray-500">(You)</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  {user.email}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={getRoleBadgeVariant(user.role)}>
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? 'default' : 'secondary'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {onUpdateRole && user.role !== 'owner' && user.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onUpdateRole(user)}
                    >
                      <Edit className="h-4 w-4 text-blue-500" />
                    </Button>
                  )}
                  {user.role !== 'owner' && user.id !== currentUserId && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveUser(user)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}



