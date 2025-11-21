import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { AttributeDefinition } from '@/types/api'

interface BulkVariantFormProps {
  onSubmit: (data: { attributes: AttributeDefinition[]; use_parent_pricing: boolean }) => void
  isLoading?: boolean
}

interface AttributeState {
  id: string
  name: string
  values: string[]
  inputValue: string
}

export function BulkVariantForm({ onSubmit, isLoading = false }: BulkVariantFormProps) {
  const [attributes, setAttributes] = useState<AttributeState[]>([
    { id: '1', name: '', values: [], inputValue: '' }
  ])
  const [useParentPricing, setUseParentPricing] = useState(true)

  const addAttribute = () => {
    setAttributes([
      ...attributes,
      { id: Date.now().toString(), name: '', values: [], inputValue: '' }
    ])
  }

  const removeAttribute = (id: string) => {
    setAttributes(attributes.filter(attr => attr.id !== id))
  }

  const updateAttributeName = (id: string, name: string) => {
    setAttributes(attributes.map(attr => 
      attr.id === id ? { ...attr, name } : attr
    ))
  }

  const updateAttributeInputValue = (id: string, inputValue: string) => {
    setAttributes(attributes.map(attr => 
      attr.id === id ? { ...attr, inputValue } : attr
    ))
  }

  const addValueToAttribute = (id: string) => {
    setAttributes(attributes.map(attr => {
      if (attr.id === id && attr.inputValue.trim()) {
        return {
          ...attr,
          values: [...attr.values, attr.inputValue.trim()],
          inputValue: ''
        }
      }
      return attr
    }))
  }

  const removeValueFromAttribute = (attrId: string, valueIndex: number) => {
    setAttributes(attributes.map(attr => {
      if (attr.id === attrId) {
        return {
          ...attr,
          values: attr.values.filter((_, i) => i !== valueIndex)
        }
      }
      return attr
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent, attrId: string) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addValueToAttribute(attrId)
    }
  }

  const calculateCombinationCount = () => {
    const validAttributes = attributes.filter(attr => attr.name && attr.values.length > 0)
    if (validAttributes.length === 0) return 0
    return validAttributes.reduce((acc, attr) => acc * attr.values.length, 1)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validAttributes = attributes
      .filter(attr => attr.name && attr.values.length > 0)
      .map(attr => ({
        name: attr.name,
        values: attr.values
      }))

    if (validAttributes.length === 0) {
      return
    }

    onSubmit({
      attributes: validAttributes,
      use_parent_pricing: useParentPricing
    })
  }

  const combinationCount = calculateCombinationCount()
  const isValid = combinationCount > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Variant Attributes</CardTitle>
          <CardDescription>
            Define attributes and their values to generate product variants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {attributes.map((attr, index) => (
            <div key={attr.id} className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Label htmlFor={`attr-name-${attr.id}`}>
                    Attribute Name {index + 1}
                  </Label>
                  <Input
                    id={`attr-name-${attr.id}`}
                    placeholder="e.g., Color, Size, Material"
                    value={attr.name}
                    onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                    required
                  />
                </div>
                {attributes.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeAttribute(attr.id)}
                    className="mt-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div>
                <Label htmlFor={`attr-value-${attr.id}`}>Values</Label>
                <div className="flex gap-2">
                  <Input
                    id={`attr-value-${attr.id}`}
                    placeholder="Enter a value and press Enter"
                    value={attr.inputValue}
                    onChange={(e) => updateAttributeInputValue(attr.id, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, attr.id)}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => addValueToAttribute(attr.id)}
                    disabled={!attr.inputValue.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {attr.values.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {attr.values.map((value, valueIndex) => (
                    <Badge key={valueIndex} variant="secondary" className="gap-1">
                      {value}
                      <button
                        type="button"
                        onClick={() => removeValueFromAttribute(attr.id, valueIndex)}
                        className="ml-1 hover:bg-secondary-foreground/20 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAttribute}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Another Attribute
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing Strategy</CardTitle>
          <CardDescription>
            Choose how variants should inherit pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="parent-pricing"
              name="pricing"
              checked={useParentPricing}
              onChange={() => setUseParentPricing(true)}
              className="h-4 w-4"
            />
            <Label htmlFor="parent-pricing" className="font-normal cursor-pointer">
              Use parent product pricing (recommended)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="radio"
              id="custom-pricing"
              name="pricing"
              checked={!useParentPricing}
              onChange={() => setUseParentPricing(false)}
              className="h-4 w-4"
            />
            <Label htmlFor="custom-pricing" className="font-normal cursor-pointer">
              Set custom pricing for each variant
            </Label>
          </div>
        </CardContent>
      </Card>

      {combinationCount > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            This will create <strong>{combinationCount}</strong> variant
            {combinationCount !== 1 ? 's' : ''} based on your attribute combinations.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end gap-3">
        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="min-w-[150px]"
        >
          {isLoading ? 'Creating...' : `Create ${combinationCount} Variant${combinationCount !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </form>
  )
}

