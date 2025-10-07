import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExecutiveSummary } from "@/components/dashboard/executive-summary"
import { AtRiskSearch } from "@/components/dashboard/at-risk-search"
import { DSMView } from "@/components/dashboard/dsm-view"

export default function ExecutiveSummaryPage() {
  return (
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
  )
}
