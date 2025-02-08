'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useDatasetStoreNew } from '@/store/datasets';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Binary, CaseSensitive, BarChart, PieChart, ArrowRight, ArrowRightIcon, Bot } from 'lucide-react';
import { staticalTerms } from '@/constants/statical-terms';
import { useRouter } from 'next/navigation';

const NullHandler = React.lazy(() => import('@/components/data/null-handler'));
const ViewDataTable = React.lazy(() => import('./table-data'));
const VerticalBarChart = React.lazy(() => import('./verticalChart'));
const HorizontalBarChart = React.lazy(() => import('./horizontalChart'));

interface Column {
  name: string;
  type: string;
}

interface Insights {
  name: string;
  value: any;
}

export default function DatasetVisualization({ workspaceId, datasetId }: { workspaceId: string; datasetId: string }) {
  const {
    tableDatasetData,
    isTableDatasetLoading,
    columnDetails,
    isColumnDetailsLoading,
    columnInsights,
    isColumnInsightsLoading,
  } = useDatasetStoreNew();

  const router = useRouter();
  
  console.log(columnDetails,'columnDetails');

  const [selectedChip, setSelectedChip] = useState<Column | null>(null);

  useEffect(() => {
    if (columnDetails?.unprocessed && columnDetails?.unprocessed.length > 0) {
      setSelectedChip(columnDetails?.unprocessed.filter((i) => i.type === 'number')[0]);
    }
  }, [columnDetails]);

  const filteredInsights = Object.entries(columnInsights?.column_insights || {})
    .filter(([key]) => key === selectedChip?.name)
    .flatMap(([key, value]) =>
      Object.entries(value).map(([name, val]) => ({
        name,
        value: val,
      })),
    );

  const graphPlots = columnInsights?.graph_plots || [];

  return (
      <section className='w-full h-full space-y-4 flex'>
        
        <div className="flex-1 flex flex-col overflow-x-hidden px-8" style={{ scrollbarWidth: 'none' }}>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 pl-0 items-center border-b">
            {/* Dataset Name */}
            <div className="text-start">
              <h3 className="text-14 uppercase text-muted-foreground mb-2">Dataset</h3>
              <p className="text-16 font-bold ">
                {isTableDatasetLoading ? (
                  <Skeleton className="h-8 w-32 " />
                ) : (
                  tableDatasetData?.dataset_name
                )}
              </p>
            </div>

            {/* Size */}
            <div className="text-start">
              <h3 className="text-14 uppercase text-muted-foreground mb-2">Size</h3>
              <p className="text-16 font-bold ">
                {isColumnInsightsLoading ? (
                  <Skeleton className="h-8 w-32 " />
                ) : (
                  columnInsights?.data_set_size
                )}
              </p>
            </div>

            {/* Columns */}
            <div className="text-start">
              <h3 className="text-14 uppercase text-muted-foreground mb-2">Columns</h3>
              <p className="text-16 font-bold ">
                {isColumnDetailsLoading ? (
                  <Skeleton className="h-8 w-16 " />
                ) : (
                  columnDetails?.unprocessed?.length
                )}
              </p>
            </div>

            {/* Rows */}
            <div className="text-start">
              <h3 className="text-14 uppercase text-muted-foreground mb-2">Rows</h3>
              <p className="text-16 font-bold ">
                {isTableDatasetLoading ? (
                  <Skeleton className="h-8 w-24 " />
                ) : (
                  tableDatasetData?.total
                )}
              </p>
            </div>
          </div>
          <Tabs defaultValue="table" className="my-4">
            <TabsList className="grid w-fit grid-cols-2 mb-4">
              <TabsTrigger value="table" className="text-14">Table View</TabsTrigger>
              <TabsTrigger value="charts" className="text-14">Charts View</TabsTrigger>
            </TabsList>
            {tableDatasetData?.isNull === 'Yes' && (
              <Suspense fallback={<Skeleton className="h-32 w-full" />}>
                <NullHandler
                  dataset={tableDatasetData?.data}
                  datasetId={datasetId}
                  workspaceId={workspaceId}
                  total_null={tableDatasetData?.total_null}
                />
              </Suspense>
            )}
            <TabsContent value="table">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <ViewDataTable workspaceId={workspaceId} datasetId={datasetId} />
              </Suspense>

            </TabsContent>
            <TabsContent value="charts">

              <div className="grid md:grid-cols-3 gap-4">
                {graphPlots.map((plot, index) => {
                  const columnName = Object.keys(plot)[0];
                  const { xlabel, ylabel } = plot[columnName];
                  const columnType = columnDetails?.unprocessed?.find(col => col.name === columnName)?.type;

                  return (
                    <Card key={index} className="border-none shadow-none bg-transparent">
                      <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
                        <CardTitle className="text-16 text-muted-foreground flex items-center gap-2">
                          {columnName}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 h-80">
                        <Suspense fallback={<Skeleton className="h-full w-full" />}>
                          {columnType === 'string' ? (
                            <HorizontalBarChart xLabel={xlabel} yLabel={ylabel} color='#16a34a80' />
                          ) : (
                            <VerticalBarChart xLabel={xlabel} yLabel={ylabel} color='#aaaaaa80' />
                          )}
                        </Suspense>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          <div className='border-t'>
            <CardHeader className="p-0 py-4">
              <CardTitle className="text-16 font-bold text-muted-foreground">Column Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px] w-full">
                <div className="flex flex-wrap gap-3 mb-8">
                  {isColumnDetailsLoading
                    ? Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-28" />)
                    : columnDetails?.unprocessed
                      ?.filter((c) => c.type === 'number' || c.type === 'string')
                      .map((column: Column) => (
                        <Button
                          key={column.name}
                          variant={selectedChip?.name === column.name ? 'secondary' : 'outline'}
                          onClick={() => setSelectedChip(column)}
                          className={`flex items-center gap-2 text-14 py-2 ${column.type === 'string' ? "text-primary" : "text-muted-foreground"}`}
                        >
                          {column.type === 'string' ? <CaseSensitive className="h-5 w-5" /> : <Binary className="h-5 w-5" />}
                          {column.name}
                        </Button>
                      ))}
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
                  {isColumnInsightsLoading
                    ? Array(6).fill(0).map((_, i) => (
                      <Card key={i} className="flex flex-col p-6 border-none bg-transparent shadow-none">
                        <Skeleton className="h-6 w-28 mb-2" />
                        <Skeleton className="h-8 w-36" />
                      </Card>
                    ))
                    : filteredInsights?.map((card: Insights) => (
                      card.name !== 'null_value' || card.value !== 0 ? (
                        <Card
                          key={card.name}
                          className={`p-4 shadow-none border-none ${card.name === filteredInsights[filteredInsights.length - 1].name
                            ? 'bg-primary/5'
                            : 'bg-transparent'
                            }`}
                        >
                          <p className="text-14 text-muted-foreground flex items-center gap-2 mb-2">
                            {card.name === 'mean' ? <BarChart className="h-5 w-5" /> : <PieChart className="h-5 w-5" />}
                            {staticalTerms[card.name]}
                          </p>
                          <p className="text-16 font-semibold">{card.value}</p>
                        </Card>
                      ) : null
                    ))}
                </div>
              </ScrollArea>
            </CardContent>
          </div>
        </div>

      </section>
  );
}

