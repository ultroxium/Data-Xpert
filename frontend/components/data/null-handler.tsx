import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useFormik } from 'formik';
import { LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import * as Yup from 'yup';

interface DataCleaningProps {
  dataset: any;
  datasetId: string;
  workspaceId: string;
  total_null: number;
}

const validationSchema = Yup.object().shape({
  missingValueOption: Yup.string().required('This field is required'),
});

export const cleanData = async (workspaceId: string, datasetId: string, type: string) => {
  const response = await axios.put(
    `/datasets/api/${workspaceId}/${datasetId}/utils?type=cleanData&handletype=${type}`,
  );
  return response.data;
};

export default function NullHandler({
  dataset,
  datasetId,
  workspaceId,
  total_null,
}: DataCleaningProps) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleMissingMutation = useMutation({
    mutationFn: ({
      workspaceId,
      datasetId,
      type,
    }: {
      workspaceId: string;
      datasetId: string;
      type: string;
    }) => cleanData(workspaceId, datasetId, type),
    onSuccess: () => {
      if (workspaceId && datasetId) {
        queryClient.invalidateQueries({ queryKey: ['dataset', workspaceId, datasetId] });
        setIsDialogOpen(false);
      }
      toast.success('Missing values handled successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const formik = useFormik({
    initialValues: {
      missingValueOption: 'drop',
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleMissingMutation.mutateAsync({
        workspaceId: workspaceId,
        datasetId: datasetId,
        type: values.missingValueOption,
      });
    },
  });
  return (
    <div className="my-4">
      <Alert className="w-full bg-destructive">
        <AlertDescription className="text-white flex w-full items-center justify-between">
          <p>
            The dataset has <span className="text-18 font-semibold text-primary">{total_null}</span>{' '}
            null values. Please clean the dataset for further processing.
          </p>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">Clean</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-lg">
              <DialogHeader>
                <DialogTitle className="text-start">Handle missing value</DialogTitle>
                <DialogDescription className="text-start">
                  Select the option to handle missing values in the dataset.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={formik.handleSubmit} className="w-full">
                <Select
                  onValueChange={(value) => formik.setFieldValue('missingValueOption', value)}
                  value={formik.values.missingValueOption}
                  name="missingValueOption">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mean">Fill with Mean</SelectItem>
                    <SelectItem value="median">Fill with Median</SelectItem>
                    <SelectItem value="most_occurred">Fill with Most Frequent Value</SelectItem>
                    <SelectItem value="drop">Remove Rows with Missing Values</SelectItem>
                  </SelectContent>
                </Select>
                {formik.touched.missingValueOption && formik.errors.missingValueOption ? (
                  <div className="text-red-500 text-12 mt-4">
                    {formik.errors.missingValueOption}
                  </div>
                ) : null}

                <Button variant="default" className="mt-4" type="submit">
                  {' '}
                  {handleMissingMutation.isPending ? (
                    <div className="flex items-center gap-1">
                      <LoaderCircle className="animate-spin" size={16} /> Applying
                    </div>
                  ) : (
                    'Apply'
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </AlertDescription>
      </Alert>
    </div>
  );
}
