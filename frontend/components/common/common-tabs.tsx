import type React from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export interface TabItem {
  name: string
  content: React.ReactNode
}

interface CommonTabsProps {
  tabs: TabItem[]
  defaultTab?: string
}

export function CommonTabs({ tabs, defaultTab }: CommonTabsProps) {
  return (
    <Tabs defaultValue={defaultTab || tabs[0].name} className="w-full">
      <TabsList className="flex-1 mb-2 ">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.name} value={tab.name} className="relative">
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabs.map((tab) => (
        <TabsContent key={tab.name} value={tab.name}>
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  )
}

