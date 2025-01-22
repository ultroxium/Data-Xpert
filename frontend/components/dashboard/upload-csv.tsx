'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useFormik } from 'formik';
import { LoaderCircle, UploadCloud, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import * as Yup from 'yup';

import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';
import UploadDatasetDialog from './uploadDataDialogue';

interface FormValues {
  name: string;
  description: string;
  file: File | null;
}

interface UploadDatasetDialogProps {
  wid: string;
}

// add dataset to workspace
async function addDataset(wid: string, values: FormData) {
  const response = await axios.post(`/api/dashboard?type=dataset&wid=${wid}`, values);
  return response.data;
}

const CSVUploader = ({ wid }: UploadDatasetDialogProps) => {
  const queryClient = useQueryClient();

  const addDatasetMutation = useMutation({
    mutationFn: ({ workspaceId, values }: { workspaceId: string; values: FormData }) => {
      return addDataset(workspaceId, values);
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
      file: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      description: Yup.string(),
      file: Yup.mixed().required('CSV or Excel file is required'),
    }),
    onSubmit: async (values) => {
      if (values.file) {
        try {
          const formData = new FormData();
          formData.append('name', values.name);
          formData.append('description', values.description);
          formData.append('file', values.file);
          const success = await addDatasetMutation.mutateAsync({
            workspaceId: wid,
            values: formData,
          });
          if (success) {
            formik.resetForm();
          }
        } catch (error) {
          console.error('Error uploading file:', error);
        }
      }
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      formik.setFieldValue('file', file);
      formik.setFieldValue('name', file?.name || '');
    },
    [formik],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    multiple: false,
  });

  return (
    <div className='w-full rounded-lg'>
      <form onSubmit={formik.handleSubmit} className="space-y-2">
        <div
          {...getRootProps()}
          className={`flex flex-col items-center hover:border-primary justify-center w-64 p-8 text-center border-2 border-dashed rounded-lg cursor-pointer transition-colors mb-4 ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
          }`}>
          <input {...getInputProps()} />
          {formik.values.file ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm">{formik.values.file.name}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  formik.setFieldValue('file', null);
                }}>
                <X size={16} />
              </Button>
            </div>
          ) : (
            <>
              <UploadCloud size={24} className="mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Drag & drop or click to select a file</p>
            </>
          )}
        </div>
        {formik.touched.file && formik.errors.file ? (
          <p className="text-sm text-destructive">{formik.errors.file as string}</p>
        ) : (
          <p className="text-sm text-muted-foreground">CSV or Excel file</p>
        )}

        {/* <div className="space-y-2">
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
        </div> */}

        {/* <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description (optional)
          </label>
          <Textarea
            id="description"
            {...formik.getFieldProps('description')}
            className={
              formik.touched.description && formik.errors.description ? 'border-destructive' : ''
            }
          />
          {formik.touched.description && formik.errors.description ? (
            <p className="text-sm text-destructive">{formik.errors.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground">Dataset description</p>
          )}
        </div> */}

        <div className="flex justify-start items-center space-x-4 pt-4">
          <Button type="submit">
            {addDatasetMutation.isPending ? (
              <div className="flex items-center gap-1">
                <LoaderCircle className="animate-spin" size={16} /> Uploading
              </div>
            ) : (
              'Upload'
            )}
          </Button>
            <span>
            or
            </span>
            <UploadDatasetDialog wid={wid}/>
        </div>
      </form>
    </div>
  );
};

export default CSVUploader;
