'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, LoaderCircle } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  cleanData,
  encodeData,
  handleOutliers,
  normalizeData,
} from './process-data';
import AlertBox from '@/components/common/AlertBox';

interface Method {
  method: string;
  key: string;
  description: string;
  orderIndex: number;
  canSkip: string;
}

interface SelectMethodsProps {
  methods: Method[];
  feature: string;
  selectedColumns: any[];
  workspace_id: string;
  dataset_id: string;
  handleIsAppliedColumns: any;
}

const SelectMethods: React.FC<SelectMethodsProps> = ({
  methods,
  feature,
  selectedColumns,
  workspace_id,
  dataset_id,
  handleIsAppliedColumns,
}) => {
  const queryClient = useQueryClient();

  const cleanDataMutation = useMutation({
    mutationFn: ({
      workspace_id,
      dataset_id,
      config,
    }: {
      workspace_id: string;
      dataset_id: string;
      config: any;
    }) => cleanData(workspace_id, dataset_id, config),
    onSuccess: () => {
      if (workspace_id && dataset_id) {
        queryClient.invalidateQueries({ queryKey: ['processed-data', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['distributions', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['column-details', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['correlation', workspace_id, dataset_id] });
        
        toast.success('Data cleaned successfully');
      }
      handleIsAppliedColumns(selectedColumns);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const encodeDataMutation = useMutation({
    mutationFn: ({
      workspace_id,
      dataset_id,
      config,
    }: {
      workspace_id: string;
      dataset_id: string;
      config: any;
    }) => encodeData(workspace_id, dataset_id, config),
    onSuccess: () => {
      if (workspace_id && dataset_id) {
        queryClient.invalidateQueries({ queryKey: ['processed-data', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['distributions', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['column-details', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['correlation', workspace_id, dataset_id] });
      }
      toast.success('Selected columns encoded successfully');
      handleIsAppliedColumns(selectedColumns);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const handleOutliersMutation = useMutation({
    mutationFn: ({
      workspace_id,
      dataset_id,
      config,
    }: {
      workspace_id: string;
      dataset_id: string;
      config: any;
    }) => handleOutliers(workspace_id, dataset_id, config),
    onSuccess: () => {
      if (workspace_id && dataset_id) {
        queryClient.invalidateQueries({ queryKey: ['processed-data', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['distributions', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['column-details', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['correlation', workspace_id, dataset_id] });
      }
      toast.success('Outliers handled successfully');
      handleIsAppliedColumns(selectedColumns);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const normalizeDataMutation = useMutation({
    mutationFn: ({
      workspace_id,
      dataset_id,
      config,
    }: {
      workspace_id: string;
      dataset_id: string;
      config: any;
    }) => normalizeData(workspace_id, dataset_id, config),
    onSuccess: () => {
      if (workspace_id && dataset_id) {
        queryClient.invalidateQueries({ queryKey: ['processed-data', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['distributions', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['column-details', workspace_id, dataset_id] });
        queryClient.invalidateQueries({ queryKey: ['correlation', workspace_id, dataset_id] });
      }
      toast.success('Selected columns normalized successfully');
      handleIsAppliedColumns(selectedColumns);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const isAppliyng =
    cleanDataMutation.isPending ||
    encodeDataMutation.isPending ||
    handleOutliersMutation.isPending ||
    normalizeDataMutation.isPending;

  const formik = useFormik({
    initialValues: {
      selectedMethod: '',
    },
    validationSchema: Yup.object({
      selectedMethod: Yup.string().required('Selecting a method is required'),
    }),
    onSubmit: async (values) => {
      if (feature === 'Encoding' && selectedColumns.length !== 0) {
        const config = {
          encode_columns: selectedColumns,
          type: values.selectedMethod,
        };

        await encodeDataMutation.mutateAsync({
          workspace_id,
          dataset_id,
          config,
        });
      } else if (feature === 'Outlier Handling' && selectedColumns.length !== 0) {
        const config = {
          columns: selectedColumns,
          method: values.selectedMethod,
        };

        await handleOutliersMutation.mutateAsync({
          workspace_id,
          dataset_id,
          config,
        });
      } else if (feature === 'Scaling' && selectedColumns.length !== 0) {
        const config = {
          normalize_columns: selectedColumns,
          type: values.selectedMethod,
        };

        await normalizeDataMutation.mutateAsync({
          workspace_id,
          dataset_id,
          config,
        });
      } else {
        let config = {}; // Declare config outside

        if (values.selectedMethod === 'remove_columns') {
          config = { [values.selectedMethod]: selectedColumns };
        } else if (values.selectedMethod === 'remove_duplicates') {
          config = {
            [values.selectedMethod]: {
              subset: selectedColumns,
            },
          };
        } else {
          toast('No method selected');
          return;
        }

        await cleanDataMutation.mutateAsync({
          workspace_id,
          dataset_id,
          config,
        });
      }
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} className="w-full border rounded-lg">
      <CardHeader className="border-b p-4">
        <h2 className="capitalize">Select {feature} Options</h2>
      </CardHeader>
      <CardContent className="w-full h-full flex flex-col gap-4 p-4">
        <div className="w-full flex flex-col gap-2">
          <h2 className="uppercase text-xs font-semibold">Options</h2>
          <div className="w-full flex flex-wrap gap-2">
            <Select
              onValueChange={(value) => formik.setFieldValue('selectedMethod', value)}
              value={formik.values.selectedMethod}>
              <SelectTrigger className="w-full text-muted-foreground">
                <SelectValue placeholder="Select a Method" />
              </SelectTrigger>
              <SelectContent>
                {methods.map((method) => (
                  <SelectItem key={method.orderIndex} value={method.key}>
                    {method.method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formik.touched.selectedMethod && formik.errors.selectedMethod ? (
              <div className="text-red-500 text-xs">{formik.errors.selectedMethod}</div>
            ) : null}

            {methods
              .filter((m) => m?.method === formik.values.selectedMethod)
              .map((data) => (
                <AlertBox
                  key={data?.method}
                  icon={<Info />}
                  title={data?.method}
                  description={data?.description}
                />
              ))}
          </div>
        </div>
        <Button type="submit" variant="default" className="w-fit">
          {isAppliyng ? (
            <div className="flex items-center gap-1">
              <LoaderCircle className="animate-spin" size={16} /> Applying
            </div>
          ) : (
            'Apply'
          )}
        </Button>
      </CardContent>
    </form>
  );
};

export default SelectMethods;
