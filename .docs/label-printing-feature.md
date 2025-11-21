# Label Printing Feature - Frontend Implementation

## Overview
This document describes the frontend implementation of the label printing feature for products and variants. The feature allows users to generate PDF labels containing QR codes and SKU text for individual items or in bulk.

## Features Implemented

### 1. Single Label Generation
- **Generate labels for individual products**: Click the tag icon next to any product in the products table
- **Generate labels for individual variants**: Click the tag icon next to any variant in the variants table
- **Configurable label dimensions**: 
  - Width (mm)
  - Height (mm)
  - Margin (mm)
  - QR Code size (mm)
  - Font size (pt)
- **Real-time validation**: Form validation with visual feedback following the design system
- **Automatic download**: Generated PDFs are automatically downloaded with filename `label-{SKU}.pdf`

### 2. Bulk Label Generation
- **Select multiple products and/or variants**: Checkbox-based selection
- **Select all / Clear all functionality**: Quick selection controls
- **Visual selection counter**: Shows how many items are selected
- **Grid layout configuration**: Configure how many labels appear per row
- **Mixed selection**: Can generate labels for both products and variants in a single PDF
- **Automatic download**: Generated PDFs are downloaded as `labels-bulk.pdf`

## Components Created

### 1. `GenerateLabelDialog.tsx`
A dialog component for generating single labels with optional configuration.

**Props:**
- `open: boolean` - Controls dialog visibility
- `onOpenChange: (open: boolean) => void` - Callback when dialog state changes
- `companyId: number` - Company identifier
- `productId: number` - Product identifier
- `variantId?: number` - Optional variant identifier
- `sku: string` - SKU to display in the label
- `itemName: string` - Item name for display

**Features:**
- Form validation using Zod schema
- Real-time validation feedback with color-coded borders
- Loading state with spinner during PDF generation
- Success/error alerts
- Auto-closes after successful generation

### 2. `GenerateBulkLabelsDialog.tsx`
A dialog component for generating multiple labels at once.

**Props:**
- `open: boolean` - Controls dialog visibility
- `onOpenChange: (open: boolean) => void` - Callback when dialog state changes
- `companyId: number` - Company identifier
- `products: Product[]` - Array of products to select from
- `variants?: ProductVariant[]` - Optional array of variants to select from

**Features:**
- Checkbox-based multi-selection for products and variants
- Select All / Clear functionality for each category
- Real-time selection counter
- Scrollable lists with hover effects
- Optional label configuration
- Validates that at least one item is selected

### 3. Updated `ProductsTable.tsx`
Enhanced the products table with label generation functionality.

**Changes:**
- Added label generation button (tag icon) for each product
- Added "Bulk Generate Labels" button above the table
- Integrated `GenerateLabelDialog` for single product labels
- Integrated `GenerateBulkLabelsDialog` for bulk generation
- State management for dialog visibility and selected products

### 4. Updated `ProductVariantsTable.tsx`
Enhanced the variants table with label generation functionality.

**Changes:**
- Added `companyId` and `productId` props (required for API calls)
- Added label generation button (tag icon) for each variant
- Added "Bulk Generate Labels" button above the table
- Integrated `GenerateLabelDialog` for single variant labels
- Integrated `GenerateBulkLabelsDialog` for bulk generation
- State management for dialog visibility and selected variants

### 5. Updated `api-client.ts`
Added label generation API endpoints.

**New Methods:**
```typescript
labels = {
  generateProductLabel: async (companyId, productId, config?) => Promise<Blob>
  generateVariantLabel: async (companyId, productId, variantId, config?) => Promise<Blob>
  generateBulkLabels: async (companyId, data) => Promise<Blob>
}
```

## Design Pattern Compliance

The implementation follows the form design pattern specified in `form.design.md`:

### ✅ Form Validation
- Uses `react-hook-form` with `zodResolver`
- Zod schemas for type-safe validation
- Real-time validation with `mode: 'onChange'`

### ✅ Visual Feedback
- Color-coded input borders (green for valid, red for error)
- Validation icons (CheckCircle2 for success, XCircle for error)
- Error messages below fields
- Status alerts (success/error/info)

### ✅ User Experience
- Loading states with spinners
- Disabled states during submission
- Auto-close on success
- Clear action buttons
- Helpful descriptions and placeholders

## User Flow

### Single Label Generation
1. User clicks the tag icon next to a product or variant
2. Dialog opens with optional configuration fields
3. User can customize label dimensions or use defaults
4. Click "Generate Label" button
5. PDF is generated and automatically downloaded
6. Success message is shown
7. Dialog auto-closes after 1.5 seconds

### Bulk Label Generation
1. User clicks "Bulk Generate Labels" button
2. Dialog opens with lists of products/variants
3. User selects items using checkboxes (or Select All)
4. User can optionally configure label dimensions
5. Selection counter shows how many items are selected
6. Click "Generate X Labels" button
7. PDF with all selected labels is generated and downloaded
8. Success message is shown
9. Dialog auto-closes after 1.5 seconds

## API Integration

### Endpoints Used
- `GET /api/v1/companies/:companyId/products/:productId/label`
- `GET /api/v1/companies/:companyId/products/:productId/variants/:variantId/label`
- `POST /api/v1/companies/:companyId/products/labels/bulk`

### Request Format (Bulk)
```json
{
  "product_ids": [1, 2, 3],
  "variant_ids": [10, 11, 12],
  "config": {
    "width_mm": 50.8,
    "height_mm": 25.4,
    "margin_mm": 2.0,
    "qr_size_mm": 20.0,
    "font_size": 10.0,
    "labels_per_row": 3
  }
}
```

## Default Configuration

When no custom configuration is provided, the following defaults are used:
- **Width**: 80mm
- **Height**: 50mm
- **Margin**: 1.0mm
- **QR Code Size**: 40mm (auto-adjusted to fit sticker)
- **Font Size**: 24.0pt (larger for better readability)
- **Labels Per Row**: 1 (for bulk generation)
- **Rows Per Page**: 4 (calculated based on height)

## UI Components Used

From shadcn/ui:
- `Dialog` - Modal dialogs
- `Form` - Form components with react-hook-form integration
- `Input` - Text inputs with validation
- `Button` - Action buttons
- `Checkbox` - Multi-selection
- `Alert` - Status messages
- `Badge` - Visual indicators
- Icons from `lucide-react`: `Tag`, `Tags`, `Download`, `CheckCircle2`, `AlertCircle`, `Loader2`, `X`

## Styling

All components follow the existing design system:
- Tailwind CSS for styling
- Consistent spacing and sizing
- Responsive layouts
- Hover effects and transitions
- Color-coded validation states
- Professional appearance matching the ERP system

## Future Enhancements

Potential improvements for future iterations:
1. **Label preview**: Show a preview of the label before downloading
2. **Saved configurations**: Save and reuse label configurations
3. **Print directly**: Send to printer without downloading
4. **Batch printing**: Generate labels for inventory counts
5. **Custom templates**: Allow different label layouts
6. **Barcode formats**: Support for different barcode types beyond QR codes
7. **Label history**: Track generated labels for auditing

