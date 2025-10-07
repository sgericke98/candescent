"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { toast } from "sonner"
import { Upload, FileSpreadsheet, ArrowRight, Check, X, Download } from "lucide-react"

interface ImportWizardProps {
  entityType: 'accounts' | 'stakeholders' | 'risks' | 'activities' | 'win_rooms'
  onComplete?: () => void
}

const FIELD_DEFINITIONS: Record<string, { label: string; required: boolean; type: string; description: string }> = {
  // Accounts
  name: { label: 'Account Name', required: true, type: 'text', description: 'Name of the financial institution' },
  type: { label: 'Type', required: false, type: 'text', description: 'Bank, Credit Union, etc.' },
  location: { label: 'Location', required: false, type: 'text', description: 'Geographic location' },
  rssid: { label: 'RSSID', required: false, type: 'text', description: 'RSS Identifier' },
  di_number: { label: 'DI Number', required: false, type: 'text', description: 'DI Identifier' },
  aum: { label: 'AUM', required: false, type: 'number', description: 'Assets Under Management (millions)' },
  arr_usd: { label: 'ARR', required: false, type: 'number', description: 'Annual Recurring Revenue (thousands)' },
  platform_fee_usd: { label: 'Platform Fee', required: false, type: 'number', description: 'Platform fee in USD' },
  health_score: { label: 'Health Score', required: false, type: 'number', description: '0-1000 score' },
  status: { label: 'Status', required: false, type: 'select', description: 'green, yellow, or red' },
  path_to_green: { label: 'Path to Green', required: false, type: 'boolean', description: 'Yes/No or true/false' },
  last_qbr_date: { label: 'Last QBR Date', required: false, type: 'date', description: 'YYYY-MM-DD format' },
  last_touchpoint: { label: 'Last Touchpoint', required: false, type: 'date', description: 'YYYY-MM-DD format' },
  subscription_end: { label: 'Subscription End', required: false, type: 'date', description: 'YYYY-MM-DD format' },
  current_solutions: { label: 'Current Solutions', required: false, type: 'text', description: 'Comma-separated list' },
  next_win_room: { label: 'Next Win Room', required: false, type: 'date', description: 'YYYY-MM-DD format' },
}

export function ImportWizard({ entityType, onComplete }: ImportWizardProps) {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'complete'>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({})
  const [importResults, setImportResults] = useState<any>(null)
  const [showPasteArea, setShowPasteArea] = useState(false)
  const [pastedData, setPastedData] = useState('')

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0]
    if (!uploadedFile) return
    
    setFile(uploadedFile)
    
    const fileExtension = uploadedFile.name.split('.').pop()?.toLowerCase()
    
    if (fileExtension === 'csv') {
      // Parse CSV
      Papa.parse(uploadedFile, {
        header: true,
        complete: (results) => {
          setCsvData(results.data)
          setHeaders(results.meta.fields || [])
          autoMapFields(results.meta.fields || [])
          setStep('mapping')
        },
        error: (error) => {
          toast.error(`Failed to parse CSV: ${error.message}`)
        }
      })
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Parse Excel
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: 'binary' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)
        
        if (jsonData.length > 0) {
          const firstRow = jsonData[0] as Record<string, any>
          const parsedHeaders = Object.keys(firstRow)
          setCsvData(jsonData)
          setHeaders(parsedHeaders)
          autoMapFields(parsedHeaders)
          setStep('mapping')
        }
      }
      reader.readAsBinaryString(uploadedFile)
    } else {
      toast.error('Unsupported file format. Please upload CSV or Excel file.')
    }
  }

  const autoMapFields = (csvHeaders: string[]) => {
    const mapping: Record<string, string> = {}
    
    // Attempt automatic mapping based on header similarity
    Object.keys(FIELD_DEFINITIONS).forEach(dbField => {
      const fieldDef = FIELD_DEFINITIONS[dbField]
      const matchingHeader = csvHeaders.find(header => 
        header.toLowerCase().replace(/[^a-z0-9]/g, '') === 
        fieldDef.label.toLowerCase().replace(/[^a-z0-9]/g, '')
      ) || csvHeaders.find(header =>
        header.toLowerCase().includes(dbField.toLowerCase())
      )
      
      if (matchingHeader) {
        mapping[dbField] = matchingHeader
      }
    })
    
    setFieldMapping(mapping)
  }

  const handleImport = async () => {
    setStep('importing')
    
    try {
      const response = await fetch('/api/import/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: csvData,
          fieldMapping
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        setImportResults(result.results)
        setStep('complete')
        toast.success(`Import complete! ${result.results.success} records imported`)
        if (onComplete) onComplete()
      } else {
        const error = await response.json()
        toast.error(`Import failed: ${error.error}`)
        setStep('preview')
      }
    } catch (error) {
      toast.error('Import failed')
      setStep('preview')
    }
  }

  const downloadTemplate = () => {
    const template = Object.entries(FIELD_DEFINITIONS).map(([key, field]) => ({
      [field.label]: field.required ? 'REQUIRED' : 'optional'
    }))
    
    const csv = Papa.unparse(template)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${entityType}_import_template.csv`
    a.click()
  }

  const handlePasteData = () => {
    if (!pastedData.trim()) {
      toast.error('Please paste some data first')
      return
    }

    // Parse pasted data (tab or comma separated)
    const lines = pastedData.trim().split('\n')
    const delimiter = lines[0].includes('\t') ? '\t' : ','
    
    Papa.parse(pastedData, {
      delimiter,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setCsvData(results.data)
        setHeaders(results.meta.fields || [])
        autoMapFields(results.meta.fields || [])
        setStep('mapping')
        setShowPasteArea(false)
        setPastedData('')
        toast.success(`Parsed ${results.data.length} rows`)
      },
      error: (error) => {
        toast.error(`Failed to parse data: ${error.message}`)
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {['upload', 'mapping', 'preview', 'complete'].map((s, idx) => (
          <div key={s} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              step === s ? 'border-blue-500 bg-blue-500 text-white' :
              ['mapping', 'preview', 'complete'].indexOf(step) > idx ? 'border-green-500 bg-green-500 text-white' :
              'border-gray-300 text-gray-500'
            }`}>
              {['mapping', 'preview', 'complete'].indexOf(step) > idx ? (
                <Check className="h-5 w-5" />
              ) : (
                idx + 1
              )}
            </div>
            <span className="ml-2 text-sm font-medium capitalize">{s}</span>
            {idx < 3 && <ArrowRight className="mx-4 text-gray-400" />}
          </div>
        ))}
      </div>

      {/* Step 1: Upload */}
      {step === 'upload' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload or Paste Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* File Upload */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <Label htmlFor="file-upload" className="cursor-pointer">
                <span className="text-lg font-medium text-blue-600 hover:text-blue-700">
                  Click to upload file
                </span>
                <span className="text-gray-600"> or drag and drop</span>
              </Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-sm text-gray-500 mt-2">
                CSV or Excel files (Max 10MB)
              </p>
            </div>

            {/* OR Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* Paste from Clipboard */}
            {!showPasteArea ? (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowPasteArea(true)}
              >
                📋 Paste from Clipboard
              </Button>
            ) : (
              <div className="space-y-3">
                <Label htmlFor="paste-area">
                  Paste data from Excel or Google Sheets
                </Label>
                <textarea
                  id="paste-area"
                  value={pastedData}
                  onChange={(e) => setPastedData(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md min-h-[200px] font-mono text-sm"
                  placeholder="Copy cells from Excel/Sheets and paste here...&#10;&#10;Example:&#10;Account Name,Type,Location,ARR&#10;First National Bank,Bank,New York,3200&#10;Community Credit Union,Credit Union,CA,1800"
                />
                <div className="flex gap-2">
                  <Button onClick={handlePasteData}>
                    Continue with Pasted Data
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowPasteArea(false)
                      setPastedData('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <p className="text-xs text-muted-foreground">
                Supports tab and comma separated values
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Field Mapping */}
      {step === 'mapping' && (
        <Card>
          <CardHeader>
            <CardTitle>Map Fields</CardTitle>
            <p className="text-sm text-muted-foreground">
              Match your file columns to database fields. Required fields are marked with *
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(FIELD_DEFINITIONS).map(([dbField, fieldDef]) => (
                <div key={dbField} className="space-y-2">
                  <Label>
                    {fieldDef.label}
                    {fieldDef.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <select
                    value={fieldMapping[dbField] || ''}
                    onChange={(e) => setFieldMapping({ ...fieldMapping, [dbField]: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                    aria-label={`Map ${fieldDef.label} field`}
                  >
                    <option value="">-- Not mapped --</option>
                    {headers.map(header => (
                      <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">{fieldDef.description}</p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button onClick={() => setStep('preview')}>
                Continue to Preview
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Preview */}
      {step === 'preview' && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Import</CardTitle>
            <p className="text-sm text-muted-foreground">
              Review the first 5 rows before importing {csvData.length} total records
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    {Object.entries(fieldMapping)
                      .filter(([_, csvField]) => csvField)
                      .map(([dbField, _]) => (
                        <th key={dbField} className="text-left p-2 font-semibold">
                          {FIELD_DEFINITIONS[dbField]?.label || dbField}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="border-b">
                      {Object.entries(fieldMapping)
                        .filter(([_, csvField]) => csvField)
                        .map(([dbField, csvField]) => (
                          <td key={dbField} className="p-2">
                            {String(row[csvField] || '-')}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
              <FileSpreadsheet className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-semibold">{csvData.length} records ready to import</p>
                <p className="text-sm text-muted-foreground">
                  {Object.values(fieldMapping).filter(v => v).length} fields mapped
                </p>
              </div>
            </div>
            
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setStep('mapping')}>
                Back to Mapping
              </Button>
              <Button onClick={handleImport}>
                Import {csvData.length} Records
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Importing */}
      {step === 'importing' && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium">Importing data...</p>
            <p className="text-sm text-muted-foreground mt-2">Please wait</p>
          </CardContent>
        </Card>
      )}

      {/* Step 5: Complete */}
      {step === 'complete' && importResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="h-6 w-6 text-green-500" />
              Import Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 font-medium">Successful</p>
                <p className="text-3xl font-bold text-green-900">{importResults.success}</p>
              </div>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 font-medium">Failed</p>
                <p className="text-3xl font-bold text-red-900">{importResults.failed}</p>
              </div>
            </div>
            
            {importResults.errors && importResults.errors.length > 0 && (
              <div className="border rounded-lg p-4 bg-red-50">
                <p className="font-semibold text-red-900 mb-2">Errors:</p>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {importResults.errors.map((error: string, idx: number) => (
                    <p key={idx} className="text-sm text-red-800">• {error}</p>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => {
                setStep('upload')
                setFile(null)
                setCsvData([])
                setHeaders([])
                setFieldMapping({})
                setImportResults(null)
              }}>
                Import Another File
              </Button>
              <Button onClick={onComplete}>
                Done
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
