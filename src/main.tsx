import { ThemeProvider } from '@/components/theme/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

// Route imports
import { AcceptInvitationRoute } from './routes/auth.accept-invitation'
import { ChangePasswordOTPRoute } from './routes/auth.change-password-otp'
import { CompanySetupRoute } from './routes/auth.company-setup'
import { LoginRoute } from './routes/auth.login'
import { RegisterRoute } from './routes/auth.register'
import { SetupAccountRoute } from './routes/auth.setup-account'
import { VerificationSuccessRoute } from './routes/auth.verification-success'
import { VerifyEmailRoute } from './routes/auth.verify-email'
import { CompanyDetailsRoute } from './routes/companies.$companyId'
import { EditCompanyRoute } from './routes/companies.$companyId.edit'
import { CompanyFranchiseRoute } from './routes/companies.$companyId.franchises.$franchiseId'
import { EditCompanyFranchiseRoute } from './routes/companies.$companyId.franchises.$franchiseId.edit'
import { FranchiseInventoryHistoryRoute } from './routes/companies.$companyId.franchises.$franchiseId.inventory.$inventoryId.history'
import { CompanyFranchiseWarehouseBillsEntryNewRoute } from './routes/companies.$companyId.franchises.$franchiseId.warehouse-bills.entry.new'
import { CreateFranchiseRoute } from './routes/companies.$companyId.franchises.create'
import { CompanyFranchisesRoute } from './routes/companies.$companyId.franchises.index'
import { CompanyInventoryHistoryRoute } from './routes/companies.$companyId.inventory.$inventoryId.history'
import { CompanyInventoryRoute } from './routes/companies.$companyId.inventory.index'
import { CompanyOrderRoute } from './routes/companies.$companyId.orders.$orderId'
import { CompanyOrdersRoute } from './routes/companies.$companyId.orders.index'
import { CreateOrderRoute } from './routes/companies.$companyId.orders.new'
import { CashDrawerRoute } from './routes/companies.$companyId.pos.cash-drawer.index'
import { POSCustomersRoute } from './routes/companies.$companyId.pos.customers.index'
import { POSIndexRoute } from './routes/companies.$companyId.pos.index'
import { SalesHistoryRoute } from './routes/companies.$companyId.pos.sales.index'
import { NewSaleRoute } from './routes/companies.$companyId.pos.sales.new'
import { ProductDetailsRoute } from './routes/companies.$companyId.products.$productId'
import { EditProductRoute } from './routes/companies.$companyId.products.$productId.edit'
import { BulkCreateVariantsRoute } from './routes/companies.$companyId.products.$productId.variants.bulk'
import { BulkImportProductsRoute } from './routes/companies.$companyId.products.bulk-import'
import { BulkImportPreviewRoute } from './routes/companies.$companyId.products.bulk-import.preview'
import { CreateProductRoute } from './routes/companies.$companyId.products.create'
import { CompanyProductsRoute } from './routes/companies.$companyId.products.index'
import { SupplierDetailRoute } from './routes/companies.$companyId.suppliers.$supplierId'
import { SupplierBillDetailRoute } from './routes/companies.$companyId.suppliers.$supplierId.bills.$billId'
import { EditSupplierBillRoute } from './routes/companies.$companyId.suppliers.$supplierId.bills.$billId.edit'
import { SupplierBillsIndexRoute } from './routes/companies.$companyId.suppliers.$supplierId.bills.index'
import { NewSupplierBillRoute } from './routes/companies.$companyId.suppliers.$supplierId.bills.new'
import { EditSupplierRoute } from './routes/companies.$companyId.suppliers.$supplierId.edit'
import { CreateSupplierRoute } from './routes/companies.$companyId.suppliers.create'
import { CompanySuppliersIndexRoute } from './routes/companies.$companyId.suppliers.index'
import { CompanyWarehouseBillDetailRoute } from './routes/companies.$companyId.warehouse-bills.$billId'
import { CompanyWarehouseBillsIndexRoute } from './routes/companies.$companyId.warehouse-bills.index'
import { CompanyWarehouseBillsNewRoute } from './routes/companies.$companyId.warehouse-bills.new'
import { CreateCompanyRoute } from './routes/companies.create'
import { CompaniesRoute } from './routes/companies.index'
import { DashboardRoute } from './routes/dashboard.index'
import { FranchiseInventoryRoute } from './routes/franchises.$franchiseId.inventory.index'
import { FranchiseCashDrawerRoute } from './routes/franchises.$franchiseId.pos.cash-drawer.index'
import { FranchisePOSRoute } from './routes/franchises.$franchiseId.pos.index'
import { FranchiseSalesHistoryRoute } from './routes/franchises.$franchiseId.pos.sales.index'
import { FranchiseNewSaleRoute } from './routes/franchises.$franchiseId.pos.sales.new'
import { FranchiseProductDetailsRoute } from './routes/franchises.$franchiseId.products.$productId'
import { FranchiseProductsRoute } from './routes/franchises.$franchiseId.products.index'
import { FranchiseWarehouseBillDetailRoute } from './routes/franchises.$franchiseId.warehouse-bills.$billId'
import { FranchiseWarehouseBillsIndexRoute } from './routes/franchises.$franchiseId.warehouse-bills.index'
import { FranchiseWarehouseBillsNewRoute } from './routes/franchises.$franchiseId.warehouse-bills.new'
import { HomeRoute } from './routes/home.index'
import { ProfileRoute } from './routes/profile.index'
import { SettingsRoute } from './routes/settings.index'

import reportWebVitals from './reportWebVitals.ts'
import './styles.css'

import { NotFound } from '@/components/ui/not-found'

export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools />
    </>
  ),
  notFoundComponent: () => <NotFound />,
})

const routeTree = rootRoute.addChildren([
  HomeRoute,
  LoginRoute,
  RegisterRoute,
  VerifyEmailRoute,
  VerificationSuccessRoute,
  CompanySetupRoute,
  AcceptInvitationRoute,
  SetupAccountRoute,
  ChangePasswordOTPRoute,
  DashboardRoute,
  ProfileRoute,
  SettingsRoute,
  CompaniesRoute,
  CreateCompanyRoute,
  CompanyDetailsRoute,
  EditCompanyRoute,
  CompanyFranchisesRoute,
  CreateFranchiseRoute,
  CompanyFranchiseRoute,
  EditCompanyFranchiseRoute,
  FranchiseInventoryRoute,
  FranchiseInventoryHistoryRoute,
  CompanyInventoryRoute,
  CompanyInventoryHistoryRoute,
  CompanyProductsRoute,
  CreateProductRoute,
  BulkImportProductsRoute,
  BulkImportPreviewRoute,
  ProductDetailsRoute,
  EditProductRoute,
  BulkCreateVariantsRoute,
  CompanyOrdersRoute,
  CompanyOrderRoute,
  CreateOrderRoute,
  CompanySuppliersIndexRoute,
  CreateSupplierRoute,
  SupplierDetailRoute,
  EditSupplierRoute,
  SupplierBillsIndexRoute,
  NewSupplierBillRoute,
  SupplierBillDetailRoute,
  EditSupplierBillRoute,
  POSIndexRoute,
  POSCustomersRoute,
  NewSaleRoute,
  SalesHistoryRoute,
  CashDrawerRoute,
  FranchisePOSRoute,
  FranchiseNewSaleRoute,
  FranchiseSalesHistoryRoute,
  FranchiseCashDrawerRoute,
  FranchiseProductsRoute,
  FranchiseProductDetailsRoute,
  CompanyWarehouseBillsIndexRoute,
  CompanyWarehouseBillsNewRoute,
  CompanyWarehouseBillDetailRoute,
  CompanyFranchiseWarehouseBillsEntryNewRoute,
  FranchiseWarehouseBillsIndexRoute,
  FranchiseWarehouseBillsNewRoute,
  FranchiseWarehouseBillDetailRoute,
])

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Listen for unauthorized events and navigate to login
window.addEventListener('auth:unauthorized', () => {
  // Use router to navigate instead of hard redirect
  router.navigate({ to: '/login' })
})

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
          <RouterProvider router={router} />
        </TanStackQueryProvider.Provider>
      </ThemeProvider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
