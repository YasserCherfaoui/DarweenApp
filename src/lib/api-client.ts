import { env } from '@/env'
import type {
  AcceptInvitationRequest,
  AddPaymentRequest,
  AddUserToCompanyRequest,
  AddUserToCompanyResponse,
  AddUserToFranchiseRequest,
  AddUserToFranchiseResponse,
  AdjustInventoryStockRequest,
  AdjustStockRequest,
  ApiResponse,
  AuthResponse,
  BulkCreateProductVariantsRequest,
  BulkCreateProductVariantsResponse,
  BulkSetFranchisePricingRequest,
  BulkSetFranchisePricingResponse,
  CashDrawer,
  ChangePasswordRequest,
  ChangePasswordWithOTPRequest,
  CheckCodeAvailabilityResponse,
  ClientStatus,
  CloseCashDrawerRequest,
  Company,
  CompleteUserSetupRequest,
  ConfirmOrderRequest,
  CreateClientStatusRequest,
  CreateCompanyRequest,
  CreateCustomerRequest,
  CreateEntryBillRequest,
  CreateExitBillRequest,
  CreateFranchiseRequest,
  CreateInventoryRequest,
  CreateOrderRequest,
  CreateProductRequest,
  CreateProductVariantRequest,
  CreateQualificationRequest,
  CreateSMTPConfigRequest,
  CreateSaleRequest,
  CreateShopifyWebhookConfigRequest,
  CreateSupplierBillRequest,
  CreateSupplierRequest,
  CreateWooCommerceWebhookConfigRequest,
  CreateYalidineConfigRequest,
  Customer,
  Franchise,
  FranchisePricing,
  Inventory,
  InventoryMovementListResponse,
  ListOrdersResponse,
  LoginRequest,
  MovementFilterParams,
  OpenCashDrawerRequest,
  Order,
  OrderFilters,
  PaginatedResponse,
  PaginationParams,
  PasswordResetRequest,
  PasswordResetResponse,
  Payment,
  ProcessRefundRequest,
  Product,
  ProductVariant,
  ProductVariantSearchResponse,
  Qualification,
  RecordSupplierPaymentRequest,
  Refund,
  RegisterRequest,
  RegisterResponse,
  ReleaseStockRequest,
  ResendVerificationRequest,
  ResendVerificationResponse,
  ReserveStockRequest,
  SMTPConfigListResponse,
  SMTPConfigResponse,
  Sale,
  SalesReport,
  SalesReportRequest,
  SendEmailRequest,
  SetFranchisePricingRequest,
  ShopifyWebhookConfig,
  Subscription,
  Supplier,
  SupplierBill,
  SupplierBillItem,
  SupplierBillItemRequest,
  SupplierOutstandingBalance,
  SupplierPayment,
  SupplierWithProducts,
  UpdateCompanyRequest,
  UpdateCustomerRequest,
  UpdateExitBillItemsRequest,
  UpdateFranchiseRequest,
  UpdateInventoryStockRequest,
  UpdateOrderRequest,
  UpdateOrderStatusRequest,
  UpdateProductRequest,
  UpdateProductVariantRequest,
  UpdateQualificationRequest,
  UpdateSMTPConfigRequest,
  UpdateShopifyWebhookConfigRequest,
  UpdateStockRequest,
  UpdateSubscriptionRequest,
  UpdateSupplierBillRequest,
  UpdateSupplierRequest,
  UpdateWooCommerceWebhookConfigRequest,
  UpdateYalidineConfigRequest,
  User,
  UserPortalsResponse,
  UserRole,
  UserWithRole,
  ValidateInvitationResponse,
  ValidateOTPResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  VerifyEntryBillRequest,
  WarehouseBill,
  WooCommerceWebhookConfig,
  YalidineCentersResponse,
  YalidineCommunesResponse,
  YalidineConfigListResponse,
  YalidineConfigResponse,
  YalidineFeesResponse,
  YalidineWilayasResponse
} from '@/types/api'

const API_URL = env.VITE_API_URL

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle authentication errors
      if (response.status === 401) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user')
        // Dispatch custom event instead of hard redirect
        window.dispatchEvent(new CustomEvent('auth:unauthorized'))
      }
      
      // Enhanced error with permission context
      const error = new Error(data.error?.message || 'An error occurred') as any
      error.response = { data, status: response.status }
      error.status = response.status
      error.code = data.error?.code
      
      // Add permission context for 403 errors
      if (response.status === 403) {
        error.isPermissionError = true
        error.permissionContext = {
          message: data.error?.message || 'You don\'t have permission to perform this action',
          code: data.error?.code || 'FORBIDDEN',
          // Extract permission from error message if available
          requiredPermission: extractPermissionFromMessage(data.error?.message),
        }
      }
      
      throw error
    }

    return data
  }

  // Auth endpoints
  auth = {
    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
      return this.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    register: async (
      data: RegisterRequest
    ): Promise<ApiResponse<RegisterResponse>> => {
      return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    verifyEmail: async (
      data: VerifyEmailRequest
    ): Promise<ApiResponse<VerifyEmailResponse>> => {
      return this.request('/auth/verify-email', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    resendVerificationEmail: async (
      data: ResendVerificationRequest
    ): Promise<ApiResponse<ResendVerificationResponse>> => {
      return this.request('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    validateInvitation: async (
      token: string
    ): Promise<ApiResponse<ValidateInvitationResponse>> => {
      return this.request('/auth/invitation/validate', {
        method: 'POST',
        body: JSON.stringify({ token }),
      })
    },

    acceptInvitation: async (
      data: AcceptInvitationRequest
    ): Promise<ApiResponse<AuthResponse>> => {
      return this.request('/auth/invitation/accept', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    validateOTP: async (
      code: string,
      email: string
    ): Promise<ApiResponse<ValidateOTPResponse>> => {
      return this.request('/auth/otp/validate', {
        method: 'POST',
        body: JSON.stringify({ code, email }),
      })
    },

    completeUserSetup: async (
      data: CompleteUserSetupRequest
    ): Promise<ApiResponse<AuthResponse>> => {
      return this.request('/auth/otp/setup', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    changePasswordWithOTP: async (
      data: ChangePasswordWithOTPRequest
    ): Promise<ApiResponse<{ message: string }>> => {
      return this.request('/auth/otp/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    requestPasswordReset: async (
      data: PasswordResetRequest
    ): Promise<ApiResponse<PasswordResetResponse>> => {
      return this.request('/auth/password-reset/request', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    initiateGoogleOAuth: async (): Promise<ApiResponse<{ url: string }>> => {
      return this.request('/auth/google', {
        method: 'GET',
      })
    },
  }

  // User endpoints
  users = {
    getMe: async (): Promise<ApiResponse<User>> => {
      return this.request('/users/me')
    },

    updateMe: async (
      data: Partial<Pick<User, 'first_name' | 'last_name'>>
    ): Promise<ApiResponse<User>> => {
      return this.request('/users/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    listByCompany: async (companyId: number): Promise<ApiResponse<UserWithRole[]>> => {
      return this.request(`/users?company_id=${companyId}`)
    },

    changePassword: async (
      data: ChangePasswordRequest
    ): Promise<ApiResponse<{ message: string }>> => {
      return this.request('/users/me/password', {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    getPortals: async (): Promise<ApiResponse<UserPortalsResponse>> => {
      return this.request('/users/me/portals')
    },
  }

  // Company endpoints
  companies = {
    list: async (): Promise<ApiResponse<Company[]>> => {
      return this.request('/companies')
    },

    get: async (id: number): Promise<ApiResponse<Company>> => {
      return this.request(`/companies/${id}`)
    },

    create: async (
      data: CreateCompanyRequest
    ): Promise<ApiResponse<Company>> => {
      return this.request('/companies', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    checkCodeAvailability: async (
      code: string
    ): Promise<ApiResponse<CheckCodeAvailabilityResponse>> => {
      return this.request(`/companies/check-code?code=${encodeURIComponent(code)}`)
    },

    update: async (
      id: number,
      data: UpdateCompanyRequest
    ): Promise<ApiResponse<Company>> => {
      return this.request(`/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    addUser: async (
      id: number,
      data: AddUserToCompanyRequest
    ): Promise<ApiResponse<AddUserToCompanyResponse>> => {
      return this.request(`/companies/${id}/users`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    removeUser: async (
      id: number,
      userId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(`/companies/${id}/users/${userId}`, {
        method: 'DELETE',
      })
    },

    getUsers: async (
      id: number
    ): Promise<ApiResponse<{ users: UserWithRole[] }>> => {
      return this.request(`/companies/${id}/users`)
    },

    updateUserRole: async (
      id: number,
      userId: number,
      role: UserRole
    ): Promise<ApiResponse<null>> => {
      return this.request(`/companies/${id}/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      })
    },

    initializeInventory: async (
      companyId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(
        `/companies/${companyId}/inventory/initialize`,
        {
          method: 'POST',
        }
      )
    },
  }

  // SMTP Config endpoints
  smtpConfigs = {
    list: async (
      companyId: number
    ): Promise<ApiResponse<SMTPConfigListResponse>> => {
      return this.request(`/companies/${companyId}/smtp-configs`)
    },

    get: async (
      companyId: number,
      configId: number
    ): Promise<ApiResponse<SMTPConfigResponse>> => {
      return this.request(`/companies/${companyId}/smtp-configs/${configId}`)
    },

    create: async (
      companyId: number,
      data: CreateSMTPConfigRequest
    ): Promise<ApiResponse<SMTPConfigResponse>> => {
      return this.request(`/companies/${companyId}/smtp-configs`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update: async (
      companyId: number,
      configId: number,
      data: UpdateSMTPConfigRequest
    ): Promise<ApiResponse<SMTPConfigResponse>> => {
      return this.request(`/companies/${companyId}/smtp-configs/${configId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    delete: async (
      companyId: number,
      configId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(`/companies/${companyId}/smtp-configs/${configId}`, {
        method: 'DELETE',
      })
    },

    setDefault: async (
      companyId: number,
      configId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(
        `/companies/${companyId}/smtp-configs/${configId}/default`,
        {
          method: 'PUT',
        }
      )
    },
  }

  // Email endpoints
  emails = {
    send: async (
      companyId: number,
      data: SendEmailRequest
    ): Promise<ApiResponse<null>> => {
      return this.request(`/companies/${companyId}/emails/send`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },
  }

  // Yalidine Config endpoints
  yalidineConfigs = {
    list: async (
      companyId: number
    ): Promise<ApiResponse<YalidineConfigListResponse>> => {
      return this.request(`/companies/${companyId}/yalidine-configs`)
    },

    get: async (
      companyId: number,
      configId: number
    ): Promise<ApiResponse<YalidineConfigResponse>> => {
      return this.request(`/companies/${companyId}/yalidine-configs/${configId}`)
    },

    create: async (
      companyId: number,
      data: CreateYalidineConfigRequest
    ): Promise<ApiResponse<YalidineConfigResponse>> => {
      return this.request(`/companies/${companyId}/yalidine-configs`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update: async (
      companyId: number,
      configId: number,
      data: UpdateYalidineConfigRequest
    ): Promise<ApiResponse<YalidineConfigResponse>> => {
      return this.request(`/companies/${companyId}/yalidine-configs/${configId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    delete: async (
      companyId: number,
      configId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(`/companies/${companyId}/yalidine-configs/${configId}`, {
        method: 'DELETE',
      })
    },

    setDefault: async (
      companyId: number,
      configId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(
        `/companies/${companyId}/yalidine-configs/${configId}/default`,
        {
          method: 'PUT',
        }
      )
    },
  }

  // Yalidine API endpoints
  yalidine = {
    getCenters: async (
      companyId: number,
      queryParams?: Record<string, string | number>
    ): Promise<ApiResponse<YalidineCentersResponse>> => {
      const query = new URLSearchParams()
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          query.append(key, value.toString())
        })
      }
      const queryString = query.toString()
      return this.request(
        `/companies/${companyId}/yalidine/centers${queryString ? `?${queryString}` : ''}`
      )
    },

    getWilayas: async (
      companyId: number,
      queryParams?: Record<string, string | number>
    ): Promise<ApiResponse<YalidineWilayasResponse>> => {
      const query = new URLSearchParams()
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          query.append(key, value.toString())
        })
      }
      const queryString = query.toString()
      return this.request(
        `/companies/${companyId}/yalidine/wilayas${queryString ? `?${queryString}` : ''}`
      )
    },

    getCommunes: async (
      companyId: number,
      queryParams?: Record<string, string | number>
    ): Promise<ApiResponse<YalidineCommunesResponse>> => {
      const query = new URLSearchParams()
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          query.append(key, value.toString())
        })
      }
      const queryString = query.toString()
      return this.request(
        `/companies/${companyId}/yalidine/communes${queryString ? `?${queryString}` : ''}`
      )
    },

    getFees: async (
      companyId: number,
      queryParams?: Record<string, string | number>
    ): Promise<ApiResponse<YalidineFeesResponse>> => {
      const query = new URLSearchParams()
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          query.append(key, value.toString())
        })
      }
      const queryString = query.toString()
      return this.request(
        `/companies/${companyId}/yalidine/fees${queryString ? `?${queryString}` : ''}`
      )
    },
  }

  // Subscription endpoints
  subscriptions = {
    get: async (companyId: number): Promise<ApiResponse<Subscription>> => {
      return this.request(`/companies/${companyId}/subscription`)
    },

    update: async (
      companyId: number,
      data: UpdateSubscriptionRequest
    ): Promise<ApiResponse<Subscription>> => {
      return this.request(`/companies/${companyId}/subscription`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },
  }

  // Product endpoints
  products = {
    list: async (
      companyId: number,
      params?: PaginationParams
    ): Promise<ApiResponse<PaginatedResponse<Product>>> => {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      const queryString = query.toString()
      return this.request(
        `/companies/${companyId}/products${queryString ? `?${queryString}` : ''}`
      )
    },

    get: async (
      companyId: number,
      productId: number
    ): Promise<ApiResponse<Product>> => {
      return this.request(`/companies/${companyId}/products/${productId}`)
    },

    create: async (
      companyId: number,
      data: CreateProductRequest
    ): Promise<ApiResponse<Product>> => {
      return this.request(`/companies/${companyId}/products`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update: async (
      companyId: number,
      productId: number,
      data: UpdateProductRequest
    ): Promise<ApiResponse<Product>> => {
      return this.request(`/companies/${companyId}/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    delete: async (
      companyId: number,
      productId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(`/companies/${companyId}/products/${productId}`, {
        method: 'DELETE',
      })
    },

    bulkCreate: async (
      companyId: number,
      file: File
    ): Promise<ApiResponse<{ products_created: number; variants_created: number; message: string }>> => {
      const token = this.getAuthToken()
      const formData = new FormData()
      formData.append('file', file)
      
      const headers: Record<string, string> = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      // Don't set Content-Type - let browser set it with boundary for FormData
      
      const response = await fetch(`${API_URL}/companies/${companyId}/products/bulk`, {
        method: 'POST',
        headers,
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          // Dispatch custom event instead of hard redirect
          window.dispatchEvent(new CustomEvent('auth:unauthorized'))
        }
        const error = new Error(data.error?.message || 'An error occurred') as any
        error.response = { data, status: response.status }
        error.status = response.status
        error.code = data.error?.code
        throw error
      }
      
      return data
    },
  }

  // Product variant endpoints
  productVariants = {
    list: async (
      companyId: number,
      productId: number
    ): Promise<ApiResponse<ProductVariant[]>> => {
      return this.request(
        `/companies/${companyId}/products/${productId}/variants`
      )
    },

    get: async (
      companyId: number,
      productId: number,
      variantId: number
    ): Promise<ApiResponse<ProductVariant>> => {
      return this.request(
        `/companies/${companyId}/products/${productId}/variants/${variantId}`
      )
    },

    create: async (
      companyId: number,
      productId: number,
      data: CreateProductVariantRequest
    ): Promise<ApiResponse<ProductVariant>> => {
      return this.request(
        `/companies/${companyId}/products/${productId}/variants`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
    },

    bulkCreate: async (
      companyId: number,
      productId: number,
      data: BulkCreateProductVariantsRequest
    ): Promise<ApiResponse<BulkCreateProductVariantsResponse>> => {
      return this.request(
        `/companies/${companyId}/products/${productId}/variants/bulk`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
    },

    update: async (
      companyId: number,
      productId: number,
      variantId: number,
      data: UpdateProductVariantRequest
    ): Promise<ApiResponse<ProductVariant>> => {
      return this.request(
        `/companies/${companyId}/products/${productId}/variants/${variantId}`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      )
    },

    delete: async (
      companyId: number,
      productId: number,
      variantId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(
        `/companies/${companyId}/products/${productId}/variants/${variantId}`,
        {
          method: 'DELETE',
        }
      )
    },

    updateStock: async (
      companyId: number,
      productId: number,
      variantId: number,
      data: UpdateStockRequest
    ): Promise<ApiResponse<ProductVariant>> => {
      return this.request(
        `/companies/${companyId}/products/${productId}/variants/${variantId}/stock`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      )
    },

    adjustStock: async (
      companyId: number,
      productId: number,
      variantId: number,
      data: AdjustStockRequest
    ): Promise<ApiResponse<ProductVariant>> => {
      return this.request(
        `/companies/${companyId}/products/${productId}/variants/${variantId}/stock/adjust`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
    },
  }

  // Label generation endpoints
  labels = {
    generateProductLabel: async (
      companyId: number,
      productId: number    ): Promise<Blob> => {
      const token = this.getAuthToken()
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      let url = `${API_URL}/companies/${companyId}/products/${productId}/label`
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to generate label')
      }

      return response.blob()
    },

    generateVariantLabel: async (
      companyId: number,
      productId: number,
      variantId: number    ): Promise<Blob> => {
      const token = this.getAuthToken()
      const headers: HeadersInit = {}
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      let url = `${API_URL}/companies/${companyId}/products/${productId}/variants/${variantId}/label`
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        throw new Error('Failed to generate label')
      }

      return response.blob()
    },

    generateBulkLabels: async (
      companyId: number,
      data: { 
        products?: Array<{ product_id: number; quantity: number }>; 
        variants?: Array<{ variant_id: number; quantity: number }>; 
        config?: any 
      }
    ): Promise<Blob> => {
      const token = this.getAuthToken()
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      }
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(`${API_URL}/companies/${companyId}/products/labels/bulk`, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to generate bulk labels')
      }

      return response.blob()
    },
  }

  // Franchise endpoints
  franchises = {
    list: async (companyId: number): Promise<ApiResponse<Franchise[]>> => {
      return this.request(`/companies/${companyId}/franchises`)
    },

    listAll: async (): Promise<ApiResponse<Franchise[]>> => {
      return this.request('/franchises')
    },

    get: async (franchiseId: number): Promise<ApiResponse<Franchise>> => {
      return this.request(`/franchises/${franchiseId}`)
    },

    create: async (
      companyId: number,
      data: CreateFranchiseRequest
    ): Promise<ApiResponse<Franchise>> => {
      return this.request(`/companies/${companyId}/franchises`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update: async (
      franchiseId: number,
      data: UpdateFranchiseRequest
    ): Promise<ApiResponse<Franchise>> => {
      return this.request(`/franchises/${franchiseId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    getPricing: async (
      franchiseId: number
    ): Promise<ApiResponse<FranchisePricing[]>> => {
      return this.request(`/franchises/${franchiseId}/pricing`)
    },

    setPricing: async (
      franchiseId: number,
      data: SetFranchisePricingRequest
    ): Promise<ApiResponse<FranchisePricing>> => {
      return this.request(`/franchises/${franchiseId}/pricing`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    bulkSetPricing: async (
      franchiseId: number,
      data: BulkSetFranchisePricingRequest
    ): Promise<ApiResponse<BulkSetFranchisePricingResponse>> => {
      return this.request(`/franchises/${franchiseId}/pricing/bulk`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    deletePricing: async (
      franchiseId: number,
      variantId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(
        `/franchises/${franchiseId}/pricing/${variantId}`,
        {
          method: 'DELETE',
        }
      )
    },

    addUser: async (
      franchiseId: number,
      data: AddUserToFranchiseRequest
    ): Promise<ApiResponse<AddUserToFranchiseResponse>> => {
      return this.request(`/franchises/${franchiseId}/users`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    removeUser: async (
      franchiseId: number,
      userId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(`/franchises/${franchiseId}/users/${userId}`, {
        method: 'DELETE',
      })
    },

    getUsers: async (
      franchiseId: number
    ): Promise<ApiResponse<{ users: UserWithRole[] }>> => {
      return this.request(`/franchises/${franchiseId}/users`)
    },

    updateUserRole: async (
      franchiseId: number,
      userId: number,
      role: UserRole
    ): Promise<ApiResponse<null>> => {
      return this.request(`/franchises/${franchiseId}/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role }),
      })
    },

    initializeInventory: async (
      franchiseId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(
        `/franchises/${franchiseId}/inventory/initialize`,
        {
          method: 'POST',
        }
      )
    },
  }

  // Inventory endpoints
  inventory = {
    getByCompany: async (
      companyId: number
    ): Promise<ApiResponse<Inventory[]>> => {
      return this.request(`/companies/${companyId}/inventory`)
    },

    getByFranchise: async (
      franchiseId: number
    ): Promise<ApiResponse<Inventory[]>> => {
      return this.request(`/franchises/${franchiseId}/inventory`)
    },

    create: async (
      data: CreateInventoryRequest
    ): Promise<ApiResponse<Inventory>> => {
      return this.request('/inventory', {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    updateStock: async (
      inventoryId: number,
      data: UpdateInventoryStockRequest
    ): Promise<ApiResponse<Inventory>> => {
      return this.request(`/inventory/${inventoryId}/stock`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    adjustStock: async (
      inventoryId: number,
      data: AdjustInventoryStockRequest
    ): Promise<ApiResponse<Inventory>> => {
      return this.request(`/inventory/${inventoryId}/stock/adjust`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    reserve: async (
      inventoryId: number,
      data: ReserveStockRequest
    ): Promise<ApiResponse<Inventory>> => {
      return this.request(`/inventory/${inventoryId}/reserve`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    release: async (
      inventoryId: number,
      data: ReleaseStockRequest
    ): Promise<ApiResponse<Inventory>> => {
      return this.request(`/inventory/${inventoryId}/release`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    getMovements: async (
      inventoryId: number,
      params?: MovementFilterParams
    ): Promise<ApiResponse<InventoryMovementListResponse>> => {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      if (params?.movement_type) query.append('movement_type', params.movement_type)
      if (params?.start_date) query.append('start_date', params.start_date)
      if (params?.end_date) query.append('end_date', params.end_date)
      const queryString = query.toString()
      return this.request(`/inventory/${inventoryId}/movements${queryString ? `?${queryString}` : ''}`)
    },

    getMovementsWithFilters: async (
      inventoryId: number,
      params?: MovementFilterParams
    ): Promise<ApiResponse<InventoryMovementListResponse>> => {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      if (params?.movement_type) query.append('movement_type', params.movement_type)
      if (params?.start_date) query.append('start_date', params.start_date)
      if (params?.end_date) query.append('end_date', params.end_date)
      const queryString = query.toString()
      return this.request(`/inventory/${inventoryId}/movements${queryString ? `?${queryString}` : ''}`)
    },
  }

  // Supplier endpoints
  suppliers = {
    list: async (
      companyId: number,
      params?: PaginationParams
    ): Promise<ApiResponse<PaginatedResponse<Supplier>>> => {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      const queryString = query.toString()
      return this.request(
        `/companies/${companyId}/suppliers${queryString ? `?${queryString}` : ''}`
      )
    },

    get: async (
      companyId: number,
      supplierId: number
    ): Promise<ApiResponse<Supplier>> => {
      return this.request(`/companies/${companyId}/suppliers/${supplierId}`)
    },

    create: async (
      companyId: number,
      data: CreateSupplierRequest
    ): Promise<ApiResponse<Supplier>> => {
      return this.request(`/companies/${companyId}/suppliers`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update: async (
      companyId: number,
      supplierId: number,
      data: UpdateSupplierRequest
    ): Promise<ApiResponse<Supplier>> => {
      return this.request(`/companies/${companyId}/suppliers/${supplierId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    delete: async (
      companyId: number,
      supplierId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(`/companies/${companyId}/suppliers/${supplierId}`, {
        method: 'DELETE',
      })
    },

    getProducts: async (
      companyId: number,
      supplierId: number
    ): Promise<ApiResponse<SupplierWithProducts>> => {
      return this.request(
        `/companies/${companyId}/suppliers/${supplierId}/products`
      )
    },

    // Supplier Bill endpoints
    bills: {
      list: async (
        companyId: number,
        supplierId: number,
        params?: PaginationParams
      ): Promise<ApiResponse<PaginatedResponse<SupplierBill>>> => {
        const query = new URLSearchParams()
        if (params?.page) query.append('page', params.page.toString())
        if (params?.limit) query.append('limit', params.limit.toString())
        const queryString = query.toString()
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/bills${queryString ? `?${queryString}` : ''}`
        )
      },

      get: async (
        companyId: number,
        supplierId: number,
        billId: number
      ): Promise<ApiResponse<SupplierBill>> => {
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/bills/${billId}`
        )
      },

      getById: async (
        companyId: number,
        billId: number
      ): Promise<ApiResponse<SupplierBill>> => {
        return this.request(
          `/companies/${companyId}/bills/${billId}`
        )
      },

      create: async (
        companyId: number,
        supplierId: number,
        data: CreateSupplierBillRequest
      ): Promise<ApiResponse<SupplierBill>> => {
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/bills`,
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        )
      },

      update: async (
        companyId: number,
        supplierId: number,
        billId: number,
        data: UpdateSupplierBillRequest
      ): Promise<ApiResponse<SupplierBill>> => {
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/bills/${billId}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        )
      },

      delete: async (
        companyId: number,
        supplierId: number,
        billId: number
      ): Promise<ApiResponse<null>> => {
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/bills/${billId}`,
          {
            method: 'DELETE',
          }
        )
      },

      addItem: async (
        companyId: number,
        supplierId: number,
        billId: number,
        data: SupplierBillItemRequest
      ): Promise<ApiResponse<SupplierBillItem>> => {
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/bills/${billId}/items`,
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        )
      },

      updateItem: async (
        companyId: number,
        supplierId: number,
        billId: number,
        itemId: number,
        data: SupplierBillItemRequest
      ): Promise<ApiResponse<SupplierBillItem>> => {
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/bills/${billId}/items/${itemId}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        )
      },

      removeItem: async (
        companyId: number,
        supplierId: number,
        billId: number,
        itemId: number
      ): Promise<ApiResponse<null>> => {
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/bills/${billId}/items/${itemId}`,
          {
            method: 'DELETE',
          }
        )
      },
    },

    // Supplier Payment endpoints
    payments: {
      record: async (
        companyId: number,
        supplierId: number,
        data: RecordSupplierPaymentRequest
      ): Promise<ApiResponse<SupplierPayment>> => {
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/payments`,
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        )
      },
    },

    // Outstanding Balance endpoint
    outstandingBalance: {
      get: async (
        companyId: number,
        supplierId: number
      ): Promise<ApiResponse<SupplierOutstandingBalance>> => {
        return this.request(
          `/companies/${companyId}/suppliers/${supplierId}/outstanding`
        )
      },
    },
  }

  // POS endpoints
  pos = {
    // Product search endpoints
    products: {
      search: async (
        companyId: number,
        query: string,
        franchiseId?: number,
        limit?: number
      ): Promise<ApiResponse<ProductVariantSearchResponse[]>> => {
        const queryParams = new URLSearchParams()
        queryParams.append('query', query)
        if (franchiseId) {
          queryParams.append('franchise_id', franchiseId.toString())
        }
        if (limit) {
          queryParams.append('limit', limit.toString())
        }
        return this.request(
          `/companies/${companyId}/pos/products/search?${queryParams.toString()}`
        )
      },
    },

    // Customer endpoints
    customers: {
      list: async (
        companyId: number,
        params?: PaginationParams
      ): Promise<ApiResponse<PaginatedResponse<Customer>>> => {
        const query = new URLSearchParams()
        if (params?.page) query.append('page', params.page.toString())
        if (params?.limit) query.append('limit', params.limit.toString())
        return this.request(
          `/companies/${companyId}/pos/customers?${query.toString()}`
        )
      },

      get: async (
        companyId: number,
        customerId: number
      ): Promise<ApiResponse<Customer>> => {
        return this.request(
          `/companies/${companyId}/pos/customers/${customerId}`
        )
      },

      create: async (
        companyId: number,
        data: CreateCustomerRequest
      ): Promise<ApiResponse<Customer>> => {
        return this.request(`/companies/${companyId}/pos/customers`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      update: async (
        companyId: number,
        customerId: number,
        data: UpdateCustomerRequest
      ): Promise<ApiResponse<Customer>> => {
        return this.request(
          `/companies/${companyId}/pos/customers/${customerId}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        )
      },

      delete: async (
        companyId: number,
        customerId: number
      ): Promise<ApiResponse<null>> => {
        return this.request(
          `/companies/${companyId}/pos/customers/${customerId}`,
          {
            method: 'DELETE',
          }
        )
      },
    },

    // Sale endpoints
    sales: {
      list: async (
        companyId: number,
        params?: PaginationParams & { franchise_id?: number }
      ): Promise<ApiResponse<PaginatedResponse<Sale>>> => {
        const query = new URLSearchParams()
        if (params?.page) query.append('page', params.page.toString())
        if (params?.limit) query.append('limit', params.limit.toString())
        if (params?.franchise_id)
          query.append('franchise_id', params.franchise_id.toString())
        return this.request(
          `/companies/${companyId}/pos/sales?${query.toString()}`
        )
      },

      get: async (
        companyId: number,
        saleId: number
      ): Promise<ApiResponse<Sale>> => {
        return this.request(`/companies/${companyId}/pos/sales/${saleId}`)
      },

      create: async (
        companyId: number,
        data: CreateSaleRequest
      ): Promise<ApiResponse<Sale>> => {
        return this.request(`/companies/${companyId}/pos/sales`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      addPayment: async (
        companyId: number,
        saleId: number,
        data: AddPaymentRequest
      ): Promise<ApiResponse<Payment>> => {
        return this.request(
          `/companies/${companyId}/pos/sales/${saleId}/payments`,
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        )
      },

      getReceipt: async (
        companyId: number,
        saleId: number
      ): Promise<Blob> => {
        const token = this.getAuthToken()
        const headers: HeadersInit = {}
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(
          `${API_URL}/companies/${companyId}/pos/sales/${saleId}/receipt`,
          {
            method: 'GET',
            headers,
          }
        )

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
            // Dispatch custom event instead of hard redirect
            window.dispatchEvent(new CustomEvent('auth:unauthorized'))
          }
          throw new Error('Failed to fetch receipt')
        }

        return response.blob()
      },

      processRefund: async (
        companyId: number,
        saleId: number,
        data: ProcessRefundRequest
      ): Promise<ApiResponse<Refund>> => {
        return this.request(
          `/companies/${companyId}/pos/sales/${saleId}/refund`,
          {
            method: 'POST',
            body: JSON.stringify(data),
          }
        )
      },

      listByFranchise: async (
        franchiseId: number,
        params?: PaginationParams
      ): Promise<ApiResponse<PaginatedResponse<Sale>>> => {
        const query = new URLSearchParams()
        if (params?.page) query.append('page', params.page.toString())
        if (params?.limit) query.append('limit', params.limit.toString())
        return this.request(
          `/franchises/${franchiseId}/pos/sales?${query.toString()}`
        )
      },
    },

    // Refund endpoints
    refunds: {
      list: async (
        companyId: number,
        params?: PaginationParams & { franchise_id?: number }
      ): Promise<ApiResponse<PaginatedResponse<Refund>>> => {
        const query = new URLSearchParams()
        if (params?.page) query.append('page', params.page.toString())
        if (params?.limit) query.append('limit', params.limit.toString())
        if (params?.franchise_id)
          query.append('franchise_id', params.franchise_id.toString())
        return this.request(
          `/companies/${companyId}/pos/refunds?${query.toString()}`
        )
      },

      listByFranchise: async (
        franchiseId: number,
        params?: PaginationParams
      ): Promise<ApiResponse<PaginatedResponse<Refund>>> => {
        const query = new URLSearchParams()
        if (params?.page) query.append('page', params.page.toString())
        if (params?.limit) query.append('limit', params.limit.toString())
        return this.request(
          `/franchises/${franchiseId}/pos/refunds?${query.toString()}`
        )
      },
    },

    // Cash Drawer endpoints
    cashDrawer: {
      open: async (
        companyId: number,
        data: OpenCashDrawerRequest
      ): Promise<ApiResponse<CashDrawer>> => {
        return this.request(`/companies/${companyId}/pos/cash-drawer/open`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      getActive: async (
        companyId: number,
        franchiseId?: number
      ): Promise<ApiResponse<CashDrawer>> => {
        const query = new URLSearchParams()
        if (franchiseId) query.append('franchise_id', franchiseId.toString())
        return this.request(
          `/companies/${companyId}/pos/cash-drawer/active?${query.toString()}`
        )
      },

      close: async (
        companyId: number,
        drawerId: number,
        data: CloseCashDrawerRequest
      ): Promise<ApiResponse<CashDrawer>> => {
        return this.request(
          `/companies/${companyId}/pos/cash-drawer/${drawerId}/close`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        )
      },

      list: async (
        companyId: number,
        params?: PaginationParams & { franchise_id?: number }
      ): Promise<ApiResponse<PaginatedResponse<CashDrawer>>> => {
        const query = new URLSearchParams()
        if (params?.page) query.append('page', params.page.toString())
        if (params?.limit) query.append('limit', params.limit.toString())
        if (params?.franchise_id)
          query.append('franchise_id', params.franchise_id.toString())
        return this.request(
          `/companies/${companyId}/pos/cash-drawer?${query.toString()}`
        )
      },

      getActiveFranchise: async (
        franchiseId: number
      ): Promise<ApiResponse<CashDrawer>> => {
        return this.request(
          `/franchises/${franchiseId}/pos/cash-drawer/active`
        )
      },

      listByFranchise: async (
        franchiseId: number,
        params?: PaginationParams
      ): Promise<ApiResponse<PaginatedResponse<CashDrawer>>> => {
        const query = new URLSearchParams()
        if (params?.page) query.append('page', params.page.toString())
        if (params?.limit) query.append('limit', params.limit.toString())
        return this.request(
          `/franchises/${franchiseId}/pos/cash-drawer?${query.toString()}`
        )
      },
    },

    // Reports endpoints
    reports: {
      sales: async (
        companyId: number,
        data: SalesReportRequest
      ): Promise<ApiResponse<SalesReport>> => {
        return this.request(`/companies/${companyId}/pos/reports/sales`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      salesByFranchise: async (
        franchiseId: number,
        data: SalesReportRequest
      ): Promise<ApiResponse<SalesReport>> => {
        return this.request(`/franchises/${franchiseId}/pos/reports/sales`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },
    },
  }

  // Warehouse Bill endpoints
  warehouseBills = {
    // Exit bills (company level)
    createExit: async (
      companyId: number,
      data: CreateExitBillRequest
    ): Promise<ApiResponse<WarehouseBill>> => {
      return this.request(`/companies/${companyId}/warehouse-bills/exit`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    searchProductsForExitBill: async (
      companyId: number,
      query: string,
      franchiseId: number,
      limit?: number
    ): Promise<ApiResponse<ProductVariantSearchResponse[]>> => {
      const queryParams = new URLSearchParams()
      queryParams.append('query', query)
      queryParams.append('franchise_id', franchiseId.toString())
      if (limit) {
        queryParams.append('limit', limit.toString())
      }
      return this.request(
        `/companies/${companyId}/warehouse-bills/search?${queryParams.toString()}`
      )
    },

    listByCompany: async (
      companyId: number,
      params?: PaginationParams & {
        franchise_id?: number
        status?: string
        bill_type?: string
        date_from?: string
        date_to?: string
      }
    ): Promise<ApiResponse<PaginatedResponse<WarehouseBill>>> => {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      if (params?.franchise_id) query.append('franchise_id', params.franchise_id.toString())
      if (params?.status) query.append('status', params.status)
      if (params?.bill_type) query.append('bill_type', params.bill_type)
      if (params?.date_from) query.append('date_from', params.date_from)
      if (params?.date_to) query.append('date_to', params.date_to)
      const queryString = query.toString()
      return this.request(
        `/companies/${companyId}/warehouse-bills${queryString ? `?${queryString}` : ''}`
      )
    },

    getByCompany: async (
      companyId: number,
      billId: number
    ): Promise<ApiResponse<WarehouseBill>> => {
      return this.request(`/companies/${companyId}/warehouse-bills/${billId}`)
    },

    completeExit: async (
      companyId: number,
      billId: number
    ): Promise<ApiResponse<WarehouseBill>> => {
      return this.request(
        `/companies/${companyId}/warehouse-bills/${billId}/complete`,
        {
          method: 'PUT',
        }
      )
    },

    cancel: async (
      companyId: number,
      billId: number
    ): Promise<ApiResponse<null>> => {
      return this.request(`/companies/${companyId}/warehouse-bills/${billId}`, {
        method: 'DELETE',
      })
    },

    updateExitBillItems: async (
      companyId: number,
      billId: number,
      data: UpdateExitBillItemsRequest
    ): Promise<ApiResponse<WarehouseBill>> => {
      return this.request(
        `/companies/${companyId}/warehouse-bills/${billId}/items`,
        {
          method: 'PUT',
          body: JSON.stringify(data),
        }
      )
    },

    // Entry bills (franchise level)
    createEntry: async (
      franchiseId: number,
      data: CreateEntryBillRequest
    ): Promise<ApiResponse<WarehouseBill>> => {
      return this.request(`/franchises/${franchiseId}/warehouse-bills/entry`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    listByFranchise: async (
      franchiseId: number,
      params?: PaginationParams
    ): Promise<ApiResponse<PaginatedResponse<WarehouseBill>>> => {
      const query = new URLSearchParams()
      if (params?.page) query.append('page', params.page.toString())
      if (params?.limit) query.append('limit', params.limit.toString())
      const queryString = query.toString()
      return this.request(
        `/franchises/${franchiseId}/warehouse-bills${queryString ? `?${queryString}` : ''}`
      )
    },

    getByFranchise: async (
      franchiseId: number,
      billId: number
    ): Promise<ApiResponse<WarehouseBill>> => {
      return this.request(`/franchises/${franchiseId}/warehouse-bills/${billId}`)
    },

    verifyEntry: async (
      franchiseId: number,
      billId: number,
      data: VerifyEntryBillRequest
    ): Promise<ApiResponse<WarehouseBill>> => {
      return this.request(
        `/franchises/${franchiseId}/warehouse-bills/${billId}/verify`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
    },

    completeEntry: async (
      franchiseId: number,
      billId: number
    ): Promise<ApiResponse<WarehouseBill>> => {
      return this.request(
        `/franchises/${franchiseId}/warehouse-bills/${billId}/complete`,
        {
          method: 'PUT',
        }
      )
    },
  }

  // Order endpoints
  orders = {
    list: async (
      companyId: number,
      filters?: OrderFilters
    ): Promise<ApiResponse<ListOrdersResponse>> => {
      const query = new URLSearchParams()
      if (filters?.status) query.append('status', filters.status)
      if (filters?.source) query.append('source', filters.source)
      if (filters?.date_from) query.append('date_from', filters.date_from)
      if (filters?.date_to) query.append('date_to', filters.date_to)
      if (filters?.page) query.append('page', filters.page.toString())
      if (filters?.limit) query.append('limit', filters.limit.toString())
      const queryString = query.toString()
      return this.request(
        `/companies/${companyId}/orders${queryString ? `?${queryString}` : ''}`
      )
    },

    getStatusCounts: async (
      companyId: number
    ): Promise<ApiResponse<Record<string, number>>> => {
      return this.request(`/companies/${companyId}/orders/status-counts`)
    },

    get: async (
      companyId: number,
      orderId: number
    ): Promise<ApiResponse<Order>> => {
      return this.request(`/companies/${companyId}/orders/${orderId}`)
    },

    create: async (
      companyId: number,
      data: CreateOrderRequest
    ): Promise<ApiResponse<Order>> => {
      return this.request(`/companies/${companyId}/orders`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    update: async (
      companyId: number,
      orderId: number,
      data: UpdateOrderRequest
    ): Promise<ApiResponse<Order>> => {
      return this.request(`/companies/${companyId}/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    updateStatus: async (
      companyId: number,
      orderId: number,
      data: UpdateOrderStatusRequest
    ): Promise<ApiResponse<Order>> => {
      return this.request(`/companies/${companyId}/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify(data),
      })
    },

    confirm: async (
      companyId: number,
      orderId: number,
      data: ConfirmOrderRequest
    ): Promise<ApiResponse<Order>> => {
      return this.request(`/companies/${companyId}/orders/${orderId}/confirm`, {
        method: 'POST',
        body: JSON.stringify(data),
      })
    },

    cancel: async (
      companyId: number,
      orderId: number
    ): Promise<ApiResponse<Order>> => {
      return this.request(`/companies/${companyId}/orders/${orderId}/cancel`, {
        method: 'POST',
      })
    },

    relaunch: async (
      companyId: number,
      orderId: number
    ): Promise<ApiResponse<Order>> => {
      return this.request(`/companies/${companyId}/orders/${orderId}/relaunch`, {
        method: 'POST',
      })
    },

    getDeliveryFee: async (
      companyId: number,
      params: { provider: string; commune_id?: number; center_id?: number; from_wilaya_id?: number }
    ): Promise<ApiResponse<{ fee: number; currency: string }>> => {
      const query = new URLSearchParams()
      query.append('provider', params.provider)
      if (params.commune_id) {
        query.append('commune_id', params.commune_id.toString())
      }
      if (params.center_id) {
        query.append('center_id', params.center_id.toString())
      }
      if (params.from_wilaya_id) {
        query.append('from_wilaya_id', params.from_wilaya_id.toString())
      }
      return this.request(`/companies/${companyId}/orders/delivery-fee?${query.toString()}`)
    },

    // Client Status endpoints
    addClientStatus: async (
      companyId: number,
      orderId: number,
      data: CreateClientStatusRequest
    ): Promise<ApiResponse<ClientStatus>> => {
      return this.request(
        `/companies/${companyId}/orders/${orderId}/client-status`,
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      )
    },

    listClientStatuses: async (
      companyId: number,
      orderId: number
    ): Promise<ApiResponse<ClientStatus[]>> => {
      return this.request(
        `/companies/${companyId}/orders/${orderId}/client-status`
      )
    },

    // Qualification endpoints
    qualifications: {
      list: async (
        companyId: number
      ): Promise<ApiResponse<Qualification[]>> => {
        return this.request(`/companies/${companyId}/qualifications`)
      },

      create: async (
        companyId: number,
        data: CreateQualificationRequest
      ): Promise<ApiResponse<Qualification>> => {
        return this.request(`/companies/${companyId}/qualifications`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      update: async (
        companyId: number,
        qualificationId: number,
        data: UpdateQualificationRequest
      ): Promise<ApiResponse<Qualification>> => {
        return this.request(
          `/companies/${companyId}/qualifications/${qualificationId}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        )
      },

      delete: async (
        companyId: number,
        qualificationId: number
      ): Promise<ApiResponse<null>> => {
        return this.request(
          `/companies/${companyId}/qualifications/${qualificationId}`,
          {
            method: 'DELETE',
          }
        )
      },
    },

    // Webhook Config endpoints
    shopifyWebhookConfigs: {
      list: async (
        companyId: number
      ): Promise<ApiResponse<ShopifyWebhookConfig[]>> => {
        return this.request(`/companies/${companyId}/webhooks/shopify`)
      },

      create: async (
        companyId: number,
        data: CreateShopifyWebhookConfigRequest
      ): Promise<ApiResponse<ShopifyWebhookConfig>> => {
        return this.request(`/companies/${companyId}/webhooks/shopify`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      get: async (
        companyId: number,
        configId: number
      ): Promise<ApiResponse<ShopifyWebhookConfig>> => {
        return this.request(
          `/companies/${companyId}/webhooks/shopify/${configId}`
        )
      },

      update: async (
        companyId: number,
        configId: number,
        data: UpdateShopifyWebhookConfigRequest
      ): Promise<ApiResponse<ShopifyWebhookConfig>> => {
        return this.request(
          `/companies/${companyId}/webhooks/shopify/${configId}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        )
      },

      delete: async (
        companyId: number,
        configId: number
      ): Promise<ApiResponse<null>> => {
        return this.request(
          `/companies/${companyId}/webhooks/shopify/${configId}`,
          {
            method: 'DELETE',
          }
        )
      },
    },

    woocommerceWebhookConfigs: {
      list: async (
        companyId: number
      ): Promise<ApiResponse<WooCommerceWebhookConfig[]>> => {
        return this.request(`/companies/${companyId}/webhooks/woocommerce`)
      },

      create: async (
        companyId: number,
        data: CreateWooCommerceWebhookConfigRequest
      ): Promise<ApiResponse<WooCommerceWebhookConfig>> => {
        return this.request(`/companies/${companyId}/webhooks/woocommerce`, {
          method: 'POST',
          body: JSON.stringify(data),
        })
      },

      get: async (
        companyId: number,
        configId: number
      ): Promise<ApiResponse<WooCommerceWebhookConfig>> => {
        return this.request(
          `/companies/${companyId}/webhooks/woocommerce/${configId}`
        )
      },

      update: async (
        companyId: number,
        configId: number,
        data: UpdateWooCommerceWebhookConfigRequest
      ): Promise<ApiResponse<WooCommerceWebhookConfig>> => {
        return this.request(
          `/companies/${companyId}/webhooks/woocommerce/${configId}`,
          {
            method: 'PUT',
            body: JSON.stringify(data),
          }
        )
      },

      delete: async (
        companyId: number,
        configId: number
      ): Promise<ApiResponse<null>> => {
        return this.request(
          `/companies/${companyId}/webhooks/woocommerce/${configId}`,
          {
            method: 'DELETE',
          }
        )
      },
    },
  }
}

// Helper function to extract permission from error message
function extractPermissionFromMessage(message?: string): string | null {
  if (!message) return null
  
  // Try to extract permission patterns like "permission: companies.create" or "requires companies.create"
  const permissionPatterns = [
    /permission[:\s]+([a-z_]+\.[a-z_]+)/i,
    /requires[:\s]+([a-z_]+\.[a-z_]+)/i,
    /missing[:\s]+([a-z_]+\.[a-z_]+)/i,
  ]
  
  for (const pattern of permissionPatterns) {
    const match = message.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

export const apiClient = new ApiClient()



