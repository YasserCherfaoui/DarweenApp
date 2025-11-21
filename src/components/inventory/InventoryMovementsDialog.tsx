import { SaleDetailsDialog } from "@/components/pos/SaleDetailsDialog";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useInventoryMovements } from "@/hooks/queries/use-inventory";
import { apiClient } from "@/lib/api-client";
import type { Inventory, InventoryMovement } from "@/types/api";
import { useNavigate } from "@tanstack/react-router";
import {
  ArrowDown,
  ArrowRightLeft,
  ArrowUp,
  ExternalLink,
  Lock,
  Package,
  Receipt,
  RotateCcw,
  Settings,
  ShoppingCart,
  Unlock,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";

interface InventoryMovementsDialogProps {
  inventory: Inventory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const movementTypeConfig = {
  adjustment: {
    label: "Adjustment",
    icon: Settings,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  in: {
    label: "Stock In",
    icon: ArrowUp,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  out: {
    label: "Stock Out",
    icon: ArrowDown,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  reserve: {
    label: "Reserved",
    icon: Lock,
    color:
      "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  },
  release: {
    label: "Released",
    icon: Unlock,
    color:
      "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  },
  sale: {
    label: "Sale",
    icon: ShoppingCart,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  return: {
    label: "Return",
    icon: RotateCcw,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  purchase: {
    label: "Purchase",
    icon: Package,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  supplier_bill: {
    label: "Supplier Bill",
    icon: Receipt,
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  },
  supplier_bill_update: {
    label: "Bill Update",
    icon: Receipt,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
  supplier_bill_delete: {
    label: "Bill Deletion",
    icon: Receipt,
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  },
  transfer: {
    label: "Transfer",
    icon: ArrowRightLeft,
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  },
};

export function InventoryMovementsDialog({
  inventory,
  open,
  onOpenChange,
}: InventoryMovementsDialogProps) {
  const navigate = useNavigate();
  const [saleDetailsDialogOpen, setSaleDetailsDialogOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState<number | null>(null);

  const { data: movementsData, isLoading } = useInventoryMovements(
    inventory?.id || 0,
    { page: 1, limit: 3 }
  );

  const movements = movementsData?.movements || [];

  const handleMovementClick = async (movement: InventoryMovement) => {
    if (
      !movement.reference_type ||
      !movement.reference_id ||
      !inventory?.company_id
    ) {
      return;
    }

    if (movement.reference_type === "sale") {
      const saleId = parseInt(movement.reference_id, 10);
      if (!isNaN(saleId)) {
        setSelectedSaleId(saleId);
        setSaleDetailsDialogOpen(true);
      }
    } else if (
      movement.reference_type === "supplier_bill" ||
      movement.reference_type === "supplier_bill_update" ||
      movement.reference_type === "supplier_bill_delete"
    ) {
      const billId = parseInt(movement.reference_id, 10);
      if (!isNaN(billId) && inventory?.product_variant_id) {
        try {
          // Fetch the bill to get supplier ID and find matching item
          const billResponse = await apiClient.suppliers.bills.getById(
            inventory.company_id,
            billId
          );
          const bill = billResponse.data;

          if (!bill || !bill.supplier_id) {
            return;
          }

          // Find the item that matches this product variant
          const matchingItem = bill.items?.find(
            (item) => item.product_variant_id === inventory.product_variant_id
          );

          // Close the inventory movements dialog
          onOpenChange(false);
          
          // Navigate to the bill details page with highlighted item
          navigate({
            to: '/companies/$companyId/suppliers/$supplierId/bills/$billId',
            params: {
              companyId: inventory.company_id.toString(),
              supplierId: bill.supplier_id.toString(),
              billId: billId.toString(),
            },
            search: { highlightedItemId: matchingItem?.id },
          });
        } catch (error) {
          console.error("Failed to fetch supplier bill:", error);
        }
      }
    } else if (movement.reference_type === "warehouse_bill") {
      const billId = parseInt(movement.reference_id, 10);
      if (!isNaN(billId) && inventory?.product_variant_id) {
        try {
          // Fetch the warehouse bill to find matching item
          const billResponse = await apiClient.warehouseBills.getByCompany(
            inventory.company_id,
            billId
          );
          const bill = billResponse.data;

          if (!bill) {
            return;
          }

          // Find the item that matches this product variant
          const matchingItem = bill.items?.find(
            (item) => item.product_variant_id === inventory.product_variant_id
          );

          // Close the inventory movements dialog
          onOpenChange(false);
          
          // Navigate to the warehouse bill details page with highlighted item
          navigate({
            to: '/companies/$companyId/warehouse-bills/$billId',
            params: {
              companyId: inventory.company_id.toString(),
              billId: billId.toString(),
            },
            search: { highlightedItemId: matchingItem?.id },
          });
        } catch (error) {
          console.error("Failed to fetch warehouse bill:", error);
        }
      }
    }
  };

  const isClickable = (movement: InventoryMovement) => {
    if (
      !movement.reference_type ||
      !movement.reference_id ||
      !inventory?.company_id
    ) {
      return false;
    }
    return (
      movement.reference_type === "sale" ||
      movement.reference_type === "supplier_bill" ||
      movement.reference_type === "supplier_bill_update" ||
      movement.reference_type === "supplier_bill_delete" ||
      movement.reference_type === "warehouse_bill"
    );
  };

  const handleViewFullHistory = () => {
    if (!inventory?.id || !inventory?.company_id) return;

    // Close the dialog
    onOpenChange(false);

    // Navigate to appropriate history page based on franchise_id
    if (inventory.franchise_id) {
      navigate({
        to: "/companies/$companyId/franchises/$franchiseId/inventory/$inventoryId/history",
        params: {
          companyId: inventory.company_id.toString(),
          franchiseId: inventory.franchise_id.toString(),
          inventoryId: inventory.id.toString(),
        },
      });
    } else {
      navigate({
        to: "/companies/$companyId/inventory/$inventoryId/history",
        params: {
          companyId: inventory.company_id.toString(),
          inventoryId: inventory.id.toString(),
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0">
          <DialogTitle>Inventory Movement History</DialogTitle>
          <DialogDescription>
            Stock movement history for{" "}
            {inventory?.variant_name || "this variant"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg shrink-0">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Stock
              </p>
              <p className="text-lg font-semibold">{inventory?.stock || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reserved
              </p>
              <p className="text-lg font-semibold text-orange-600">
                {inventory?.reserved_stock || 0}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Available
              </p>
              <p className="text-lg font-semibold text-green-600">
                {inventory?.available_stock || 0}
              </p>
            </div>
          </div>

          <div className="space-y-2 flex-1 min-h-0 flex flex-col">
            <h4 className="text-sm font-semibold shrink-0">
              Movement Timeline
            </h4>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 min-h-0">
              {isLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 border rounded-lg"
                    >
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-48" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  ))}
                </>
              ) : !movements || movements.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No movements recorded yet
                </div>
              ) : (
                movements.map((movement) => {
                  const movementType =
                    movement.movement_type.toLowerCase() as keyof typeof movementTypeConfig;
                  const config =
                    movementTypeConfig[movementType] ||
                    movementTypeConfig.adjustment;
                  const Icon = config.icon;

                  const clickable = isClickable(movement);

                  return (
                    <div
                      key={movement.id}
                      onClick={() => handleMovementClick(movement)}
                      className={`flex items-start gap-3 p-3 border rounded-lg transition-colors ${
                        clickable
                          ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700"
                          : "hover:bg-gray-50 dark:hover:bg-gray-900"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center h-10 w-10 rounded-full ${config.color}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <Badge variant="outline" className={config.color}>
                            {config.label}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(movement.created_at).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">
                            Quantity: {movement.quantity > 0 ? "+" : ""}
                            {movement.quantity}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({movement.previous_stock} → {movement.new_stock})
                          </span>
                        </div>
                        {movement.reference_type && (
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Reference:{" "}
                            {movement.reference_type.replace("_", " ")}
                            {movement.reference_id &&
                              ` - ${movement.reference_id}`}
                            {clickable && (
                              <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium cursor-pointer hover:underline">
                                (Click to view details)
                              </span>
                            )}
                          </div>
                        )}
                        {movement.notes && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {movement.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          {movements && movements.length > 0 && (
            <div className="flex flex-col items-center gap-3 pt-4 border-t w-full">
              <div className="text-xs text-gray-500 text-center">
                Showing last 3 movements
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewFullHistory}
                className="w-full"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Full History
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Sale Details Dialog */}
      {selectedSaleId && inventory?.company_id && (
        <SaleDetailsDialog
          companyId={inventory.company_id}
          saleId={selectedSaleId}
          open={saleDetailsDialogOpen}
          onOpenChange={setSaleDetailsDialogOpen}
        />
      )}

    </Dialog>
  );
}
