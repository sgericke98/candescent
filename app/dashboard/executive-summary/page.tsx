import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ExecutiveSummary } from "@/components/dashboard/executive-summary"
import { AtRiskSearch } from "@/components/dashboard/at-risk-search"
import { DSMView } from "@/components/dashboard/dsm-view"
import { Upload } from "lucide-react"
import Link from "next/link"

export default function ExecutiveSummaryPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/admin">
            <Button variant="outline">
              👤 Admin
            </Button>
          </Link>
          <Link href="/dashboard/import">
            <Button variant="outline">
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
          </Link>
        </div>
      </div>
      
      <Tabs defaultValue="executive-summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="executive-summary">Executive Summary</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Account Search</TabsTrigger>
          <TabsTrigger value="dsm-view">DSM Account View</TabsTrigger>
        </TabsList>
      
      <TabsContent value="executive-summary" className="mt-6">
        <ExecutiveSummary />
      </TabsContent>
      
      <TabsContent value="at-risk" className="mt-6">
        <AtRiskSearch />
      </TabsContent>
      
      <TabsContent value="dsm-view" className="mt-6">
        <DSMView />
      </TabsContent>
    </Tabs>
    </div>
  )
}
