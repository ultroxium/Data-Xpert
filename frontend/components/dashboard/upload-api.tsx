'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormik, FormikErrors } from 'formik';
import * as Yup from 'yup';
import { LoaderCircle, Plus, X } from 'lucide-react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface HeaderPair {
  key: string;
  value: string;
}

interface FormValues {
  name: string;
  description: string;
  url: string;
  headers: HeaderPair[];
}

interface FetchUploaderProps {
  wid: string;
}

async function addDatasetFromAPI(wid: string, values: FormData) {
  const response = await axios.post(`/api/dashboard?type=apidata&wid=${wid}`, values);
  return response.data;
}

const FetchUploader: React.FC<FetchUploaderProps> = ({ wid }) => {
  const queryClient = useQueryClient();

  const addDatasetMutation = useMutation({
    mutationFn: ({ workspaceId, values }: { workspaceId: string; values: FormData }) => {
      return addDatasetFromAPI(workspaceId, values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      toast.success('Dataset added successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'An unexpected error occurred');
    },
  });

  const formik = useFormik<FormValues>({
    initialValues: {
      name: '',
      description: '',
      url: '',
      headers: [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      // description: Yup.string(),
      url: Yup.string().url('Invalid URL').required('URL is required'),
      // headers: Yup.array().of(
      //   Yup.object().shape({
      //     key: Yup.string().required('Key is required'),
      //     value: Yup.string().required('Value is required'),
      //   })
      // ),
    }),
    onSubmit: async (values) => {
      if (values.url) {
        try {
          const formData = new FormData();
          formData.append('name', values.name);
          formData.append('description', values.description);
          formData.append('url', values.url);

          // Convert headers array to JSON string in the format "{"key":"value"}"
          const headersObject = values.headers.reduce((acc, { key, value }) => {
            if (key && value) {
              acc[key] = value;
            }
            return acc;
          }, {} as Record<string, string>);
          formData.append('headers', JSON.stringify(headersObject));

          const success = await addDatasetMutation.mutateAsync({
            workspaceId: wid,
            values: formData,
          });

          if (success) {
            formik.resetForm();
          }
        } catch (error) {
          console.error('Error fetching data:', error);
          formik.setFieldError('url', 'Failed to fetch data from this URL');
        }
      }
    },
  });

  const addHeader = () => {
    formik.setFieldValue('headers', [...formik.values.headers, { key: '', value: '' }]);
  };

  const removeHeader = (index: number) => {
    const newHeaders = formik.values.headers.filter((_, i) => i !== index);
    formik.setFieldValue('headers', newHeaders);
  };

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <Input
          id="name"
          {...formik.getFieldProps('name')}
          className={formik.touched.name && formik.errors.name ? 'border-destructive' : ''}
        />
        {formik.touched.name && formik.errors.name ? (
          <p className="text-sm text-destructive">{formik.errors.name}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Dataset name</p>
        )}
      </div>

      {/* <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description (optional)
        </label>
        <Textarea
          id="description"
          {...formik.getFieldProps('description')}
          className={
            formik.touched.description && formik.errors.description ? 'border-destructive resize-none' : 'resize-none'
          }
        />
        {formik.touched.description && formik.errors.description ? (
          <p className="text-sm text-destructive">{formik.errors.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Dataset description</p>
        )}
      </div> */}

      <div className="space-y-2">
        <label htmlFor="url" className="text-sm font-medium">
          API URL
        </label>
        <Input
          id="url"
          {...formik.getFieldProps('url')}
          placeholder="https://api.example.com/data"
          className={formik.touched.url && formik.errors.url ? 'border-destructive' : ''}
        />
        {formik.touched.url && formik.errors.url ? (
          <p className="text-sm text-destructive">{formik.errors.url}</p>
        ) : (
          <p className="text-sm text-muted-foreground">API URL</p>
        )}
      </div>

      <div className="space-y-2 flex flex-col">
        <label className="text-sm font-medium">Headers (optional)</label>
        {formik.values.headers.map((header, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              placeholder="Key"
              value={header.key}
              onChange={(e) => formik.setFieldValue(`headers.${index}.key`, e.target.value)}
              className={
                formik.touched.headers?.[index]?.key &&
                (formik.errors.headers as FormikErrors<HeaderPair>[])?.[index]?.key
                  ? 'border-destructive'
                  : ''
              }
            />
            <Input
              placeholder="Value"
              value={header.value}
              onChange={(e) => formik.setFieldValue(`headers.${index}.value`, e.target.value)}
              className={
                formik.touched.headers?.[index]?.value &&
                (formik.errors.headers as FormikErrors<HeaderPair>[])?.[index]?.value
                  ? 'border-destructive'
                  : ''
              }
            />
            <Button type="button" variant="outline" size="icon" onClick={() => removeHeader(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addHeader} className="mt-2">
          <Plus className="h-4 w-4 mr-2" /> Add Header
        </Button>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit" disabled={formik.isSubmitting || !formik.isValid}>
          {formik.isSubmitting ? (
            <div className="flex items-center gap-1">
              <LoaderCircle className="animate-spin" size={16} /> Fetching
            </div>
          ) : (
            'Fetch and Save'
          )}
        </Button>
      </div>
    </form>
  );
};

export default FetchUploader;
