import { createRoute, useNavigate } from '@tanstack/react-router'
import React, { useEffect, useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCompany } from '@/hooks/queries/use-companies'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { ArrowLeft, Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import { rootRoute } from '@/main'
import type { ParsedProduct, ParsedVariant } from '@/lib/csv-parser'
import { apiClient } from '@/lib/api-client'
import { useMutation } from '@tanstack/react-query'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'

export const BulkImportPreviewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/products/bulk-import/preview',
  component: BulkImportPreviewPage,
})

function BulkImportPreviewPage() {
  const navigate = useNavigate()
  const { companyId } = BulkImportPreviewRoute.useParams()
  const { data: company } = useCompany(Number(companyId))
  const { selectCompany } = useSelectedCompany()
  const [products, setProducts] = useState<ParsedProduct[]>([])
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set())
  const [validationErrors, setValidationErrors] = useState<Map<string, string>>(new Map())

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  // Load data from sessionStorage
  useEffect(() => {
    const data = sessionStorage.getItem('bulkImportData')
    if (data) {
      try {
        const parsed = JSON.parse(data) as ParsedProduct[]
        setProducts(parsed)
        // Expand all products by default
        setExpandedProducts(new Set(parsed.map(p => p.sku)))
      } catch (error) {
        navigate({ to: `/companies/${companyId}/products/bulk-import` })
      }
    } else {
      navigate({ to: `/companies/${companyId}/products/bulk-import` })
    }
  }, [companyId, navigate])

  const toggleProduct = (sku: string) => {
    const newExpanded = new Set(expandedProducts)
    if (newExpanded.has(sku)) {
      newExpanded.delete(sku)
    } else {
      newExpanded.add(sku)
    }
    setExpandedProducts(newExpanded)
  }

  const updateProduct = (sku: string, field: keyof ParsedProduct, value: any) => {
    setProducts(prev =>
      prev.map(p =>
        p.sku === sku ? { ...p, [field]: value } : p
      )
    )
    // Clear validation error for this field
    const errorKey = `${sku}-${field}`
    setValidationErrors(prev => {
      const next = new Map(prev)
      next.delete(errorKey)
      return next
    })
  }

  const updateVariant = (productSku: string, variantSku: string, field: keyof ParsedVariant, value: any) => {
    setProducts(prev =>
      prev.map(p =>
        p.sku === productSku
          ? {
              ...p,
              variants: p.variants.map(v =>
                v.sku === variantSku ? { ...v, [field]: value } : v
              ),
            }
          : p
      )
    )
    // Clear validation error
    const errorKey = `${productSku}-${variantSku}-${field}`
    setValidationErrors(prev => {
      const next = new Map(prev)
      next.delete(errorKey)
      return next
    })
  }

  const validateData = (): boolean => {
    const errors = new Map<string, string>()

    products.forEach(product => {
      if (!product.name.trim()) {
        errors.set(`${product.sku}-name`, 'Product name is required')
      }
      if (!product.sku.trim()) {
        errors.set(`${product.sku}-sku`, 'Product SKU is required')
      }
      if (product.base_retail_price < 0) {
        errors.set(`${product.sku}-base_retail_price`, 'Price must be >= 0')
      }
      if (product.base_wholesale_price < 0) {
        errors.set(`${product.sku}-base_wholesale_price`, 'Price must be >= 0')
      }
      if (product.variants.length === 0) {
        errors.set(`${product.sku}-variants`, 'Product must have at least one variant')
      }

      product.variants.forEach(variant => {
        if (!variant.name.trim()) {
          errors.set(`${product.sku}-${variant.sku}-name`, 'Variant name is required')
        }
        if (!variant.sku.trim()) {
          errors.set(`${product.sku}-${variant.sku}-sku`, 'Variant SKU is required')
        }
        if (variant.retail_price !== undefined && variant.retail_price < 0) {
          errors.set(`${product.sku}-${variant.sku}-retail_price`, 'Price must be >= 0')
        }
        if (variant.wholesale_price !== undefined && variant.wholesale_price < 0) {
          errors.set(`${product.sku}-${variant.sku}-wholesale_price`, 'Price must be >= 0')
        }
      })
    })

    setValidationErrors(errors)
    return errors.size === 0
  }

  const bulkCreateMutation = useMutation({
    mutationFn: async (file: File) => {
      return apiClient.products.bulkCreate(Number(companyId), file)
    },
    onSuccess: (data) => {
      if (data.success) {
        // Clear session storage
        sessionStorage.removeItem('bulkImportData')
        navigate({
          to: `/companies/${companyId}/products`,
          search: { success: 'bulk-import' },
        })
      }
    },
  })

  const handleApply = async () => {
    if (!validateData()) {
      return
    }

    // Convert products back to CSV format and create a File
    const csvLines: string[] = []
    
    // Header
    csvLines.push('name,description,sku,base_retail_price,base_wholesale_price,supplier_id,supplier_cost,variant_name,variant_sku,retail_price,wholesale_price,color,size')
    
    // Data rows
    products.forEach(product => {
      product.variants.forEach(variant => {
        const attributes = variant.attributes || {}
        const color = attributes.color || ''
        const size = attributes.size || ''
        
        csvLines.push([
          `"${product.name}"`,
          `"${product.description || ''}"`,
          product.sku,
          product.base_retail_price.toFixed(2),
          product.base_wholesale_price.toFixed(2),
          product.supplier_id || '',
          product.supplier_cost?.toFixed(2) || '',
          `"${variant.name}"`,
          variant.sku,
          variant.retail_price?.toFixed(2) || '',
          variant.wholesale_price?.toFixed(2) || '',
          color,
          size,
        ].join(','))
      })
    })

    const csvContent = csvLines.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const file = new File([blob], 'products.csv', { type: 'text/csv' })

    await bulkCreateMutation.mutateAsync(file)
  }

  const hasErrors = validationErrors.size > 0
  const totalVariants = products.reduce((sum, p) => sum + p.variants.length, 0)

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/products/bulk-import` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Upload
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Review Products
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Review and edit products before creating them. {products.length} product(s) with {totalVariants} variant(s)
            </p>
          </div>
        </div>

        {bulkCreateMutation.isError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {bulkCreateMutation.error instanceof Error
                ? bulkCreateMutation.error.message
                : 'Failed to create products'}
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Products Preview</CardTitle>
            <CardDescription>
              Click on a product to expand and view its variants. You can edit values directly in the table.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Retail Price</TableHead>
                    <TableHead>Wholesale Price</TableHead>
                    <TableHead>Variants</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const isExpanded = expandedProducts.has(product.sku)
                    const productErrors = Array.from(validationErrors.entries()).filter(([key]) =>
                      key.startsWith(`${product.sku}-`)
                    )

                    return (
                      <React.Fragment key={product.sku}>
                        <TableRow
                          className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                          onClick={() => toggleProduct(product.sku)}
                        >
                          <TableCell>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.name}
                              onChange={(e) => updateProduct(product.sku, 'name', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className={validationErrors.has(`${product.sku}-name`) ? 'border-red-500' : ''}
                            />
                            {validationErrors.has(`${product.sku}-name`) && (
                              <p className="text-xs text-red-500 mt-1">
                                {validationErrors.get(`${product.sku}-name`)}
                              </p>
                            )}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.sku}
                              onChange={(e) => updateProduct(product.sku, 'sku', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className={validationErrors.has(`${product.sku}-sku`) ? 'border-red-500' : ''}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={product.description}
                              onChange={(e) => updateProduct(product.sku, 'description', e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={product.base_retail_price}
                              onChange={(e) =>
                                updateProduct(product.sku, 'base_retail_price', parseFloat(e.target.value) || 0)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className={validationErrors.has(`${product.sku}-base_retail_price`) ? 'border-red-500' : ''}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              value={product.base_wholesale_price}
                              onChange={(e) =>
                                updateProduct(product.sku, 'base_wholesale_price', parseFloat(e.target.value) || 0)
                              }
                              onClick={(e) => e.stopPropagation()}
                              className={validationErrors.has(`${product.sku}-base_wholesale_price`) ? 'border-red-500' : ''}
                            />
                          </TableCell>
                          <TableCell>{product.variants.length}</TableCell>
                        </TableRow>
                        {isExpanded && (
                          <>
                            {product.variants.map((variant) => (
                              <TableRow key={variant.sku} className="bg-gray-50 dark:bg-gray-900">
                                <TableCell></TableCell>
                                <TableCell colSpan={2}>
                                  <div className="pl-8">
                                    <Input
                                      value={variant.name}
                                      onChange={(e) =>
                                        updateVariant(product.sku, variant.sku, 'name', e.target.value)
                                      }
                                      placeholder="Variant name"
                                      className={validationErrors.has(`${product.sku}-${variant.sku}-name`) ? 'border-red-500' : ''}
                                    />
                                    {validationErrors.has(`${product.sku}-${variant.sku}-name`) && (
                                      <p className="text-xs text-red-500 mt-1">
                                        {validationErrors.get(`${product.sku}-${variant.sku}-name`)}
                                      </p>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Input
                                    value={variant.sku}
                                    onChange={(e) =>
                                      updateVariant(product.sku, variant.sku, 'sku', e.target.value)
                                    }
                                    placeholder="Variant SKU"
                                    className={validationErrors.has(`${product.sku}-${variant.sku}-sku`) ? 'border-red-500' : ''}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={variant.retail_price || ''}
                                    onChange={(e) =>
                                      updateVariant(
                                        product.sku,
                                        variant.sku,
                                        'retail_price',
                                        e.target.value ? parseFloat(e.target.value) : undefined
                                      )
                                    }
                                    placeholder="Inherit from product"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={variant.wholesale_price || ''}
                                    onChange={(e) =>
                                      updateVariant(
                                        product.sku,
                                        variant.sku,
                                        'wholesale_price',
                                        e.target.value ? parseFloat(e.target.value) : undefined
                                      )
                                    }
                                    placeholder="Inherit from product"
                                  />
                                </TableCell>
                                <TableCell>
                                  {Object.entries(variant.attributes || {}).map(([key, value]) => (
                                    <span key={key} className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded mr-1">
                                      {key}: {value}
                                    </span>
                                  ))}
                                </TableCell>
                              </TableRow>
                            ))}
                          </>
                        )}
                      </React.Fragment>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {hasErrors && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Please fix all validation errors before applying changes.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <Button
                variant="outline"
                onClick={() => navigate({ to: `/companies/${companyId}/products/bulk-import` })}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApply}
                disabled={hasErrors || bulkCreateMutation.isPending}
              >
                {bulkCreateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Apply Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}

