"use client"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { ChevronDownIcon } from 'lucide-react'
import { ChartsList } from "@/config/chart"


interface ChartSelectorProps {
  setFieldValue: (field: string, value: any) => void
  values: {
    key: string
    option: string
  }
}

export function ChartSelector({ setFieldValue, values }: ChartSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleChartSelect = (chartKey: string) => {
    setFieldValue('key', chartKey)
    setFieldValue('option', '')
    setOpen(false)
  }

  const selectedChart = ChartsList.find(chart => chart.key === values.key)

  return (
    <div className="mb-4 flex flex-col gap-2">
      <Label htmlFor="chartType" className='text-xs uppercase text-muted-foreground'>Chart Type</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedChart ? selectedChart.name : "Select chart"}
            <ChevronDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="center" side="right">
          <div className="grid grid-cols-2 gap-2 p-2">
            {ChartsList.map((chart) => (
              <Button
                key={chart.id}
                variant="ghost"
                className={`flex items-center justify-start gap-2 ${
                  values.key === chart.key ? 'border-2 border-primary' : ''
                }`}
                onClick={() => handleChartSelect(chart.key)}
              >
                {/* You can add an icon here if available */}
                <span className="truncate">{chart.name}</span>
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

