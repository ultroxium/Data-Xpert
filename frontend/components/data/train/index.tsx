'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ErrorMessage, Form, Formik } from 'formik';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Info, Loader2, LoaderCircle, WandSparkles } from 'lucide-react';


import { ClassificationReport } from './utils/classification-report';
import RegressionReport from './utils/regression-report';

import AlertBox from '@/components/common/AlertBox';
import { ConfirmationAlert } from '@/components/common/confirmation-alert';
import MultiSelector from '@/components/common/MultiSelector';
import { Colors } from '@/constant/color';
import { cn } from '@/lib/utils';
import { useDatasetStoreNew } from '@/store/datasets';
import { useTrainStoreNew } from '@/store/train';
import { deleteModel, trainAutoML, TrainedModelData, trainModel } from './model-list';
import SuggestionsDisplay from './utils/suggestions';

const CLASSIFICATION_MODELS = [
  'random_forest_classifier',
  'logistic_regression',
  'suppor_vector_machine',
  'gradient_boosting_classifier',
  'k_neighbors_classifier',
  'naive_bayes_classifier',
  'decision_tree_classifier',
];

const REGRESSION_MODELS = [
  'random_forest_regression',
  'linear_regression',
  'gradient_boosting_regression',
  'support_vector_regression',
  'k_neighbors_regressor',
  'ridge_regression',
  'elastic_net_regression',
];

const getSuggestions = async (workspaceId: string, datasetId: string, problem: string) => {
  const response = await axios.get(
    `/datasets/api/${workspaceId}/${datasetId}/train?problem=${problem}&type=suggestions`,
  );
  return response.data;
};

const validationSchema = Yup.object({
  target_column: Yup.string().required('Target column is required'),
});

export default function TrainPage({
  workspaceId,
  datasetId,
}: {
  workspaceId: string;
  datasetId: string;
}) {
  const [activeCategory, setActiveCategory] = useState<'Regression' | 'Classification'>(
    'Regression',
  );
  const [activeAlgorithm, setActiveAlgorithm] = useState<string | null>(null);
  const [isModelDeleted, setIsModelDeleted] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const { columnDetails, isColumnDetailsLoading } = useDatasetStoreNew();
  const { ModelList, isModelListLoading } = useTrainStoreNew();

  const {
    data: TrainedData,
    isLoading: isTrainedModelDataLoading,
    refetch,
    error: trainedModelError,
  } = useQuery({
    queryKey: ['trained-model-data', workspaceId, datasetId],
    queryFn: () => TrainedModelData(workspaceId, datasetId),
    enabled: !isModelDeleted,
    retry: 1,
  });

  const { data: suggestions, isLoading: isSuggestionsLoading } = useQuery({
    queryKey: ['suggestions', workspaceId, datasetId, activeCategory],
    queryFn: () => getSuggestions(workspaceId, datasetId, activeCategory.toLowerCase()),
    enabled: !!activeCategory,
  });

  const TrainModelMutation = useMutation({
    mutationFn: ({
      workspaceId,
      datasetId,
      activeAlgorithm,
      values,
    }: {
      workspaceId: string;
      datasetId: string;
      activeAlgorithm: string;
      values: any;
    }) => trainModel(workspaceId, datasetId, activeAlgorithm, values),
    onSuccess: () => {
      refetch();
      toast.success('Model trained successfully');
      setIsModelDeleted(false);
    },
    retry: 0,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const AutoMLTrainMutation = useMutation({
    mutationFn: ({
      workspaceId,
      datasetId,
      problemType,
      values,
    }: {
      workspaceId: string;
      datasetId: string;
      problemType: string;
      values: any;
    }) => trainAutoML(workspaceId, datasetId, problemType, values),
    onSuccess: () => {
      refetch();
      toast.success('Model trained successfully');
      setIsModelDeleted(false);
    },
    retry: 0,
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: ({ workspaceId, datasetId, modelId }: any) =>
      deleteModel(workspaceId, datasetId, modelId),
    onSuccess: () => {
      setIsModelDeleted(true);
      setActiveAlgorithm(null);
      queryClient.invalidateQueries({
        queryKey: ['model-list', workspaceId, datasetId],
      });
      queryClient.setQueryData(['trained-model-data'], null);
      refetch();
      toast.success('Model deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setActiveCategory(categoryParam as 'Regression' | 'Classification');
    }

    const algorithmParam = searchParams.get('alg');
    if (algorithmParam) {
      setActiveAlgorithm(algorithmParam);
    }
  }, [searchParams, setActiveCategory, setActiveAlgorithm]);

  const handleCategoryChange = (category: 'Regression' | 'Classification') => {
    setActiveCategory(category);
    setActiveAlgorithm(null);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('category', category);
    router.push(currentUrl.toString());
  };

  const handleAlgorithmSelect = (key: string) => {
    setActiveAlgorithm(key);
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('alg', key);
    router.push(currentUrl.toString());
  };

  // Delayed scroll to bottom after route change
  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 300); // Adjust delay as needed
  }, [activeAlgorithm]);

  const filteredModelList = ModelList?.filter((model) => model.category === activeCategory) || [];

  const selectedAlgorithm = ModelList?.find((algorithm) => algorithm.key === activeAlgorithm);

  const showTrainedModel = TrainedData?.is_trained && !isModelDeleted && trainedModelError === null;

  return (
    <div className="flex flex-1 gap-8 px-8">

      {/* Show autoML */}
      {!showTrainedModel && activeAlgorithm === 'auto' && (
        <div className="container relative">
          <Alert className="shadow-none border-none ">
            <AlertTitle className="font-semibold mb-2 flex items-center gap-2">
              <Info size={16} />
              Auto ML
            </AlertTitle>
            <AlertDescription className="w-full overflow-auto">
              Auto ML is a feature that automatically selects the best algorithm for your dataset
              based on the problem type and dataset characteristics. This process may take a few
              minutes.
            </AlertDescription>
          </Alert>
          <Button
            variant="link"
            className="absolute right-0 -top-8 text-muted-foreground"
            onClick={() => {
              const currentUrl = new URL(window.location.href);
              currentUrl.searchParams.delete('alg');
              setActiveAlgorithm(null);
              router.push(currentUrl.toString());
            }}>
            <div className="flex items-center gap-2">
              <ChevronLeft size={16} className="text-primary" /> Select Algorithm Manually
            </div>
          </Button>
        </div>
      )}

      {
        <>
          {activeAlgorithm !== 'auto' && (
            <div className="h-[calc(100vh-4rem)] flex flex-col items-center pt-8 sticky top-0">
              {isModelListLoading
                ? [...Array(6)].map((_, index) => (
                  <Card
                    key={index}
                    className="shadow-none rounded-none border-none w-[16rem] h-[80px] flex items-center hover:bg-secondary/40 cursor-pointer">
                    <div className="w-12 h-12 m-4">
                      <Skeleton className="h-full w-full rounded-md" />
                    </div>
                    <div className="w-[80%] p-4 flex flex-col pl-0 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </Card>
                ))
                : filteredModelList.map((item, index) => (
                  <div
                    key={item.key}
                    className={`h-[80px] w-[16rem] rounded-lg flex items-center ${item.key === activeAlgorithm ? 'bg-blue-400/20' : ''
                      } flex  hover:bg-blue-400/20 cursor-pointer`}
                    onClick={() => handleAlgorithmSelect(item.key)}>
                    <div className={cn("w-12 h-12 m-4 rounded-md flex items-center justify-center font-bold text-xl",)} style={{
                      backgroundColor: (Colors[index].hex + '60')
                    }}>
                      {item.name.charAt(0)}
                    </div>
                    <div className="flex-1 p-4 flex flex-col pl-0">
                      <div className="w-full flex justify-between">
                        <span className="text-14 font-semibold ">{item.name}</span>
                      </div>
                    </div>
                  </div>
                ))}

              <Button
                variant="link"
                className="absolute right-0 -top-8 text-muted-foreground"
                onClick={() => {
                  handleAlgorithmSelect('auto');
                }}>
                {false ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <div className="flex items-center gap-2">
                    <WandSparkles size={16} className="animate-pulse text-primary" /> Try auto ML
                  </div>
                )}
              </Button>
            </div>
          )}



          <div className='w-full flex flex-col gap-8'>
            <div className="w-full">
              {activeCategory && !showTrainedModel && (
                <SuggestionsDisplay
                  activeCategory={activeCategory}
                  suggestions={suggestions}
                  isLoading={isSuggestionsLoading}
                />
              )}

              {!showTrainedModel &&
                activeAlgorithm &&
                (activeCategory === selectedAlgorithm?.category || activeAlgorithm === 'auto') && (
                  <Card className="w-full shadow-none p-4 mt-8">
                    <h2 className="text-xl font-semibold mb-4">
                      {activeAlgorithm === 'auto'
                        ? `AutoML for ${activeCategory}`
                        : selectedAlgorithm?.name}
                    </h2>
                    <Formik
                      initialValues={{
                        ignore_columns: [],
                        target_column: '',
                      }}
                      validationSchema={validationSchema}
                      onSubmit={async (values) => {
                        if (activeAlgorithm === 'auto') {
                          await AutoMLTrainMutation.mutateAsync({
                            workspaceId,
                            datasetId,
                            problemType: activeCategory.toLowerCase(),
                            values,
                          });
                        } else {
                          await TrainModelMutation.mutateAsync({
                            workspaceId,
                            datasetId,
                            activeAlgorithm,
                            values,
                          });
                        }
                      }}>
                      {({ values, setFieldValue }) => (
                        <Form>
                          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="w-full">
                              <Label htmlFor="ignore_columns">Exclude Columns</Label>
                              <MultiSelector
                                options={columnDetails?.processed
                                  ?.filter((c) => c.name !== values.target_column)
                                  ?.map((col: any) => col.name)}
                                isMultiple={true}
                                onSelected={(values) => {
                                  setFieldValue('ignore_columns', values);
                                }}
                              />
                            </div>
                            <div className="w-full">
                              <Label htmlFor="target_column">Set Target Column</Label>
                              <MultiSelector
                                options={columnDetails?.processed?.map((col: any) => col.name)}
                                isMultiple={false}
                                onSelected={(values) => {
                                  setFieldValue('target_column', values[0]);
                                }}
                              />
                              <ErrorMessage
                                name="target_column"
                                component="div"
                                className="text-red-500"
                              />
                            </div>
                          </div>
                          <Button
                            variant="default"
                            type="submit"
                            className="mt-4"
                            disabled={
                              TrainModelMutation.isPending || AutoMLTrainMutation.isPending
                            }>
                            {TrainModelMutation.isPending || AutoMLTrainMutation.isPending ? (
                              <div className="flex items-center gap-1">
                                <LoaderCircle className="animate-spin" size={16} /> Training
                              </div>
                            ) : (
                              'Train'
                            )}
                          </Button>
                        </Form>
                      )}
                    </Formik>
                  </Card>
                )}
            </div>


            {showTrainedModel && (
              <div className="flex-1 pr-8 pb-8">
                {CLASSIFICATION_MODELS?.includes(TrainedData.model?.key) && (
                  <ClassificationReport TrainedModelData={TrainedData} />
                )}

                {REGRESSION_MODELS?.includes(TrainedData.model?.key) && (
                  <RegressionReport TrainedModelData={TrainedData} />
                )}

                <AlertBox
                  className="bg-destructive/20 border-none"
                  icon={<Info className="h-4 w-4" />}
                  title={`Model Trained Successfully 🎉 with ${TrainedData?.model?.name}`}
                  description="The model has been successfully trained. You can now review the accuracy metrics and column importance. To retrain or use a different algorithm, please delete the current model first."
                />
                <div className="w-fit border rounded-lg mt-4">
                  <ConfirmationAlert
                    handleConfirm={async () => {
                      await deleteModelMutation.mutateAsync({
                        workspaceId,
                        datasetId,
                        modelId: TrainedData?.id,
                      });
                    }}
                  />
                </div>
              </div>
            )}

          </div>
        </>
      }
    </div>
  );
}
