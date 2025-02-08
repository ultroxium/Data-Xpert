"use client"

import { useEffect, useState } from "react"
import RightBar from "@/components/common/right-bar"
import { ChevronRight, CirclePlus } from "lucide-react"
import { ChartBuilderAI } from "./chart-builder-ai"
import { ManualChartCreation } from "./create/manual-creation"
import { CommonTabs, type TabItem } from "@/components/common/common-tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { UsedDatasetType } from "@/constant/common-constant"

export function ChartCreateRightBar({
  workspaceId,
  datasetId,
}: {
  workspaceId?: string
  datasetId?: string
}) {
  const [chartDatasetType, setChartDatasetType] = useState<string>(UsedDatasetType.RAW)

  useEffect(() => {
    const storedType = localStorage.getItem("chartDatasetType")
    if (storedType === UsedDatasetType.RAW || storedType === UsedDatasetType.PROCESSED) {
      setChartDatasetType(storedType)
    }
  }, [])

  const handleDatasetTypeChange = (value: string) => {
    setChartDatasetType(value)
    localStorage.setItem("chartDatasetType", value)
  }

  const tabs: TabItem[] = [
    {
      name: "Manual",
      content: <ManualChartCreation workspaceId={workspaceId} datasetId={datasetId} />,
    },
    {
      name: "Prompt",
      content: <ChartBuilderAI />,
    },
  ]

  return (
    <RightBar closeIcon={<ChevronRight className="h-4 w-4" />} expandIcon={<CirclePlus className="h-4 w-4" />}>
      <div className="mb-4">
        <RadioGroup
          value={chartDatasetType}
          onValueChange={handleDatasetTypeChange}
          className="flex space-x-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={UsedDatasetType.RAW} id="raw" />
            <Label htmlFor="raw">Raw</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={UsedDatasetType.PROCESSED} id="processed" />
            <Label htmlFor="processed">Processed</Label>
          </div>
        </RadioGroup>
      </div>

      <CommonTabs tabs={tabs} defaultTab="Manual" />
    </RightBar>
  )
}
