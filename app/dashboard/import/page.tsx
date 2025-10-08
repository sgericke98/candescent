"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImportWizard } from "@/components/import-wizard"
import { FileSpreadsheet, Users, AlertTriangle, Target, Calendar } from "lucide-react"

export default function ImportPage() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Data</h1>
        <p className="text-muted-foreground mt-2">
          Upload CSV or Excel files to bulk import accounts and related data
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <FileSpreadsheet className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Import Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Download the template to see required fields and format</li>
                <li>• Map your file columns to database fields in the next step</li>
                <li>• Preview your data before importing</li>
                <li>• Existing records with the same name will be updated</li>
                <li>• Required fields: Account Name</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="accounts">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="accounts">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Accounts
          </TabsTrigger>
          <TabsTrigger value="stakeholders">
            <Users className="h-4 w-4 mr-2" />
            Stakeholders
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risks
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Target className="h-4 w-4 mr-2" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="win_rooms">
            <Calendar className="h-4 w-4 mr-2" />
            Win Rooms
          </TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="mt-6">
          <ImportWizard 
            entityType="accounts" 
            key={`accounts-${refreshKey}`}
            onComplete={() => setRefreshKey(prev => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="stakeholders" className="mt-6">
          <ImportWizard 
            entityType="stakeholders" 
            key={`stakeholders-${refreshKey}`}
            onComplete={() => setRefreshKey(prev => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="risks" className="mt-6">
          <ImportWizard 
            entityType="risks" 
            key={`risks-${refreshKey}`}
            onComplete={() => setRefreshKey(prev => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          <ImportWizard 
            entityType="activities" 
            key={`activities-${refreshKey}`}
            onComplete={() => setRefreshKey(prev => prev + 1)}
          />
        </TabsContent>

        <TabsContent value="win_rooms" className="mt-6">
          <ImportWizard 
            entityType="win_rooms" 
            key={`win_rooms-${refreshKey}`}
            onComplete={() => setRefreshKey(prev => prev + 1)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
