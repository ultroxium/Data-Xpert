"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartsList } from "@/config/chart"
import { Grid2X2, Grid3X3, List, Maximize2, Search } from "lucide-react"
import { Suspense, useState, useMemo } from "react"

interface ChartPreviewProps {
  chartsData: any[]
}

const componentMap = new Map(ChartsList.map(({ key, component }) => [key, component]))

export default function SharePreviewCharts({ chartsData }: ChartPreviewProps) {
  const [expandedCard, setExpandedCard] = useState<any>(null)
  const [gridLayout, setGridLayout] = useState<"1x1" | "2x2" | "3x3">("1x1")
  const [searchTerm, setSearchTerm] = useState("")

  const handleExpand = (card: any) => {
    setExpandedCard(card)
  }

  const handleMinimize = () => {
    setExpandedCard(null)
  }

  const getGridClass = () => {
    switch (gridLayout) {
      case "1x1":
        return "grid-cols-1"
      case "2x2":
        return "grid-cols-1 md:grid-cols-2"
      case "3x3":
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    }
  }

  const filteredChartsData = useMemo(() => {
    return chartsData?.filter((item) => item.label.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [chartsData, searchTerm])

  return (
    <div className="h-full w-full py-4 relative">
      {chartsData?.length > 0 ? (
        <div className="h-full w-full">
          <div className="mb-4 flex justify-between items-center">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search charts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <div className="flex space-x-2">
              <Button
                variant={gridLayout === "1x1" ? "default" : "outline"}
                onClick={() => setGridLayout("1x1")}
                size="icon"
              >
                <List size={16} />
              </Button>
              <Button
                variant={gridLayout === "2x2" ? "default" : "outline"}
                onClick={() => setGridLayout("2x2")}
                size="icon"
              >
                <Grid2X2 size={16} />
              </Button>
              <Button
                variant={gridLayout === "3x3" ? "default" : "outline"}
                onClick={() => setGridLayout("3x3")}
                size="icon"
              >
                <Grid3X3 size={16} />
              </Button>
            </div>
          </div>
          <div className={`grid ${getGridClass()} gap-4`}>
            {filteredChartsData?.map((item: any) => {
              const ChartComponent = componentMap.get(item.key)
              return (
                <Card
                  key={item?.id}
                  className={`w-full h-full flex flex-col items-center justify-center shadow-none bg-background`}
                >
                  <CardHeader className="w-full flex flex-row items-center justify-between py-2 max-h-12">
                    <CardTitle className={`text-16 flex gap-2 items-center text-muted-foreground`}>
                      {item.label}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button variant={"ghost"} className="py-0 px-2" onClick={() => handleExpand(item)}>
                        <Maximize2 size={16} />
                      </Button>
                    </div>
                  </CardHeader>
                  <Suspense
                    fallback={
                      <div className="h-80 w-full p-4 flex items-center">
                        <Skeleton className="h-full w-full" />
                      </div>
                    }
                  >
                    {ChartComponent ? (
                      <ChartComponent
                        xAxisData={item.xLabel}
                        yAxisData={item.yLabel}
                        data={item.data}
                        xLabel={item?.xAxis || item?.column}
                        yLabel={item?.yAxis}
                        plotoption={item?.option}
                        color={item?.color}
                      />
                    ) : (
                      <CardContent className="h-[100px] flex items-center justify-center">{item?.error}</CardContent>
                    )}
                  </Suspense>
                </Card>
              )
            })}
          </div>
          <Dialog open={expandedCard !== null} onOpenChange={handleMinimize}>
            {expandedCard &&
              (() => {
                const ChartComponent = componentMap.get(expandedCard.key)
                return (
                  <DialogContent className="rounded-lg max-w-[1200px]">
                    <DialogHeader className="flex">
                      <CardTitle className="text-16 flex gap-2 items-center">{expandedCard.label}</CardTitle>
                    </DialogHeader>
                    <Suspense
                      fallback={
                        <div className="h-80 w-full p-4 flex items-center">
                          <Skeleton className="h-full w-full" />
                        </div>
                      }
                    >
                      {ChartComponent ? (
                        <ChartComponent
                          xAxisData={expandedCard.xLabel}
                          yAxisData={expandedCard.yLabel}
                          data={expandedCard.data}
                          xLabel={expandedCard?.xAxis || expandedCard?.column}
                          yLabel={expandedCard?.yAxis}
                          plotoption={expandedCard?.option}
                          color={expandedCard?.color}
                        />
                      ) : (
                        <CardContent className="h-[100px] flex items-center justify-center">
                          {expandedCard?.error}
                        </CardContent>
                      )}
                    </Suspense>
                  </DialogContent>
                )
              })()}
          </Dialog>
        </div>
      ) : (
        <NoChartFound />
      )}
    </div>
  )
}

const NoChartFound = () => (
  <div className="container h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <div className="mb-8">
      <div className="w-[80px] h-[80px] bg-[url('/d/chart.png')]  bg-cover opacity-50" />
    </div>
    <h2 className="text-2xl font-bold text-primary">No charts have been created yet</h2>
    <p className="text-lg text-muted-foreground">{"To get started, use the 'Create' button in the top-left corner."}</p>
  </div>
)

