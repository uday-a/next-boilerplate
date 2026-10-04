'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TabsDemo() {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="deploys">Deploys</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="text-muted-foreground pt-2 text-sm">
        Traffic and error rates for the last 7 days.
      </TabsContent>
      <TabsContent value="deploys" className="text-muted-foreground pt-2 text-sm">
        12 deploys this week, all successful.
      </TabsContent>
      <TabsContent value="settings" className="text-muted-foreground pt-2 text-sm">
        Environment variables and build settings.
      </TabsContent>
    </Tabs>
  )
}
