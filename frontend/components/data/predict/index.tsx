'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Copy, CopyX, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { fetchInputColumns } from './predict';
import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { usePredictStoreNew } from '@/store/predict';

interface Column {
  name: string;
  type: 'number' | 'datetime' | 'string';
}

export default function TestModel({
  workspaceId,
  datasetId,
}: {
  workspaceId: string;
  datasetId: string;
}) {
  const { isPredicting, isPredictingSuccess, prediction, predict } = usePredictStoreNew();

  const {
    data: InputColumns,
    isLoading: isInputColumnsLoading,
    error,
    isError,
  } = useQuery({
    queryKey: ['input-columns', workspaceId, datasetId],
    queryFn: () => fetchInputColumns(workspaceId, datasetId),
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const [inputs, setInputs] = useState<Record<string, string | number>>({});

  useEffect(() => {
    if (InputColumns?.length > 0) {
      const initialInputs = InputColumns?.reduce(
        (acc, column) => ({
          ...acc,
          [column.name]: column.type === 'datetime' || column.type === 'string' ? '' : 0,
        }),
        {},
      );
      setInputs(initialInputs); // Set initial inputs
    }
  }, [InputColumns]);

  const [newParam, setNewParam] = useState<string | null>(null);

  const handleInputChange = (key: string, value: string | number) => {
    const column = InputColumns?.find((c) => c.name === key);
    if (column?.type === 'number') {
      setInputs((prev) => ({
        ...prev,
        [key]: parseFloat(value as string) || 0,
      }));
    } else if (column?.type === 'datetime') {
      setInputs((prev) => ({
        ...prev,
        [key]: value, // Date handling as a string or Date object
      }));
    } else {
      setInputs((prev) => ({
        ...prev,
        [key]: value,
      }));
    }
  };

  const handleAddInput = () => {
    if (newParam) {
      const column = InputColumns?.find((c) => c.name === newParam);
      setInputs((prev) => ({
        ...prev,
        [newParam]: column?.type === 'datetime' ? '' : 0,
      }));
      setNewParam(null);
    }
  };

  const handleRemoveInput = (key: string) => {
    setInputs((prev) => {
      const newInputs = { ...prev };
      delete newInputs[key];
      return newInputs;
    });
  };

  const handlePredict = async () => {
    await predict(workspaceId, datasetId, inputs);
  };
  // Early return for error state
  if (isError || error) {
    return (
      <div className="container mx-auto py-8">
        <NoModelTrained />
      </div>
    );
  }

  // Get available InputColumns for the dropdown (those not already used in inputs)
  const availableColumns = InputColumns?.filter((col) => !Object.keys(inputs).includes(col.name));

  return (
    <div className="p-4">
      {isInputColumnsLoading ? (
        <LoadingSkeleton />
      ) : (
        InputColumns &&
        InputColumns.length > 0 && (
          <>
            <div className="flex flex-col md:flex-row gap-4">
              <Card className="shadow-none flex-1 border-none">
                <CardHeader>
                  <CardTitle>Inputs</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-4">
                  <InputForm
                    inputs={inputs}
                    InputColumns={InputColumns}
                    handleInputChange={handleInputChange}
                    handleRemoveInput={handleRemoveInput}
                  />
                  {availableColumns.length > 0 && (
                    <AddParameterForm
                      availableColumns={availableColumns}
                      newParam={newParam}
                      setNewParam={setNewParam}
                      handleAddInput={handleAddInput}
                    />
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button onClick={handlePredict} disabled={isPredicting}>
                    {isPredicting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Predicting...
                      </>
                    ) : (
                      'Predict'
                    )}
                  </Button>
                </CardFooter>
              </Card>
              <PredictionOutput
                isPredictingSuccess={isPredictingSuccess}
                prediction={prediction}
                isPredicting={isPredicting}
              />
            </div>
            <SharePredictionApi
              workspaceId={workspaceId}
              datasetId={datasetId}
              inputs={InputColumns}
            />
          </>
        )
      )}
    </div>
  );
}

const LoadingSkeleton = () => (
  <div className="w-full flex gap-8 flex-col md:flex-row">
    <Card className="shadow-none flex-1">
      <CardHeader>
        <CardTitle>Inputs</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-starts gap-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-9 w-48" />
            {/* <Skeleton className="h-8 w-8 rounded-full" /> */}
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Skeleton className="h-9 w-24" />
      </CardFooter>
    </Card>
    <Card className="shadow-none md:w-1/3">
      <CardHeader>
        <CardTitle>Output</CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-44 w-full" />
      </CardContent>
    </Card>
  </div>
);

const InputForm = ({ inputs, InputColumns, handleInputChange, handleRemoveInput }) => (
  <>
    {Object.entries(inputs).map(([key, value]) => {
      const column = InputColumns?.find((c) => c.name === key);
      return (
        <div key={key} className="flex items-start justify-start flex-col gap-2">
          <Label htmlFor={key} className="">
            {key}
          </Label>
          {column?.type === 'datetime' ? (
            <Input
              id={key}
              type="date"
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className=""
            />
          ) : column?.type === 'string' ? (
            <Select
              onValueChange={(e) => {
                handleInputChange(key, e);
              }}>
              <SelectTrigger className="">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Options</SelectLabel>
                  {column?.options.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={key}
              type="number"
              value={value as number | string}
              onChange={(e) => handleInputChange(key, e.target.value)}
              className=""
            />
          )}
          {/* <Button variant="ghost" size="icon" onClick={() => handleRemoveInput(key)} disabled>
            <X className="h-4 w-4" />
          </Button> */}
        </div>
      );
    })}
  </>
);

const AddParameterForm = ({ availableColumns, newParam, setNewParam, handleAddInput }) => (
  <div className="flex items-center space-x-2">
    <Select onValueChange={setNewParam} value={newParam || undefined}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select Parameter" />
      </SelectTrigger>
      <SelectContent>
        {availableColumns.map((col) => (
          <SelectItem key={col.name} value={col.name}>
            {col.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Button variant="outline" onClick={handleAddInput} disabled={!newParam}>
      <Plus className="mr-2 h-4 w-4" /> Add Parameter
    </Button>
  </div>
);

const PredictionOutput = ({ isPredictingSuccess, prediction, isPredicting }) => (
  <Card className="shadow-none max-h-[300px] md:w-1/3 border-none">
    <CardHeader>
      <CardTitle>Output</CardTitle>
    </CardHeader>
    <CardContent>
      {isPredictingSuccess && !isPredicting ? (
        <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
          {JSON.stringify(prediction, null, 2)}
        </pre>
      ) : (
        <p className="text-muted-foreground">No prediction made yet.</p>
      )}
    </CardContent>
  </Card>
);

const NoModelTrained = () => (
  <div className="container h-[60vh] flex flex-col items-center justify-center text-center px-4">
    <div className="mb-8">
      <CopyX size={80} className="text-muted-foreground opacity-50" />
    </div>
    <h2 className="text-2xl font-bold text-primary">Model not trained yet</h2>
    <p className="text-lg text-muted-foreground">Please train a model before proceeding.</p>
  </div>
);

const SharePredictionApi = ({
  workspaceId,
  datasetId,
  inputs,
}: {
  workspaceId: string;
  datasetId: string;
  inputs: any;
}) => {
  const encodedToken = btoa(unescape(encodeURIComponent(`uuid=${workspaceId}&did=${datasetId}`)));
  const baseUrl = `${process.env.NEXT_PUBLIC_FRONTEND_URL}/p/api?t=${encodedToken}`;

  const initialInputs = inputs?.reduce(
    (acc, column) => ({
      ...acc,
      [column.name]: column.type === 'datetime' || column.type === 'string' ? '' : 0,
    }),
    {},
  );

  const curlCommand = `curl -X 'POST' \\
  '${baseUrl}' \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(initialInputs)}'`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(curlCommand);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="p-4 rounded-lg mt-10 dark:border">
      <h3 className="text-lg font-semibold mb-2">Prediction API</h3>
      <pre className="bg-slate-800/10 p-4 text-14 font-thin rounded overflow-x-auto">
        {curlCommand}
      </pre>
      <div className="flex items-center justify-between mt-2">
        <Button onClick={handleCopy} variant="outline" size='icon'>
          <Copy size={16}/>
        </Button>
      </div>
    </div>
  );
};
