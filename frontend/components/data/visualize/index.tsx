'use client';
// import { PresetShare } from '@/components/share-preview/share';
import { Card } from '@/components/ui/card';

import { Skeleton } from '@/components/ui/skeleton';

import { PresetShare } from '@/components/preview/share';
import { useChartsStoreNew } from '@/store/charts';
import { useDatasetStoreNew } from '@/store/datasets';
import {
  Search
} from 'lucide-react';
import React, { Suspense, useEffect, useState } from 'react';
import { ChartCreateRightBar } from './chart-create-sidebar';


const PreviewCharts = React.lazy(() => import('./PreviewCharts'));

const DataVisualizePage = ({
  workspaceId,
  datasetId,
}: {
  workspaceId: string;
  datasetId: string;
}) => {
  const { chartData, isChartDataLoading }: any = useChartsStoreNew();
  const { columnDetails }: any = useDatasetStoreNew();

  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const filteredCharts = chartData?.filter((chart: any) =>
    chart.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className='flex w-full items-start justify-between pl-8 gap-8 bg-gray-50 dark:bg-slate-800/20'>
      {
        <div className="flex-1 py-8 h-[calc(100vh-4rem)] overflow-auto" style={{
          scrollbarWidth:'none'
        }}>
          {/* <BeautifulChartRibbon /> */}
          <div className="w-full flex items-center justify-start gap-4">
            <div className="relative flex items-center ">
                <Search size={16} className="absolute left-3" />
                <input
                  type="text"
                  className="pl-10 pr-4 py-1 w-fit border rounded-md focus:outline-none focus:border-transparent font-normal"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
          <PresetShare workspaceId={workspaceId} datasetId={datasetId} />
          </div>

          <Suspense>
            {isChartDataLoading && (
              <div className="h-full w-full py-4 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-rows-2 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <Card
                      key={index}
                      className="w-full h-full flex flex-col items-center justify-center shadow-none p-4 gap-4">
                      <div className="flex w-full justify-between gap-4">
                        <Skeleton className="h-16 w-[80%]" />
                        <Skeleton className="h-16 w-[20%]" />
                      </div>
                      <Skeleton className="h-72 w-full" />
                    </Card>
                  ))}
                </div>
              </div>
            )}
            {!isChartDataLoading && (
              <PreviewCharts
                chartsData={filteredCharts}
                columnDetails={columnDetails}
                workspaceId={workspaceId}
                datasetId={datasetId}
              // isEditMode={isEditMode}
              // setIsEditMode={setIsEditMode}
              />
            )}
          </Suspense>
        </div>
      }
      <ChartCreateRightBar workspaceId={workspaceId} datasetId={datasetId} />
    </div>
  );
};

export default DataVisualizePage;