'use client';
import { TableSkeleton } from '@/components/skeletons/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';


import { ChevronLeft, ChevronRight, Loader2, Search, Undo, WandSparkles } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { DataTransformationToolsBasic } from './constants';
import { CorellationChart, DistributionChart } from './charts';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { revertToOriginal, autoProcess } from './process-data';
import { toast } from 'sonner';
import { CustomTooltip } from '@/components/common/custom-tooltip';
import { CommonConfirmationAlert } from '@/components/common/common-confirmation';
import MultiSelector from '@/components/common/MultiSelector';
import { useDatasetStoreNew } from '@/store/datasets';
import { useProcessStoreNew } from '@/store/pre-processing';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Colors } from '@/constant/color';
const SelectMethods = React.lazy(() => import('./SelectEncodingTechnique'));
const PreviewTable = React.lazy(() => import('./preview-table'));

const FeatureEngineeringPage = ({
  workspaceId,
  datasetId,
}: {
  workspaceId: string;
  datasetId: string;
}) => {
  const { columnDetails, isColumnDetailsLoading }: any = useDatasetStoreNew();

  const { distributionData, isDistributionsLoading, correlationData, isCorrelationLoading } =
    useProcessStoreNew();
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isColumnsSelected, setIsColumnsSelected] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState('Feature Reduction');
  const [selectedColumns, setSelectedColumns] = useState<any[]>([]);
  const [isAppliedColumns, setIsAppliedColumns] = useState<any[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(true);

  const handleIsAppliedColumns = (value: any[]) => {
    setIsAppliedColumns(value);
  };

  useEffect(() => {
    const FeatureParam = searchParams.get('opt');
    if (FeatureParam) {
      setSelectedFeature(FeatureParam);
    }
  }, [searchParams]);

  const handleNavigation = (key: string) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('opt', key);
    router.push(currentUrl.toString());
  };

  const getMethodsAndButtonText = (featureName: string) => {
    const feature = DataTransformationToolsBasic.find((tool) => tool?.name === featureName);
    if (feature) {
      return { methods: feature.methods };
    }
    return { methods: [] };
  };

  const { methods } = getMethodsAndButtonText(selectedFeature);
  useEffect(() => {
    if (selectedColumns.length > 0) {
      setIsColumnsSelected(true);
    } else {
      setIsColumnsSelected(false);
    }
  }, [selectedColumns]);

  const filteredFeatures = DataTransformationToolsBasic.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const revertMutation = useMutation({
    mutationFn: async ({ workspaceId, datasetId }: { workspaceId: string; datasetId: string }) => {
      return await revertToOriginal(workspaceId, datasetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processed-data'] });
      queryClient.invalidateQueries({ queryKey: ['distributions', workspaceId, datasetId] });
      queryClient.invalidateQueries({ queryKey: ['column-details', workspaceId, datasetId] });
      queryClient.invalidateQueries({ queryKey: ['correlation', workspaceId, datasetId] });
      toast.success('Reverted to original dataset successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const autoProcessMutation = useMutation({
    mutationFn: async ({ workspaceId, datasetId }: { workspaceId: string; datasetId: string }) => {
      return await autoProcess(workspaceId, datasetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['processed-data'] });
      queryClient.invalidateQueries({ queryKey: ['distributions', workspaceId, datasetId] });
      queryClient.invalidateQueries({ queryKey: ['column-details', workspaceId, datasetId] });
      queryClient.invalidateQueries({ queryKey: ['correlation', workspaceId, datasetId] });
      toast.success('Auto Preprocessing applied successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  return (
    <div className="w-full flex p-8 gap-8 items-start justify-start">
        <div className='w-18rem grid grid-cols-1 h-[12rem] gap-8 sticky top-8'>
          {filteredFeatures.map((feature, index) => (
            <Button
              key={index}
              variant={selectedFeature === feature?.name ? 'secondary':'ghost'}
              className={`w-full flex flex-col items-center justify-center gap-4 py-4 h-full font-normal ${selectedFeature === feature?.name && 'text-primary'
                }`}
              onClick={() => handleNavigation(feature?.name)}>
              <div className="h-16 w-16 flex items-center justify-center rounded-lg" style={{
                backgroundColor:( Colors[index+8].hex + '99'),
              }}>
                {feature?.icon}
              </div>
                <span className='overflow-hidden break-words'>{feature?.name}</span>
            </Button>
          ))}
        </div>
      {/* Content */}
      <div
        className={`flex-1 flex flex-col gap-4 overflow-auto w-full`}>
        <div className=" w-full flex gap-4 flex-col md:flex-row">
          <div className="flex-1 max-w-[500px] flex flex-col gap-4">
            <Suspense fallback={<SelectColumnsComponentSkeleton />}>
              {isColumnDetailsLoading ? (
                <SelectColumnsComponentSkeleton />
              ) : (
                <div className="w-full">
                  <h4 className="font-semibold">Select Columns</h4>
                  <MultiSelector
                    options={columnDetails?.map((col: any) => col.name)}
                    isMultiple={true}
                    isSelectAll={true}
                    onSelected={(values) => {
                      setSelectedColumns(values);
                    }}
                  />
                </div>
              )}
            </Suspense>
          </div>
          {isColumnsSelected && (
            <div className="flex-1 max-w-[500px] ">
              <Suspense fallback={<SelectMethodsSkeleton />}>
                <SelectMethods
                  methods={methods}
                  feature={selectedFeature}
                  selectedColumns={selectedColumns}
                  workspace_id={workspaceId}
                  dataset_id={datasetId}
                  handleIsAppliedColumns={handleIsAppliedColumns}
                />
              </Suspense>
            </div>
          )}

          {!isColumnsSelected && columnDetails?.find((col: any) => col.type === 'string') && (
            <CommonConfirmationAlert
              component={
                <Button variant="ghost" size="icon" className="rounded-full p-0 m-0">
                  <CustomTooltip title="Auto Preprocessing">
                    {autoProcessMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <WandSparkles size={16} className='animate-pulse text-primary' />
                    )}
                  </CustomTooltip>
                </Button>
              }
              title="Auto Preprocessing"
              description="You have not selected any columns. Do you want to apply auto preprocessing?"
              loading={autoProcessMutation.isPending}
              btnText='Yes, Apply'
              handleConfirm={() => {
                autoProcessMutation.mutateAsync({
                  workspaceId: workspaceId,
                  datasetId: datasetId,
                });
              }}
            />
          )}
        </div>

        <div className="flex flex-col gap-4 py-4">
          <h4 className="font-semibold">Columns</h4>
          <div className="flex flex-wrap gap-3">
          {columnDetails?.map((col, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 rounded-md border bg-background"
            >
              <span className="text-sm font-medium">{col.name}</span>
              <Badge
                variant={col.type === "number" ? "secondary" : "outline"}
                className="text-xs font-normal"
              >
                {col.type}
              </Badge>
            </div>
          ))}
        </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 py-4">
          <h4 className="font-semibold">Correlation Matrix</h4>
          <Suspense fallback={<Loader2 className="animate-spin" />}>
            <div className="overflow-auto">
              {isCorrelationLoading ? (
                <div className="grid grid-cols-8 items-center gap-2">
                  {Array.from({ length: 8 }).map((_, colIndex) => (
                    <div key={`col-${colIndex}`} className="space-y-2 w-full">
                      {Array.from({ length: 6 }).map((_, rowIndex) => (
                        <Skeleton
                          key={`cell-${colIndex}-${rowIndex}`}
                          className="h-10 w-full rounded-sm"
                        />
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <CorellationChart data={correlationData} />
              )}
            </div>
          </Suspense>
        </div>

        <Separator />

        <div className="flex flex-col gap-2 py-4">
          <h4 className="font-semibold">Preview</h4>
          <Suspense fallback={<TableSkeleton />}>
            <PreviewTable workspaceId={workspaceId} datasetId={datasetId} />
          </Suspense>
        </div>

        <Separator />

        <div className="w-full flex items-center justify-end mt-4">
          <Button
            variant="outline"
            className="w-fit"
            onClick={() => {
              revertMutation.mutateAsync({
                workspaceId: workspaceId,
                datasetId: datasetId,
              });
            }}>
            {revertMutation.isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin" /> Reverting
              </span>
            ) : (
              <span className="flex items-center gap-2">
                {<Undo size={16} />} Back to original dataset
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeatureEngineeringPage;

const SelectColumnsComponentSkeleton = () => {
  return (
    <Card className="w-full shadow-none">
      <CardHeader className="border-b p-4">
        <Skeleton className="h-5 w-40" />
      </CardHeader>
      <CardContent className="w-full h-full flex flex-col gap-4 p-4">
        <div className="w-full flex flex-col gap-4">
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-full max-w-[250px]" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SelectMethodsSkeleton = () => {
  return (
    <Card className="w-full shadow-none">
      <CardHeader className="border-b p-4">
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="w-full h-full flex flex-col gap-4 p-4">
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-4 w-20" />
          <div className="w-full flex flex-wrap gap-2">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  );
};
