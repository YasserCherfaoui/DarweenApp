# Role-Based UI Implementation

## Overview

The application now has two distinct user interfaces based on user roles:

1. **POS UI (Employee Role)**: Simplified, sales-focused interface for cashiers
2. **Admin UI (Owner/Admin/Manager Roles)**: Full dashboard with all ERP features

## Implementation Summary

### New Files Created

1. **`src/hooks/use-user-role.ts`** - Hook for role detection and permissions
2. **`src/components/layouts/POSSidebar.tsx`** - POS-focused sidebar
3. **`src/components/layouts/POSLayout.tsx`** - Layout for POS users
4. **`src/components/layouts/RoleBasedLayout.tsx`** - Smart layout selector

### Modified Files

1. **`src/types/api.ts`** - Added UserRole type and role fields
2. **`src/stores/company-store.ts`** - Added role storage
3. **`src/components/layouts/Sidebar.tsx`** - Enhanced admin sidebar
4. **`src/components/auth/ProtectedRoute.tsx`** - Added role-based guards
5. **`src/components/layouts/CompanySelector.tsx`** - Added role handling
6. **All route files (26 files)** - Updated to use RoleBasedLayout including all POS routes

## How It Works

### Role Detection

The system determines the user's role from the selected company's `user_role` field:

```typescript
// In company-store.ts
export interface CompanyState {
  selectedCompany: Company | null
  selectedCompanyId: number | null
  userRole: UserRole | null  // 'owner' | 'admin' | 'manager' | 'employee'
}
```

### Layout Selection

The `RoleBasedLayout` component automatically selects the appropriate layout:

- **Employees** → POSLayout (simplified POS interface with only POS navigation)
- **Owners/Admins/Managers** → DashboardLayout (full admin interface with all features)

**Important:** ALL routes now use `RoleBasedLayout`, including POS routes. This means:
- Admin users accessing POS features will see the full admin sidebar and header
- Employee users accessing POS features will see the simplified POS sidebar
- The content remains the same, only the surrounding layout changes based on role

### Route Protection

The enhanced `ProtectedRoute` component:

- Redirects employees trying to access admin routes to POS dashboard
- Shows "Access Denied" for unauthorized access attempts
- Allows all roles to access POS features

### Admin-Only Routes

The following routes are restricted to admin users (Owner/Admin/Manager):

- `/companies/*` (except `/companies/:id/pos`)
- `/products`
- `/suppliers`
- `/franchises`
- `/inventory`

Employees can only access:
- `/companies/:id/pos`
- `/companies/:id/pos/sales`
- `/companies/:id/pos/customers`
- `/companies/:id/pos/cash-drawer`

## Testing

### Testing as Admin User

By default, the system assigns 'admin' role for testing. To test:

1. Log in to the application
2. Select a company
3. You should see the full admin dashboard with:
   - Dashboard
   - Companies
   - Products
   - Suppliers
   - Franchises
   - Inventory
   - POS

### Testing as Employee (POS User)

To test the employee experience, you need to manually set the role:

**Option 1: Using Browser DevTools**

```javascript
// In browser console
localStorage.setItem('user_role', 'employee')
// Reload the page
```

**Option 2: Modify CompanySelector.tsx temporarily**

Change line 26 from:
```typescript
user_role: company.user_role || ('admin' as const)
```

to:
```typescript
user_role: company.user_role || ('employee' as const)
```

After changing to employee role, you should see:
- Simplified POS-focused sidebar
- Only POS-related navigation items
- Redirected to POS dashboard when trying to access admin routes
- "Access Denied" message for admin-only features

## Backend Requirements

### API Changes Needed

The backend needs to include the user's role in company responses. The Go backend already has the `UserCompanyRole` entity, so update the company list endpoint:

**Current Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Company",
      "code": "MYCO",
      "is_active": true
    }
  ]
}
```

**Required Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "My Company",
      "code": "MYCO",
      "is_active": true,
      "user_role": "admin"  // ← Add this field
    }
  ]
}
```

### Backend Implementation

Update the companies list endpoint (`GET /api/v1/companies`) to include the current user's role:

```go
// In internal/presentation/http/handler/company_handler.go
func (h *CompanyHandler) GetUserCompanies(c *gin.Context) {
    // ... existing code ...
    
    // For each company, fetch the user's role
    for i := range companies {
        userRole, err := h.companyService.GetUserRoleInCompany(userID, companies[i].ID)
        if err == nil {
            companies[i].UserRole = string(userRole) // Add UserRole field to response DTO
        }
    }
    
    // ... rest of response ...
}
```

## UI Features

### POS Interface (Employees)

**Sidebar:**
- POS Dashboard
- New Sale
- Sales History
- Customers
- Cash Drawer

**Header:**
- Simplified "Point of Sale" branding
- Company name display
- User menu (logout, profile)
- No company selector (employees work in one company context)

**Quick Tips:**
- F2 for new sale
- F3 for customer search

### Admin Interface (Owner/Admin/Manager)

**Sidebar:**
- Main section: Dashboard, Companies
- Inventory Management: Products, Suppliers, Inventory
- Operations: Franchises, POS

**Header:**
- "Darween ERP - Admin Dashboard" branding
- Company selector
- User menu

**Enhanced Navigation:**
- Organized into logical sections
- Better visual hierarchy
- Professional admin look

## Keyboard Shortcuts (Future Enhancement)

POS users should be able to use:
- **F2**: New Sale
- **F3**: Customer Search
- **F4**: Cash Drawer
- **ESC**: Cancel/Back

## Security Notes

1. **Frontend validation is not security** - The backend must enforce all permissions
2. **Role-based routing** - Prevents employees from accessing admin pages
3. **API-level security** - Backend should verify user role on every request
4. **Token-based auth** - JWT tokens should include role information

## Troubleshooting

### I see the admin UI but I should see POS UI

Check the stored role:
```javascript
// In browser console
localStorage.getItem('user_role')
```

If it's not 'employee', set it:
```javascript
localStorage.setItem('user_role', 'employee')
location.reload()
```

### Role not persisting after company selection

The backend might not be including `user_role` in the company response. Check the network tab to see the API response.

### Access Denied even though I have the right role

Clear localStorage and log in again:
```javascript
localStorage.clear()
location.reload()
```

## Future Enhancements

1. **Role switching**: Allow users with multiple roles to switch contexts
2. **Franchise-specific roles**: Different roles per franchise
3. **Permission granularity**: More fine-grained permissions beyond role
4. **Activity logging**: Track role-based actions for audit
5. **Offline mode**: POS should work offline with sync
6. **Receipt printer integration**: Direct printing for POS users
7. **Keyboard navigation**: Full keyboard support for POS

## POS Routes Update

All POS routes now properly use `RoleBasedLayout`:

1. `/companies/:id/pos` - POS Dashboard
2. `/companies/:id/pos/sales/new` - New Sale
3. `/companies/:id/pos/sales` - Sales History
4. `/companies/:id/pos/customers` - Customer Management
5. `/companies/:id/pos/cash-drawer` - Cash Drawer Management

This ensures that:
- **Admin users** see the full admin sidebar when accessing POS features
- **Employee users** see only the POS sidebar
- The page content remains identical for both roles
- Navigation context is preserved based on user permissions

## Conclusion

The role-based UI successfully separates the POS experience from the admin dashboard, providing:
- **Better UX** for cashiers with a focused, distraction-free interface
- **Professional admin tools** for managers with full ERP features
- **Secure access control** preventing unauthorized access
- **Scalable architecture** allowing easy addition of new roles
- **Consistent layout behavior** across all routes including POS

The implementation is complete and ready for testing once the backend includes role information in company responses.

