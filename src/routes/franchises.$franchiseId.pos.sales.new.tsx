import { createRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { ProductSearch } from '@/components/pos/ProductSearch'
import { Cart } from '@/components/pos/Cart'
import { CustomerSelector } from '@/components/pos/CustomerSelector'
import { PaymentDialog } from '@/components/pos/PaymentDialog'
import { PrintTicketDialog } from '@/components/pos/PrintTicketDialog'
import { ReceiptPreview } from '@/components/pos/ReceiptPreview'
import { apiClient } from '@/lib/api-client'
import { useCreateSale, useAddPayment } from '@/hooks/queries/use-pos-queries'
import { useFranchise } from '@/hooks/queries/use-franchises'
import { ArrowLeft, ShoppingCart } from 'lucide-react'
import type { Customer, ProductVariant, Product, SaleItemRequest, Sale } from '@/types/api'
import { useToast } from '@/hooks/use-toast'
import { rootRoute } from '@/main'

interface CartItem extends SaleItemRequest {
  name: string
  sku: string
}

export const FranchiseNewSaleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/franchises/$franchiseId/pos/sales/new',
  component: FranchiseNewSalePage,
})

function FranchiseNewSalePage() {
  const { franchiseId } = FranchiseNewSaleRoute.useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>()
  const [notes, setNotes] = useState('')
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [printTicketDialogOpen, setPrintTicketDialogOpen] = useState(false)
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false)
  const [completedSale, setCompletedSale] = useState<Sale | undefined>()

  const { data: franchiseData } = useFranchise(Number(franchiseId))
  const franchise = franchiseData
  const companyId = franchise?.parent_company_id
  
  const createSale = useCreateSale()
  const addPayment = useAddPayment()

  const handleAddToCart = (variant: ProductVariant & { product?: Product }, quantity: number) => {
    // For franchise, use franchise pricing if available, otherwise use variant/product pricing
    const price = variant.retail_price || variant.product?.base_retail_price || 0
    const existingIndex = cartItems.findIndex((item) => item.product_variant_id === variant.id)

    if (existingIndex >= 0) {
      const newItems = [...cartItems]
      newItems[existingIndex].quantity += quantity
      setCartItems(newItems)
    } else {
      setCartItems([
        ...cartItems,
        {
          product_variant_id: variant.id,
          quantity,
          unit_price: price,
          discount_amount: 0,
          name: `${variant.product?.name} - ${variant.name}`,
          sku: variant.sku,
        },
      ])
    }

    toast({
      title: 'Added to cart',
      description: `${variant.name} added to cart`,
    })
  }

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const newItems = [...cartItems]
    newItems[index].quantity = quantity
    setCartItems(newItems)
  }

  const handleRemoveItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index))
  }

  const handleUpdateDiscount = (index: number, discount: number) => {
    const newItems = [...cartItems]
    newItems[index].discount_amount = discount
    setCartItems(newItems)
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price - (item.discount_amount || 0),
    0
  )

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Please add items to cart before checkout',
        variant: 'destructive',
      })
      return
    }
    setPaymentDialogOpen(true)
  }

  const handlePrintReceipt = async () => {
    if (!completedSale || !companyId) return

    try {
      const blob = await apiClient.pos.sales.getReceipt(companyId, completedSale.id)
      const url = window.URL.createObjectURL(blob)
      const printWindow = window.open(url, '_blank')
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
          setTimeout(() => {
            window.URL.revokeObjectURL(url)
            printWindow.close()
          }, 1000)
        }
      } else {
        const link = document.createElement('a')
        link.href = url
        link.download = `receipt_${completedSale.receipt_number}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      }
      
      setPrintTicketDialogOpen(false)
      setCartItems([])
      setSelectedCustomer(undefined)
      setNotes('')
      setCompletedSale(undefined)
    } catch (error: any) {
      toast({
        title: 'Failed to print receipt',
        description: error.message || 'Failed to fetch receipt PDF',
        variant: 'destructive',
      })
    }
  }

  const handleSkipPrint = () => {
    setPrintTicketDialogOpen(false)
    setCartItems([])
    setSelectedCustomer(undefined)
    setNotes('')
    setCompletedSale(undefined)
  }

  const handlePayment = (paymentData: any) => {
    if (!companyId) {
      toast({
        title: 'Error',
        description: 'Company ID is not available',
        variant: 'destructive',
      })
      return
    }
    createSale.mutate(
      {
        companyId,
        data: {
          franchise_id: Number(franchiseId),
          customer_id: selectedCustomer?.id,
          items: cartItems.map(({ name, sku, ...item }) => item),
          notes,
        },
      },
      {
        onSuccess: (sale) => {
          if (!sale) {
            toast({
              title: 'Sale created',
              description: 'Sale created but could not retrieve details',
              variant: 'destructive',
            })
            setPaymentDialogOpen(false)
            return
          }

          toast({
            title: 'Sale created successfully',
            description: `Sale #${sale.receipt_number} has been created`,
          })

          setPaymentDialogOpen(false)
          setCompletedSale(sale)

          addPayment.mutate(
            {
              companyId,
              saleId: sale.id,
              data: paymentData,
            },
            {
              onSuccess: () => {
                toast({
                  title: 'Payment processed',
                  description: 'Payment has been added to the sale',
                })
                setPrintTicketDialogOpen(true)
              },
              onError: (error: any) => {
                toast({
                  title: 'Payment failed',
                  description: error.message || 'Failed to process payment. Sale was created but payment needs to be added later.',
                  variant: 'destructive',
                })
                setPrintTicketDialogOpen(true)
              },
            }
          )
        },
        onError: (error: any) => {
          toast({
            title: 'Sale failed',
            description: error.message || 'Failed to create sale',
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate({ to: '/franchises/$franchiseId/pos', params: { franchiseId } })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Sale</h1>
          <p className="text-muted-foreground">Create a new sales transaction</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Product Search and Customer */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search Products</CardTitle>
            </CardHeader>
            <CardContent>
              {companyId ? (
                <ProductSearch
                  companyId={companyId}
                  franchiseId={Number(franchiseId)}
                  onAddToCart={handleAddToCart}
                />
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Loading franchise data...
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer & Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {companyId ? (
                <CustomerSelector
                  companyId={companyId}
                  selectedCustomer={selectedCustomer}
                  onSelectCustomer={setSelectedCustomer}
                />
              ) : (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Loading franchise data...
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Sale Notes (Optional)</label>
                <Textarea
                  placeholder="Add any notes about this sale..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Cart */}
        <div className="space-y-6">
          <Cart
            items={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onUpdateDiscount={handleUpdateDiscount}
          />

          <Button
            className="w-full"
            size="lg"
            onClick={handleCheckout}
            disabled={cartItems.length === 0 || createSale.isPending || addPayment.isPending}
          >
            <ShoppingCart className="h-5 w-5 mr-2" />
            Checkout (${subtotal.toFixed(2)})
          </Button>
        </div>
      </div>

      {/* Payment Dialog */}
      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        totalAmount={subtotal}
        onSubmit={handlePayment}
        isLoading={createSale.isPending || addPayment.isPending}
      />

      {/* Print Ticket Dialog */}
      <PrintTicketDialog
        open={printTicketDialogOpen}
        onOpenChange={setPrintTicketDialogOpen}
        onPrint={handlePrintReceipt}
        onSkip={handleSkipPrint}
      />

      {/* Receipt Preview */}
      {completedSale && (
        <ReceiptPreview
          open={receiptDialogOpen}
          onOpenChange={(open) => {
            setReceiptDialogOpen(open)
            if (!open) {
              navigate({ to: '/franchises/$franchiseId/pos', params: { franchiseId } })
            }
          }}
          sale={completedSale}
          companyName={franchise?.name || 'Franchise'}
        />
      )}
      </div>
    </RoleBasedLayout>
  )
}

