export interface CSVRow {
  [key: string]: string
}

export interface ParsedProduct {
  name: string
  description: string
  sku: string
  base_retail_price: number
  base_wholesale_price: number
  supplier_id?: number
  supplier_cost?: number
  variants: ParsedVariant[]
}

export interface ParsedVariant {
  name: string
  sku: string
  retail_price?: number
  wholesale_price?: number
  attributes: Record<string, string>
}

export interface ValidationError {
  row: number
  field?: string
  message: string
}

export interface ParseResult {
  products: ParsedProduct[]
  errors: ValidationError[]
}

/**
 * Parses a CSV file and converts it to a structured format
 */
export async function parseCSVFile(file: File): Promise<ParseResult> {
  const text = await file.text()
  return parseCSVText(text)
}

/**
 * Parses CSV text and converts it to a structured format
 */
export function parseCSVText(text: string): ParseResult {
  const lines = text.split('\n').filter(line => line.trim())
  if (lines.length < 2) {
    return {
      products: [],
      errors: [{ row: 0, message: 'CSV file must have at least a header row and one data row' }],
    }
  }

  // Parse header
  const headers = parseCSVLine(lines[0])
  const normalizedHeaders = headers.map(h => h.toLowerCase().trim())
  const headerMap = new Map<string, number>()
  normalizedHeaders.forEach((h, i) => headerMap.set(h, i))

  // Required columns
  const requiredColumns = ['name', 'sku', 'base_retail_price', 'base_wholesale_price', 'variant_name', 'variant_sku']
  const errors: ValidationError[] = []
  
  for (const col of requiredColumns) {
    if (!headerMap.has(col)) {
      errors.push({ row: 0, message: `Missing required column: ${col}` })
    }
  }

  if (errors.length > 0) {
    return { products: [], errors }
  }

  // Identify attribute columns (non-standard columns)
  const standardColumns = new Set([
    'name', 'description', 'sku', 'base_retail_price', 'base_wholesale_price',
    'supplier_id', 'supplier_cost', 'variant_name', 'variant_sku',
    'retail_price', 'wholesale_price'
  ])
  
  const attributeColumns: number[] = []
  normalizedHeaders.forEach((h, i) => {
    if (!standardColumns.has(h)) {
      attributeColumns.push(i)
    }
  })

  // Parse rows and group by product SKU
  const productMap = new Map<string, ParsedProduct>()
  const productSKUs = new Set<string>()
  const variantSKUs = new Map<string, Set<string>>() // productSKU -> Set<variantSKU>

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i])
    const rowNum = i + 1 // 1-indexed

    if (row.length !== headers.length) {
      errors.push({ row: rowNum, message: 'Incorrect number of columns' })
      continue
    }

    // Get product SKU
    const productSKU = getValue(row, headerMap, 'sku', rowNum, errors)
    if (!productSKU) continue

    // Check for duplicate product SKU in CSV
    if (productSKUs.has(productSKU)) {
      errors.push({ row: rowNum, field: 'sku', message: `Duplicate product SKU: ${productSKU}` })
      continue
    }

    // Get or create product
    let product = productMap.get(productSKU)
    if (!product) {
      const name = getValue(row, headerMap, 'name', rowNum, errors)
      if (!name) continue

      const description = getValue(row, headerMap, 'description', rowNum, errors) || ''
      const baseRetailPrice = parseFloatValue(row, headerMap, 'base_retail_price', rowNum, errors)
      const baseWholesalePrice = parseFloatValue(row, headerMap, 'base_wholesale_price', rowNum, errors)

      if (baseRetailPrice === null || baseWholesalePrice === null) continue

      const supplierID = parseOptionalUintValue(row, headerMap, 'supplier_id', rowNum, errors)
      const supplierCost = parseOptionalFloatValue(row, headerMap, 'supplier_cost', rowNum, errors)

      product = {
        name,
        description,
        sku: productSKU,
        base_retail_price: baseRetailPrice,
        base_wholesale_price: baseWholesalePrice,
        supplier_id: supplierID ?? undefined,
        supplier_cost: supplierCost ?? undefined,
        variants: [],
      }
      productMap.set(productSKU, product)
      productSKUs.add(productSKU)
      variantSKUs.set(productSKU, new Set())
    }

    // Parse variant
    const variantName = getValue(row, headerMap, 'variant_name', rowNum, errors)
    const variantSKU = getValue(row, headerMap, 'variant_sku', rowNum, errors)
    
    if (!variantName || !variantSKU) continue

    // Check for duplicate variant SKU within product
    const variantSet = variantSKUs.get(productSKU)!
    if (variantSet.has(variantSKU)) {
      errors.push({ row: rowNum, field: 'variant_sku', message: `Duplicate variant SKU: ${variantSKU} for product ${productSKU}` })
      continue
    }
    variantSet.add(variantSKU)

    const retailPrice = parseOptionalFloatValue(row, headerMap, 'retail_price', rowNum, errors)
    const wholesalePrice = parseOptionalFloatValue(row, headerMap, 'wholesale_price', rowNum, errors)

    // Parse attributes
    const attributes: Record<string, string> = {}
    for (const attrIdx of attributeColumns) {
      const attrName = normalizedHeaders[attrIdx]
      const attrValue = row[attrIdx]?.trim()
      if (attrValue) {
        attributes[attrName] = attrValue
      }
    }

    product.variants.push({
      name: variantName,
      sku: variantSKU,
      retail_price: retailPrice ?? undefined,
      wholesale_price: wholesalePrice ?? undefined,
      attributes,
    })
  }

  return {
    products: Array.from(productMap.values()),
    errors,
  }
}

/**
 * Parses a CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

function getValue(
  row: string[],
  headerMap: Map<string, number>,
  field: string,
  rowNum: number,
  errors: ValidationError[]
): string | null {
  const idx = headerMap.get(field)
  if (idx === undefined) return null
  
  const value = row[idx]?.trim()
  if (!value) {
    errors.push({ row: rowNum, field, message: `${field} is required` })
    return null
  }
  return value
}

function parseFloatValue(
  row: string[],
  headerMap: Map<string, number>,
  field: string,
  rowNum: number,
  errors: ValidationError[]
): number | null {
  const value = getValue(row, headerMap, field, rowNum, errors)
  if (!value) return null

  const num = parseFloat(value)
  if (isNaN(num)) {
    errors.push({ row: rowNum, field, message: `Invalid ${field} value: ${value}` })
    return null
  }
  if (num < 0) {
    errors.push({ row: rowNum, field, message: `${field} must be >= 0` })
    return null
  }
  return num
}

function parseOptionalFloatValue(
  row: string[],
  headerMap: Map<string, number>,
  field: string,
  rowNum: number,
  errors: ValidationError[]
): number | null {
  const idx = headerMap.get(field)
  if (idx === undefined) return null

  const value = row[idx]?.trim()
  if (!value) return null

  const num = parseFloat(value)
  if (isNaN(num)) {
    errors.push({ row: rowNum, field, message: `Invalid ${field} value: ${value}` })
    return null
  }
  if (num < 0) {
    errors.push({ row: rowNum, field, message: `${field} must be >= 0` })
    return null
  }
  return num
}

function parseOptionalUintValue(
  row: string[],
  headerMap: Map<string, number>,
  field: string,
  rowNum: number,
  errors: ValidationError[]
): number | null {
  const idx = headerMap.get(field)
  if (idx === undefined) return null

  const value = row[idx]?.trim()
  if (!value) return null

  const num = parseInt(value, 10)
  if (isNaN(num) || num < 0) {
    errors.push({ row: rowNum, field, message: `Invalid ${field} value: ${value}` })
    return null
  }
  return num
}

/**
 * Generates a sample CSV content
 */
export function generateSampleCSV(): string {
  return `name,description,sku,base_retail_price,base_wholesale_price,supplier_id,supplier_cost,variant_name,variant_sku,retail_price,wholesale_price,color,size
T-Shirt,Comfortable cotton t-shirt,TSHIRT-001,25.00,15.00,1,10.00,Small Blue,TSHIRT-001-S-BLUE,25.00,15.00,Blue,Small
T-Shirt,Comfortable cotton t-shirt,TSHIRT-001,25.00,15.00,1,10.00,Medium Blue,TSHIRT-001-M-BLUE,25.00,15.00,Blue,Medium
T-Shirt,Comfortable cotton t-shirt,TSHIRT-001,25.00,15.00,1,10.00,Large Blue,TSHIRT-001-L-BLUE,25.00,15.00,Blue,Large
Jeans,Classic denim jeans,JEANS-001,50.00,30.00,1,20.00,32x30,JEANS-001-32-30,,,Blue,32x30
Jeans,Classic denim jeans,JEANS-001,50.00,30.00,1,20.00,34x30,JEANS-001-34-30,,,Blue,34x30
Sneakers,Comfortable running shoes,SNEAKERS-001,80.00,50.00,2,35.00,Size 9,SNEAKERS-001-9,85.00,55.00,Black,9
Sneakers,Comfortable running shoes,SNEAKERS-001,80.00,50.00,2,35.00,Size 10,SNEAKERS-001-10,85.00,55.00,Black,10`
}



