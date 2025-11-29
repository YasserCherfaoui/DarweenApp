import { createRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { RoleBasedLayout } from '@/components/layouts/RoleBasedLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCompany } from '@/hooks/queries/use-companies'
import { useSelectedCompany } from '@/hooks/use-selected-company'
import { ArrowLeft, Upload, Download, FileText, AlertCircle } from 'lucide-react'
import { rootRoute } from '@/main'
import { parseCSVFile, generateSampleCSV, type ParseResult } from '@/lib/csv-parser'
import { Alert, AlertDescription } from '@/components/ui/alert'

export const BulkImportProductsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/companies/$companyId/products/bulk-import',
  component: BulkImportProductsPage,
})

function BulkImportProductsPage() {
  const navigate = useNavigate()
  const { companyId } = BulkImportProductsRoute.useParams()
  const { data: company } = useCompany(Number(companyId))
  const { selectCompany } = useSelectedCompany()
  const [file, setFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [isParsing, setIsParsing] = useState(false)

  // Sync the selected company with the URL param
  useEffect(() => {
    if (company) {
      selectCompany(company)
    }
  }, [company])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    setIsParsing(true)

    try {
      const result = await parseCSVFile(selectedFile)
      setParseResult(result)
    } catch (error) {
      setParseResult({
        products: [],
        errors: [{ row: 0, message: `Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}` }],
      })
    } finally {
      setIsParsing(false)
    }
  }

  const handleDownloadSample = () => {
    const csvContent = generateSampleCSV()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'products-sample.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleContinue = () => {
    if (parseResult && parseResult.products.length > 0 && parseResult.errors.length === 0) {
      // Store parsed data in sessionStorage to pass to preview page
      sessionStorage.setItem('bulkImportData', JSON.stringify(parseResult.products))
      navigate({ to: `/companies/${companyId}/products/bulk-import/preview` })
    }
  }

  const hasErrors = parseResult && parseResult.errors.length > 0
  const hasProducts = parseResult && parseResult.products.length > 0
  const canContinue = hasProducts && !hasErrors

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        <div>
          <Button
            variant="ghost"
            onClick={() => navigate({ to: `/companies/${companyId}/products` })}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Bulk Import Products
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Upload a CSV file to create multiple products with variants
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload CSV File</CardTitle>
            <CardDescription>
              Download the sample CSV file to see the required format, then upload your file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={handleDownloadSample} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download Sample CSV
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-4"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {file ? file.name : 'Click to upload CSV file'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    CSV files only
                  </p>
                </div>
              </label>
            </div>

            {isParsing && (
              <div className="text-center text-gray-500 dark:text-gray-400">
                Parsing CSV file...
              </div>
            )}

            {parseResult && (
              <div className="space-y-4">
                {hasErrors && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-2">Found {parseResult.errors.length} error(s):</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {parseResult.errors.map((error, idx) => (
                          <li key={idx}>
                            {error.row > 0 ? `Row ${error.row}` : 'Header'}: {error.message}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {hasProducts && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold mb-1">Parsed successfully!</div>
                      <div className="text-sm">
                        Found {parseResult.products.length} product(s) with{' '}
                        {parseResult.products.reduce((sum, p) => sum + p.variants.length, 0)} variant(s)
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {canContinue && (
                  <Button onClick={handleContinue} className="w-full" size="lg">
                    Continue to Preview
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  )
}

