# Darween ERP Frontend - Implementation Guide

## Overview

This is a professional ERP frontend built with React, TanStack Router, TanStack Query, and Shadcn UI. It provides complete authentication and CRUD operations for Companies and Products modules.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Router** - File-based routing
- **TanStack Query** - Server state management
- **TanStack Form** - Form handling with validation
- **TanStack Store** - Client state management
- **Shadcn UI** - Component library
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Zod** - Schema validation
- **Sonner** - Toast notifications

## Features Implemented

### ✅ Authentication Module
- User registration with validation
- User login with JWT tokens
- Token persistence in localStorage
- Automatic token refresh and logout on 401
- Protected routes with auth guards
- User profile display in header

### ✅ Dashboard Layout
- Professional sidebar navigation
- User dropdown menu with logout
- Responsive layout design
- Protected route wrapper

### ✅ Companies Module
- **List Companies** - View all companies with cards
- **Create Company** - Form with validation (name, code, description)
- **View Company Details** - Full company information with team members
- **Edit Company** - Update company information
- **Empty States** - Helpful UI when no companies exist

### ✅ Products Module
- **List Products** - Paginated table view with status badges
- **Create Product** - Form with SKU, price, and description
- **View Product Details** - Full product info with variants
- **Edit Product** - Update product information
- **Delete Product** - Soft delete with confirmation
- **Product Variants**:
  - Create variants with custom attributes
  - Stock level tracking
  - Stock adjustment with positive/negative amounts
  - Variant pricing (can override base price)
  - Delete variants
- **Empty States** - Helpful UI when no products exist

## Architecture

### File Structure

```
app/src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx      # Route guard component
│   ├── companies/
│   │   ├── CompanyCard.tsx         # Company display card
│   │   └── CompanyForm.tsx         # Company create/edit form
│   ├── layouts/
│   │   ├── DashboardLayout.tsx     # Main app layout
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   └── UserMenu.tsx            # User dropdown menu
│   ├── products/
│   │   ├── ProductForm.tsx         # Product create/edit form
│   │   ├── ProductsTable.tsx       # Products list table
│   │   ├── ProductVariantsTable.tsx # Variants table
│   │   ├── VariantForm.tsx         # Variant create/edit form
│   │   └── StockAdjustmentDialog.tsx # Stock management dialog
│   └── ui/                         # Shadcn UI components
├── hooks/
│   ├── queries/
│   │   ├── use-companies.ts        # Company React Query hooks
│   │   └── use-products.ts         # Product React Query hooks
│   └── use-auth.ts                 # Auth hook
├── lib/
│   ├── api-client.ts               # Centralized API client
│   ├── auth.ts                     # Auth utilities
│   └── utils.ts                    # Helper functions
├── routes/
│   ├── auth.login.tsx              # Login page
│   ├── auth.register.tsx           # Register page
│   ├── dashboard.index.tsx         # Dashboard home
│   ├── companies.index.tsx         # Companies list
│   ├── companies.create.tsx        # Create company
│   ├── companies.$companyId.tsx    # Company details
│   ├── companies.$companyId.edit.tsx # Edit company
│   ├── companies.$companyId.products.index.tsx # Products list
│   ├── companies.$companyId.products.create.tsx # Create product
│   ├── companies.$companyId.products.$productId.tsx # Product details
│   └── companies.$companyId.products.$productId.edit.tsx # Edit product
├── stores/
│   └── auth-store.ts               # Auth state store
├── types/
│   └── api.ts                      # TypeScript API types
├── env.ts                          # Environment config
└── main.tsx                        # App entry point
```

### API Integration

The app uses a centralized API client (`lib/api-client.ts`) that:
- Handles authentication headers automatically
- Intercepts 401 errors for auto-logout
- Provides type-safe methods for all endpoints
- Integrates with TanStack Query for caching

### State Management

**Server State (TanStack Query):**
- Companies data
- Products data
- User profile data
- Automatic caching and invalidation

**Client State (TanStack Store):**
- Auth state (user, token, isAuthenticated)
- Persisted to localStorage

### Form Handling

All forms use TanStack Form with:
- Zod schema validation
- Real-time validation feedback
- Type-safe form values
- Loading states during submission

## Setup Instructions

### 1. Install Dependencies

```bash
cd app
npm install
```

### 2. Configure Environment

Create a `.env.local` file in the `app` directory:

```env
VITE_API_URL=http://localhost:8080/api/v1
VITE_APP_TITLE=Darween ERP
```

### 3. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
```

## Usage Guide

### First Time Setup

1. **Register an Account**
   - Navigate to `/register`
   - Fill in your details
   - You'll be automatically logged in

2. **Create Your First Company**
   - Click "Companies" in the sidebar
   - Click "New Company" button
   - Fill in company name, code, and description
   - Submit the form

3. **Add Products**
   - Open your company details
   - Click "Manage Products"
   - Create a new product with SKU and base price
   - Add variants with different attributes (size, color, etc.)

4. **Manage Inventory**
   - View product variants
   - Use "Adjust Stock" to add or remove inventory
   - Track stock levels in real-time

### Navigation Flow

```
Login/Register
  ↓
Dashboard (Home)
  ↓
Companies List
  ↓
Company Details
  ↓
Products List
  ↓
Product Details (with Variants)
```

## API Endpoints Used

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user

### Users
- `GET /api/v1/users/me` - Get current user
- `GET /api/v1/users?company_id={id}` - List company users

### Companies
- `GET /api/v1/companies` - List user's companies
- `POST /api/v1/companies` - Create company
- `GET /api/v1/companies/{id}` - Get company details
- `PUT /api/v1/companies/{id}` - Update company

### Products
- `GET /api/v1/companies/{id}/products` - List products (paginated)
- `POST /api/v1/companies/{id}/products` - Create product
- `GET /api/v1/companies/{id}/products/{id}` - Get product details
- `PUT /api/v1/companies/{id}/products/{id}` - Update product
- `DELETE /api/v1/companies/{id}/products/{id}` - Delete product

### Product Variants
- `POST /api/v1/companies/{id}/products/{id}/variants` - Create variant
- `GET /api/v1/companies/{id}/products/{id}/variants` - List variants
- `PUT /api/v1/companies/{id}/products/{id}/variants/{id}` - Update variant
- `DELETE /api/v1/companies/{id}/products/{id}/variants/{id}` - Delete variant
- `POST /api/v1/companies/{id}/products/{id}/variants/{id}/stock/adjust` - Adjust stock

## Key Features & UX Enhancements

### Loading States
- Skeleton loaders on all data-fetching pages
- Button loading states during submissions
- Disabled inputs during operations

### Error Handling
- Toast notifications for all errors
- Form validation with inline error messages
- 401 auto-logout and redirect to login
- User-friendly error messages

### Empty States
- Helpful messages when no data exists
- Clear CTAs to guide users to next steps
- Onboarding-style guidance on dashboard

### Form Validation
- Real-time validation with Zod schemas
- Type-safe form values
- Clear error messages
- Required field indicators

### Responsive Design
- Mobile-friendly layouts
- Responsive grid systems
- Collapsible sidebar (future enhancement)

## Future Enhancements

### Planned Features
- [ ] Franchises module
- [ ] Inventory module with movements tracking
- [ ] Team member management per company
- [ ] Bulk operations for products
- [ ] Advanced filtering and search
- [ ] Data export functionality
- [ ] Role-based permissions UI
- [ ] Company subscription management
- [ ] Dark mode toggle
- [ ] Multi-language support

### Technical Improvements
- [ ] File-based routing migration
- [ ] Optimistic updates for better UX
- [ ] Infinite scroll for long lists
- [ ] Advanced caching strategies
- [ ] PWA support
- [ ] Unit and integration tests
- [ ] E2E tests with Playwright
- [ ] Performance monitoring

## Troubleshooting

### Common Issues

**Issue: Routes not working**
- Ensure the backend API is running on `http://localhost:8080`
- Check `.env.local` has correct `VITE_API_URL`

**Issue: Authentication not persisting**
- Check browser localStorage for `auth_token`
- Clear localStorage and re-login
- Ensure cookies are enabled

**Issue: CORS errors**
- Verify backend CORS settings allow `http://localhost:3000`
- Check API URL is correct in `.env.local`

**Issue: Components not rendering**
- Check browser console for errors
- Ensure all dependencies are installed: `npm install`
- Try clearing node_modules and reinstalling

## Development Tips

### Adding a New Route
1. Create route file in `src/routes/`
2. Export route using `createRoute`
3. Import and add to `routeTree` in `main.tsx`

### Adding a New API Endpoint
1. Add types to `src/types/api.ts`
2. Add method to `apiClient` in `src/lib/api-client.ts`
3. Create React Query hook in appropriate `src/hooks/queries/` file

### Adding a New Component
1. Create component in appropriate `src/components/` subdirectory
2. Use existing UI components from `src/components/ui/`
3. Follow naming conventions (PascalCase for components)

## Performance Notes

- TanStack Query provides automatic caching
- Routes are code-split by default with Vite
- Images and assets are optimized by Vite
- Lazy loading can be added for heavy components

## Contributing

When adding new features:
1. Follow existing code structure
2. Use TypeScript for type safety
3. Add proper error handling
4. Include loading states
5. Add toast notifications for user feedback
6. Test on multiple screen sizes

## License

[Your License Here]



