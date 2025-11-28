// API Response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
  }
}

// Pagination types
export interface PaginationParams {
  page?: number
  limit?: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// User types
export type UserRole = 'owner' | 'admin' | 'manager' | 'employee'

// Permission types
export type Permission =
  // Company Management
  | 'companies.create'
  | 'companies.update'
  | 'companies.delete'
  | 'companies.view'
  | 'companies.manage_users'
  // Product Management
  | 'products.create'
  | 'products.update'
  | 'products.delete'
  | 'products.view'
  // Inventory
  | 'inventory.read'
  | 'inventory.write'
  | 'inventory.adjust'
  // POS
  | 'pos.sales.create'
  | 'pos.sales.view'
  | 'pos.refund'
  | 'pos.cash_drawer'
  | 'pos.customers'
  | 'pos.reports'
  // Suppliers
  | 'suppliers.create'
  | 'suppliers.update'
  | 'suppliers.delete'
  | 'suppliers.view'
  // Franchises
  | 'franchises.create'
  | 'franchises.update'
  | 'franchises.delete'
  | 'franchises.view'
  | 'franchises.manage_users'
  // Warehouse Bills
  | 'warehouse_bills.create'
  | 'warehouse_bills.update'
  | 'warehouse_bills.delete'
  | 'warehouse_bills.view'
  | 'warehouse_bills.complete'
  // Settings
  | 'settings.view'
  | 'settings.update'
  | 'settings.subscription'
  | 'settings.smtp'
  // Email
  | 'emails.send'
  // Subscription
  | 'subscription.view'
  | 'subscription.update'
  // Users
  | 'users.view'
  | 'users.update'

// Permission constants
export const PERMISSIONS = {
  // Company Management
  COMPANY_CREATE: 'companies.create' as Permission,
  COMPANY_UPDATE: 'companies.update' as Permission,
  COMPANY_DELETE: 'companies.delete' as Permission,
  COMPANY_VIEW: 'companies.view' as Permission,
  COMPANY_MANAGE_USERS: 'companies.manage_users' as Permission,
  // Product Management
  PRODUCT_CREATE: 'products.create' as Permission,
  PRODUCT_UPDATE: 'products.update' as Permission,
  PRODUCT_DELETE: 'products.delete' as Permission,
  PRODUCT_VIEW: 'products.view' as Permission,
  // Inventory
  INVENTORY_READ: 'inventory.read' as Permission,
  INVENTORY_WRITE: 'inventory.write' as Permission,
  INVENTORY_ADJUST: 'inventory.adjust' as Permission,
  // POS
  POS_SALES_CREATE: 'pos.sales.create' as Permission,
  POS_SALES_VIEW: 'pos.sales.view' as Permission,
  POS_REFUND: 'pos.refund' as Permission,
  POS_CASH_DRAWER: 'pos.cash_drawer' as Permission,
  POS_CUSTOMERS: 'pos.customers' as Permission,
  POS_REPORTS: 'pos.reports' as Permission,
  // Suppliers
  SUPPLIER_CREATE: 'suppliers.create' as Permission,
  SUPPLIER_UPDATE: 'suppliers.update' as Permission,
  SUPPLIER_DELETE: 'suppliers.delete' as Permission,
  SUPPLIER_VIEW: 'suppliers.view' as Permission,
  // Franchises
  FRANCHISE_CREATE: 'franchises.create' as Permission,
  FRANCHISE_UPDATE: 'franchises.update' as Permission,
  FRANCHISE_DELETE: 'franchises.delete' as Permission,
  FRANCHISE_VIEW: 'franchises.view' as Permission,
  FRANCHISE_MANAGE_USERS: 'franchises.manage_users' as Permission,
  // Warehouse Bills
  WAREHOUSE_BILL_CREATE: 'warehouse_bills.create' as Permission,
  WAREHOUSE_BILL_UPDATE: 'warehouse_bills.update' as Permission,
  WAREHOUSE_BILL_DELETE: 'warehouse_bills.delete' as Permission,
  WAREHOUSE_BILL_VIEW: 'warehouse_bills.view' as Permission,
  WAREHOUSE_BILL_COMPLETE: 'warehouse_bills.complete' as Permission,
  // Settings
  SETTINGS_VIEW: 'settings.view' as Permission,
  SETTINGS_UPDATE: 'settings.update' as Permission,
  SETTINGS_SUBSCRIPTION: 'settings.subscription' as Permission,
  SETTINGS_SMTP: 'settings.smtp' as Permission,
  // Email
  EMAIL_SEND: 'emails.send' as Permission,
  // Subscription
  SUBSCRIPTION_VIEW: 'subscription.view' as Permission,
  SUBSCRIPTION_UPDATE: 'subscription.update' as Permission,
  // Users
  USERS_VIEW: 'users.view' as Permission,
  USERS_UPDATE: 'users.update' as Permission,
} as const

// Role-Permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  owner: [
    PERMISSIONS.COMPANY_CREATE,
    PERMISSIONS.COMPANY_UPDATE,
    PERMISSIONS.COMPANY_DELETE,
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_MANAGE_USERS,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.POS_SALES_CREATE,
    PERMISSIONS.POS_SALES_VIEW,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_CASH_DRAWER,
    PERMISSIONS.POS_CUSTOMERS,
    PERMISSIONS.POS_REPORTS,
    PERMISSIONS.SUPPLIER_CREATE,
    PERMISSIONS.SUPPLIER_UPDATE,
    PERMISSIONS.SUPPLIER_DELETE,
    PERMISSIONS.SUPPLIER_VIEW,
    PERMISSIONS.FRANCHISE_CREATE,
    PERMISSIONS.FRANCHISE_UPDATE,
    PERMISSIONS.FRANCHISE_DELETE,
    PERMISSIONS.FRANCHISE_VIEW,
    PERMISSIONS.FRANCHISE_MANAGE_USERS,
    PERMISSIONS.WAREHOUSE_BILL_CREATE,
    PERMISSIONS.WAREHOUSE_BILL_UPDATE,
    PERMISSIONS.WAREHOUSE_BILL_DELETE,
    PERMISSIONS.WAREHOUSE_BILL_VIEW,
    PERMISSIONS.WAREHOUSE_BILL_COMPLETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.SETTINGS_SUBSCRIPTION,
    PERMISSIONS.SETTINGS_SMTP,
    PERMISSIONS.EMAIL_SEND,
    PERMISSIONS.SUBSCRIPTION_VIEW,
    PERMISSIONS.SUBSCRIPTION_UPDATE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_UPDATE,
  ],
  admin: [
    PERMISSIONS.COMPANY_CREATE,
    PERMISSIONS.COMPANY_UPDATE,
    PERMISSIONS.COMPANY_DELETE,
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.COMPANY_MANAGE_USERS,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_DELETE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.POS_SALES_CREATE,
    PERMISSIONS.POS_SALES_VIEW,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_CASH_DRAWER,
    PERMISSIONS.POS_CUSTOMERS,
    PERMISSIONS.POS_REPORTS,
    PERMISSIONS.SUPPLIER_CREATE,
    PERMISSIONS.SUPPLIER_UPDATE,
    PERMISSIONS.SUPPLIER_DELETE,
    PERMISSIONS.SUPPLIER_VIEW,
    PERMISSIONS.FRANCHISE_CREATE,
    PERMISSIONS.FRANCHISE_UPDATE,
    PERMISSIONS.FRANCHISE_DELETE,
    PERMISSIONS.FRANCHISE_VIEW,
    PERMISSIONS.FRANCHISE_MANAGE_USERS,
    PERMISSIONS.WAREHOUSE_BILL_CREATE,
    PERMISSIONS.WAREHOUSE_BILL_UPDATE,
    PERMISSIONS.WAREHOUSE_BILL_DELETE,
    PERMISSIONS.WAREHOUSE_BILL_VIEW,
    PERMISSIONS.WAREHOUSE_BILL_COMPLETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.SETTINGS_UPDATE,
    PERMISSIONS.SETTINGS_SMTP,
    PERMISSIONS.EMAIL_SEND,
    PERMISSIONS.SUBSCRIPTION_VIEW, // Can view but not update
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_UPDATE,
  ],
  manager: [
    PERMISSIONS.COMPANY_VIEW,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.INVENTORY_READ,
    PERMISSIONS.INVENTORY_WRITE,
    PERMISSIONS.INVENTORY_ADJUST,
    PERMISSIONS.POS_SALES_CREATE,
    PERMISSIONS.POS_SALES_VIEW,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_CASH_DRAWER,
    PERMISSIONS.POS_CUSTOMERS,
    PERMISSIONS.POS_REPORTS,
    PERMISSIONS.SUPPLIER_CREATE,
    PERMISSIONS.SUPPLIER_UPDATE,
    PERMISSIONS.SUPPLIER_VIEW,
    PERMISSIONS.FRANCHISE_VIEW,
    PERMISSIONS.WAREHOUSE_BILL_CREATE,
    PERMISSIONS.WAREHOUSE_BILL_UPDATE,
    PERMISSIONS.WAREHOUSE_BILL_VIEW,
    PERMISSIONS.WAREHOUSE_BILL_COMPLETE,
    PERMISSIONS.SETTINGS_VIEW,
    PERMISSIONS.EMAIL_SEND,
    PERMISSIONS.USERS_VIEW,
  ],
  employee: [
    PERMISSIONS.POS_SALES_CREATE,
    PERMISSIONS.POS_SALES_VIEW,
    PERMISSIONS.POS_REFUND,
    PERMISSIONS.POS_CASH_DRAWER,
    PERMISSIONS.POS_CUSTOMERS,
    PERMISSIONS.PRODUCT_VIEW,
    PERMISSIONS.INVENTORY_READ,
  ],
} as const

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  current_role?: UserRole // Role in the currently selected company context
}

export interface UserWithRole extends User {
  role: UserRole
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
  recaptcha_token?: string
}

export interface RegisterRequest {
  email: string
  password: string
  first_name: string
  recaptcha_token?: string
  last_name: string
}

export interface AuthResponse {
  token: string
  user: User
  role?: UserRole // User's role in the default/first company
}

export interface ValidateInvitationResponse {
  email: string
  company_id: number
  valid: boolean
}

export interface AcceptInvitationRequest {
  token: string
  first_name: string
  last_name: string
  password: string
}

export interface ValidateOTPRequest {
  code: string
  email: string
}

export interface ValidateOTPResponse {
  valid: boolean
  purpose?: string
  user_id?: number
}

export interface CompleteUserSetupRequest {
  code: string
  email: string
  first_name: string
  last_name: string
  phone?: string
  password: string
}

export interface ChangePasswordWithOTPRequest {
  code: string
  email: string
  password: string
}

export interface ChangePasswordRequest {
  current_password: string
  new_password: string
}

// Portal types
export type PortalType = 'company' | 'franchise'

export interface Portal {
  type: PortalType
  id: number
  name: string
  code: string
  role: UserRole
  parent_company_id?: number // Only for franchises
}

export interface UserPortalsResponse {
  portals: Portal[]
}

// Company types
export interface Company {
  id: number
  name: string
  code: string
  description?: string
  erp_url?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  user_role?: UserRole // Current user's role in this company
}

export interface CreateCompanyRequest {
  name: string
  code: string
  description?: string
  erp_url?: string
}

export interface UpdateCompanyRequest {
  name?: string
  description?: string
  erp_url?: string
  is_active?: boolean
}

export interface AddUserToCompanyRequest {
  email: string
  role: 'admin' | 'manager' | 'employee'
}

export interface UserCredentials {
  email: string
  password: string
}

export interface AddUserToCompanyResponse {
  user_created: boolean
  email_sent: boolean
  credentials?: UserCredentials
}

export interface AddUserToFranchiseResponse {
  user_created: boolean
  email_sent: boolean
  credentials?: UserCredentials
}

export interface UpdateUserRoleRequest {
	role: UserRole
}

// SMTP Config types
export type SMTPSecurityType = 'none' | 'ssl' | 'tls' | 'starttls'

// Email types
export interface SendEmailRequest {
	to: string[]
	subject: string
	body: string
	is_html: boolean
}

export interface SMTPConfig {
	id: number
	company_id: number
	host: string
	user: string
	port: number
	from_name: string
	security: SMTPSecurityType
	rate_limit: number
	is_active: boolean
	is_default: boolean
	created_at: string
	updated_at: string
}

export interface CreateSMTPConfigRequest {
	host: string
	user: string
	password: string
	port: number
	from_name?: string
	security: SMTPSecurityType
	rate_limit?: number
	is_active?: boolean
}

export interface UpdateSMTPConfigRequest {
	host?: string
	user?: string
	password?: string
	port?: number
	from_name?: string
	security?: SMTPSecurityType
	rate_limit?: number
	is_active?: boolean
}

export interface SMTPConfigResponse {
	id: number
	company_id: number
	host: string
	user: string
	port: number
	from_name: string
	security: string
	rate_limit: number
	is_active: boolean
	is_default: boolean
	created_at: string
	updated_at: string
}

export interface SMTPConfigListResponse {
	configs: SMTPConfigResponse[]
}

// Yalidine Config types
export interface YalidineConfig {
	id: number
	company_id: number
	api_id: string
	from_wilaya_id?: number | null
	is_active: boolean
	is_default: boolean
	created_at: string
	updated_at: string
}

export interface CreateYalidineConfigRequest {
	api_id: string
	api_token: string
	from_wilaya_id?: number | null
	is_active?: boolean
}

export interface UpdateYalidineConfigRequest {
	api_id?: string
	api_token?: string
	from_wilaya_id?: number | null
	is_active?: boolean
}

export interface YalidineConfigResponse {
	id: number
	company_id: number
	api_id: string
	from_wilaya_id?: number | null
	is_active: boolean
	is_default: boolean
	created_at: string
	updated_at: string
}

export interface YalidineConfigListResponse {
	configs: YalidineConfigResponse[]
}

// Yalidine API response types for testing
export interface YalidineCenter {
	center_id: number
	name: string
	address: string
	gps: string
	commune_id: number
	commune_name: string
	wilaya_id: number
	wilaya_name: string
}

export interface YalidineCentersResponse {
	data: YalidineCenter[]
	has_more: boolean
	total_data: number
	links: {
		self: string
		next?: string
	}
}

export interface YalidineWilaya {
	id: number
	name: string
	zone: number
	is_deliverable: number
}

export interface YalidineWilayasResponse {
	data: YalidineWilaya[]
	has_more: boolean
	total_data: number
	links: {
		self: string
		next?: string
	}
}

export interface YalidineCommune {
	id: number
	name: string
	wilaya_id: number
	wilaya_name: string
	is_deliverable: number
}

export interface YalidineCommunesResponse {
	data: YalidineCommune[]
	has_more: boolean
	total_data: number
	links: {
		self: string
		next?: string
	}
}

export interface YalidineFee {
	to_wilaya_id: number
	to_wilaya_name: string
	to_commune_id: number
	to_commune_name: string
	price: number
	delivery_fee: number
}

export interface YalidineFeesResponse {
	data: YalidineFee[]
	has_more: boolean
	total_data: number
	links: {
		self: string
		next?: string
	}
}

// Subscription types
export interface Subscription {
  id: number
  company_id: number
  plan_type: 'free' | 'basic' | 'premium' | 'enterprise'
  status: 'active' | 'inactive' | 'cancelled'
  start_date: string
  end_date?: string
  max_users: number
}

export interface UpdateSubscriptionRequest {
  plan_type?: 'free' | 'basic' | 'premium' | 'enterprise'
  status?: 'active' | 'inactive' | 'cancelled'
}

// Product types
export interface Product {
  id: number
  company_id: number
  name: string
  description?: string
  sku: string
  base_retail_price: number
  base_wholesale_price: number
  supplier_id?: number
  supplier_cost?: number
  is_active: boolean
  created_at?: string
  updated_at?: string
  variants?: ProductVariant[]
}

export interface ProductVariant {
  id: number
  product_id: number
  name: string
  sku: string
  retail_price?: number
  wholesale_price?: number
  attributes?: Record<string, any>
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface ProductVariantSearchResponse {
  // Variant details
  variant_id: number
  variant_name: string
  variant_sku: string
  
  // Product details
  product_id: number
  product_name: string
  product_sku: string
  
  // Base pricing (from product or variant)
  base_retail_price: number
  base_wholesale_price: number
  
  // Variant-specific pricing (if not using parent pricing)
  variant_retail_price?: number
  variant_wholesale_price?: number
  
  // Franchise pricing (if available)
  franchise_retail_price?: number
  franchise_wholesale_price?: number
  
  // Effective pricing (franchise override > variant > product base)
  effective_retail_price: number
  effective_wholesale_price: number
  
  // Flags
  use_parent_pricing: boolean
}

export interface CreateProductRequest {
  name: string
  description?: string
  sku: string
  base_retail_price: number
  base_wholesale_price: number
  supplier_id?: number
  supplier_cost?: number
}

export interface UpdateProductRequest {
  name?: string
  description?: string
  sku?: string
  base_retail_price?: number
  base_wholesale_price?: number
  supplier_id?: number
  supplier_cost?: number
  is_active?: boolean
}

export interface CreateProductVariantRequest {
  name: string
  sku: string
  retail_price?: number
  wholesale_price?: number
  use_parent_pricing?: boolean
  attributes?: Record<string, any>
}

export interface UpdateProductVariantRequest {
  name?: string
  sku?: string
  retail_price?: number
  wholesale_price?: number
  use_parent_pricing?: boolean
  attributes?: Record<string, any>
  is_active?: boolean
}

export interface AttributeDefinition {
  name: string
  values: string[]
}

export interface BulkCreateProductVariantsRequest {
  attributes: AttributeDefinition[]
  use_parent_pricing: boolean
}

export interface BulkCreateProductVariantsResponse {
  created_count: number
  variants: ProductVariant[]
}

export interface UpdateStockRequest {
  stock: number
}

export interface AdjustStockRequest {
  amount: number
}

// Franchise types
export interface Franchise {
  id: number
  parent_company_id: number
  name: string
  code: string
  description?: string
  address?: string
  phone?: string
  email?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateFranchiseRequest {
  name: string
  code: string
  description?: string
  address?: string
  phone?: string
  email?: string
}

export interface UpdateFranchiseRequest {
  name?: string
  description?: string
  address?: string
  phone?: string
  email?: string
  is_active?: boolean
}

export interface FranchisePricing {
  id: number
  franchise_id: number
  product_variant_id: number
  variant_name?: string
  variant_sku?: string
  retail_price?: number
  wholesale_price?: number
  default_retail_price: number
  default_wholesale_price: number
  is_active: boolean
}

export interface SetFranchisePricingRequest {
  product_variant_id: number
  retail_price?: number
  wholesale_price?: number
}

export interface BulkSetFranchisePricingRequest {
  product_id: number
  retail_price?: number
  wholesale_price?: number
}

export interface BulkSetFranchisePricingResponse {
  updated_count: number
  pricing: FranchisePricing[]
}

export interface AddUserToFranchiseRequest {
  email: string
  role: 'owner' | 'admin' | 'manager' | 'employee'
}

// Inventory types
export interface Inventory {
  id: number
  product_variant_id: number
  product_id?: number
  product_name?: string
  variant_name?: string
  variant_sku?: string
  company_id?: number
  franchise_id?: number
  franchise_name?: string
  stock: number
  reserved_stock: number
  available_stock: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface InventoryListResponse {
  inventories: Inventory[]
  total: number
}

export interface CreateInventoryRequest {
  product_variant_id: number
  company_id?: number
  franchise_id?: number
  stock: number
}

export interface UpdateInventoryStockRequest {
  stock: number
}

export interface AdjustInventoryStockRequest {
  adjustment: number
  notes?: string
}

export interface ReserveStockRequest {
  quantity: number
  reference_type?: string
  reference_id?: string
  notes?: string
}

export interface ReleaseStockRequest {
  quantity: number
  notes?: string
}

export interface InventoryMovement {
  id: number
  inventory_id: number
  movement_type: string
  quantity: number
  previous_stock: number
  new_stock: number
  reference_type?: string
  reference_id?: string
  notes?: string
  created_by_id: number
  created_at: string
}

export interface InventoryMovementListResponse {
  movements: InventoryMovement[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface MovementFilterParams {
  page?: number
  limit?: number
  movement_type?: string
  start_date?: string
  end_date?: string
}

// Supplier types
export interface Supplier {
  id: number
  company_id: number
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  is_active: boolean
  product_count: number
  created_at?: string
  updated_at?: string
}

export interface CreateSupplierRequest {
  name: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
}

export interface UpdateSupplierRequest {
  name?: string
  contact_person?: string
  email?: string
  phone?: string
  address?: string
  is_active?: boolean
}

export interface SupplierProductInfo {
  id: number
  name: string
  sku: string
  supplier_cost?: number
}

export interface SupplierWithProducts {
  id: number
  company_id: number
  name: string
  contact_person: string
  email: string
  phone: string
  address: string
  is_active: boolean
  products: SupplierProductInfo[]
}

// Supplier Bill types
export type BillStatus = 'draft' | 'completed' | 'cancelled'
export type SupplierPaymentStatus = 'unpaid' | 'partially_paid' | 'paid'

export interface SupplierBillItem {
  id: number
  supplier_bill_id: number
  product_variant_id: number
  quantity: number
  unit_cost: number
  total_cost: number
  created_at: string
  // Product and variant details
  product_name?: string
  variant_name?: string
  variant_sku?: string
}

export interface SupplierBill {
  id: number
  company_id: number
  supplier_id: number
  bill_number: string
  total_amount: number
  paid_amount: number
  pending_amount: number
  payment_status: SupplierPaymentStatus
  bill_status: BillStatus
  notes?: string
  created_by_id: number
  created_at: string
  updated_at: string
  items?: SupplierBillItem[]
  supplier?: Supplier
  payments?: SupplierPayment[]
}

export interface SupplierBillItemRequest {
  product_variant_id: number
  quantity: number
  unit_cost: number
}

export interface CreateSupplierBillRequest {
  supplier_id: number
  items: SupplierBillItemRequest[]
  paid_amount?: number
  notes?: string
}

export interface UpdateSupplierBillRequest {
  items?: SupplierBillItemRequest[]
  notes?: string
  bill_status?: BillStatus
}

// Supplier Payment types
export interface SupplierPaymentDistribution {
  id: number
  supplier_payment_id: number
  supplier_bill_id: number
  amount: number
  created_at: string
}

export interface SupplierPayment {
  id: number
  supplier_id: number
  company_id: number
  amount: number
  payment_method: PaymentMethod
  payment_status: PaymentTransactionStatus
  reference?: string
  notes?: string
  created_by_id: number
  created_at: string
  distributions?: SupplierPaymentDistribution[]
}

export interface RecordSupplierPaymentRequest {
  supplier_id: number
  amount: number
  payment_method: PaymentMethod
  reference?: string
  notes?: string
}

// Outstanding Balance type
export interface SupplierOutstandingBalance {
  supplier_id: number
  company_id: number
  outstanding_amount: number
}

// POS types

export type PaymentMethod = 'cash' | 'card' | 'other'
export type PaymentStatus = 'unpaid' | 'partially_paid' | 'paid' | 'refunded'
export type SaleStatus = 'draft' | 'completed' | 'cancelled' | 'refunded'
export type PaymentTransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type CashDrawerStatus = 'open' | 'closed'
export type RefundStatus = 'pending' | 'completed' | 'cancelled'

// Customer types
export interface Customer {
  id: number
  company_id: number
  name: string
  email?: string
  phone?: string
  address?: string
  total_purchases: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateCustomerRequest {
  name: string
  email?: string
  phone?: string
  address?: string
}

export interface UpdateCustomerRequest {
  name?: string
  email?: string
  phone?: string
  address?: string
  is_active?: boolean
}

// Sale types
export interface SaleItem {
  id: number
  sale_id: number
  product_variant_id: number
  quantity: number
  unit_price: number
  discount_amount: number
  sub_total: number
  total_amount: number
  created_at: string
  product_name?: string
  variant_name?: string
  variant_sku?: string
}

export interface SaleItemRequest {
  product_variant_id: number
  quantity: number
  unit_price: number
  discount_amount?: number
}

export interface Payment {
  id: number
  sale_id: number
  payment_method: PaymentMethod
  amount: number
  payment_status: PaymentTransactionStatus
  reference?: string
  notes?: string
  created_at: string
}

export interface Sale {
  id: number
  company_id: number
  franchise_id?: number
  customer_id?: number
  receipt_number: string
  sub_total: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_status: PaymentStatus
  sale_status: SaleStatus
  notes?: string
  created_by_id: number
  created_at: string
  updated_at: string
  items?: SaleItem[]
  payments?: Payment[]
  customer?: Customer
}

export interface CreateSaleRequest {
  franchise_id?: number
  customer_id?: number
  items: SaleItemRequest[]
  tax_amount?: number
  discount_amount?: number
  notes?: string
}

export interface AddPaymentRequest {
  payment_method: PaymentMethod
  amount: number
  reference?: string
  notes?: string
}

// Cash Drawer types
export interface CashDrawerTransaction {
  id: number
  cash_drawer_id: number
  transaction_type: 'sale' | 'refund' | 'adjustment'
  amount: number
  sale_id?: number
  notes?: string
  created_at: string
}

export interface CashDrawer {
  id: number
  company_id?: number
  franchise_id?: number
  opening_balance: number
  closing_balance?: number
  expected_balance?: number
  difference?: number
  status: CashDrawerStatus
  opened_by_id: number
  closed_by_id?: number
  opened_at: string
  closed_at?: string
  notes?: string
  transactions?: CashDrawerTransaction[]
  created_at: string
  updated_at: string
}

export interface OpenCashDrawerRequest {
  franchise_id?: number
  opening_balance: number
  notes?: string
}

export interface CloseCashDrawerRequest {
  closing_balance: number
  notes?: string
}

// Refund types
export interface Refund {
  id: number
  original_sale_id: number
  refund_amount: number
  reason: string
  refund_method: PaymentMethod
  refund_status: RefundStatus
  processed_by_id: number
  created_at: string
  updated_at: string
  original_sale?: Sale
}

export interface ProcessRefundRequest {
  refund_amount: number
  reason: string
  refund_method: PaymentMethod
}

// Sales Report types
export interface SalesReport {
  total_sales: number
  total_revenue: number
  total_cash: number
  total_card: number
  total_refunded: number
  average_order_value: number
  sales_by_date: Record<string, number>
}

export interface SalesReportRequest {
  start_date: string
  end_date: string
  franchise_id?: number
}

// Receipt types
export interface Receipt {
  receipt_number: string
  date: string
  company_name: string
  franchise_name?: string
  customer_name?: string
  items: SaleItem[]
  sub_total: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payments: Payment[]
}

// Warehouse Bill types
export type WarehouseBillType = 'exit' | 'entry'
export type WarehouseBillStatus = 'draft' | 'completed' | 'cancelled' | 'verified'
export type VerificationStatus = 'pending' | 'verified' | 'discrepancies_found'
export type DiscrepancyType = 'none' | 'missing' | 'extra' | 'quantity_mismatch'

export interface WarehouseBillItem {
  id: number
  warehouse_bill_id: number
  product_variant_id: number
  expected_quantity: number
  received_quantity?: number
  quantity: number
  unit_price: number
  total_amount: number
  discrepancy_type: DiscrepancyType
  discrepancy_notes?: string
  created_at: string
  product_name?: string
  variant_name?: string
  variant_sku?: string
}

export interface WarehouseBill {
  id: number
  company_id: number
  franchise_id: number
  bill_number: string
  bill_type: WarehouseBillType
  related_bill_id?: number
  status: WarehouseBillStatus
  verification_status: VerificationStatus
  total_amount: number
  notes?: string
  verified_by_id?: number
  verified_at?: string
  created_by_id: number
  created_at: string
  updated_at: string
  items?: WarehouseBillItem[]
}

export interface WarehouseBillItemRequest {
  product_variant_id: number
  quantity: number
  unit_price: number
}

export interface CreateExitBillRequest {
  franchise_id: number
  items: WarehouseBillItemRequest[]
  notes?: string
}

export interface CreateEntryBillRequest {
  exit_bill_id: number
  notes?: string
  items: VerifyEntryBillItemRequest[] // Required - all items to record (from exit bill + extras)
}

export interface UpdateExitBillItemRequest {
  id?: number
  product_variant_id: number
  quantity: number
  unit_price: number
}

export interface UpdateExitBillItemsRequest {
  items: UpdateExitBillItemRequest[]
  change_reason?: string
}

export interface VerifyEntryBillItemRequest {
  product_variant_id: number
  received_quantity: number
}

export interface VerifyEntryBillRequest {
  items: VerifyEntryBillItemRequest[]
  notes?: string
}

// Order types
export type OrderSource = 'shopify' | 'woocommerce' | 'manual'

export type OrderStatus =
  | 'unconfirmed'
  | 'packing'
  | 'dispatching'
  | 'delivering'
  | 'delivered'
  | 'returning'
  | 'returned'
  | 'cancelled'
  | 'relaunched'

export type DeliveryType = 'home' | 'stop_desk'

export interface Order {
  id: number
  company_id: number
  external_order_id?: string
  source: OrderSource
  status: OrderStatus
  shipping_provider?: string
  delivery_type?: DeliveryType
  commune_id?: number
  center_id?: number
  customer_full_name: string
  customer_phone: string
  customer_phone2: string
  customer_address: string
  customer_state: string
  customer_comments: string
  product_total: number
  first_delivery_cost: number
  second_delivery_cost: number
  discount: number
  total: number
  items: OrderItem[]
  client_statuses?: ClientStatus[]
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  product_variant_id?: number
  product_name?: string
  variant_name?: string
  sku?: string
  is_snapshot: boolean
  quantity: number
  price: number
  confirmed_quantity?: number
  confirmed_price?: number
  line_total: number
}

export interface ClientStatus {
  id: number
  order_id: number
  qualification_id: number
  qualification_name?: string
  sub_qualification_id?: number
  sub_qualification_name?: string
  comment: string
  date_time: string
  created_at: string
}

export interface Qualification {
  id: number
  company_id: number
  name: string
  parent_id?: number
  parent_name?: string
  color: string
  is_order_history: boolean
  sub_qualifications?: Qualification[]
  created_at: string
  updated_at: string
}

export interface ShopifyWebhookConfig {
  id: number
  company_id: number
  store_domain: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface WooCommerceWebhookConfig {
  id: number
  company_id: number
  store_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// Order request types
export interface CreateOrderRequest {
  customer_full_name: string
  customer_phone: string
  customer_phone2?: string
  customer_address: string
  customer_state: string
  customer_comments?: string
  items: CreateOrderItemRequest[]
  discount?: number
}

export interface CreateOrderItemRequest {
  product_variant_id?: number
  quantity: number
  price: number
}

export interface UpdateOrderRequest {
  customer_full_name?: string
  customer_phone?: string
  customer_phone2?: string
  customer_address?: string
  customer_state?: string
  customer_comments?: string
  discount?: number
}

export interface ConfirmOrderRequest {
  shipping_provider: string
  delivery_type: DeliveryType
  commune_id?: number
  center_id?: number
  second_delivery_cost: number
  items: ConfirmOrderItemRequest[]
}

export interface ConfirmOrderItemRequest {
  id: number
  confirmed_quantity?: number
  confirmed_price?: number
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus
}

export interface CreateClientStatusRequest {
  qualification_id: number
  sub_qualification_id?: number
  comment?: string
  date_time?: string
}

export interface CreateQualificationRequest {
  name: string
  parent_id?: number
  color: string
  is_order_history?: boolean
}

export interface UpdateQualificationRequest {
  name?: string
  parent_id?: number
  color?: string
  is_order_history?: boolean
}

export interface CreateShopifyWebhookConfigRequest {
  store_domain: string
  webhook_secret: string
  is_active?: boolean
}

export interface UpdateShopifyWebhookConfigRequest {
  store_domain?: string
  webhook_secret?: string
  is_active?: boolean
}

export interface CreateWooCommerceWebhookConfigRequest {
  store_url: string
  webhook_secret: string
  is_active?: boolean
}

export interface UpdateWooCommerceWebhookConfigRequest {
  store_url?: string
  webhook_secret?: string
  is_active?: boolean
}

export interface ListOrdersResponse {
  orders: Order[]
  total: number
  page: number
  limit: number
}

export interface OrderFilters {
  status?: OrderStatus
  source?: OrderSource
  date_from?: string
  date_to?: string
  page?: number
  limit?: number
}



