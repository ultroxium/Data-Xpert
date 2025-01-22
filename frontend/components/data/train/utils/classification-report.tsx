import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Info } from 'lucide-react';
import AccuracyChart from './accuracy-chart';
import HorizontalBarChart from '../../overview/horizontalChart';

// Define the type for our data
type MLResults = {
  confusion_matrix: number[][];
  classification_report: {
    [key: string]:
      | {
          precision: number;
          recall: number;
          'f1-score': number;
          support: number;
        }
      | number;
  };
};

function MLResultsVisualization({ mlResults }: { mlResults: MLResults }) {
  return (
    <Card className="shadow-none rounded-lg bg-card/0">
      <CardHeader>
        <CardTitle>Classification Report</CardTitle>
        <CardDescription>Detailed metrics for each class and overall performance</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Precision</TableHead>
              <TableHead>Recall</TableHead>
              <TableHead>F1-Score</TableHead>
              <TableHead>Support</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object?.entries(mlResults?.classification_report)?.map(([key, value]) => {
              if (typeof value === 'object') {
                return (
                  <TableRow key={key}>
                    <TableCell>{key}</TableCell>
                    <TableCell>{value.precision.toFixed(4)}</TableCell>
                    <TableCell>{value.recall.toFixed(4)}</TableCell>
                    <TableCell>{value['f1-score'].toFixed(4)}</TableCell>
                    <TableCell>{value.support}</TableCell>
                  </TableRow>
                );
              } else if (key === 'accuracy') {
                return (
                  <TableRow key={key}>
                    <TableCell>Accuracy</TableCell>
                    <TableCell colSpan={4}>{value.toFixed(4)}</TableCell>
                  </TableRow>
                );
              }
              return null;
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export const ClassificationReport = ({ TrainedModelData }: { TrainedModelData: any }) => {
  return (
    <>
      <Card className="shadow-none border-l-8 border-t-0 border-r-0 border-b-0 dark:bg-card/0">
        <CardHeader>
          <CardTitle>{TrainedModelData?.model.name}</CardTitle>
          <CardDescription>{TrainedModelData?.model.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Target Variable: <span className='font-semibold'>{TrainedModelData?.target_column}</span>
          </p>
        </CardContent>
      </Card>

      <div className="flex xxs:flex-col md:flex-row gap-4 py-4">
        <div className="w-[300px] flex items-center justify-center p-4 rounded-lg">
          <AccuracyChart
            chartData={[
              {
                accuracy: (TrainedModelData?.model_metadata?.accuracy * 100).toFixed(2),
                remaining: ((1 - TrainedModelData?.model_metadata?.accuracy) * 100).toFixed(2),
              },
            ]}
          />
        </div>
        <div className="flex-1 border rounded-lg flex flex-col">
          <label htmlFor="Title" className="text-16 font-semibold border-b p-4">
            Column Importance
          </label>
          <HorizontalBarChart
            xLabel={TrainedModelData?.model_metadata?.importance?.xlabel}
            yLabel={TrainedModelData?.model_metadata?.importance?.ylabel}
          />
        </div>
      </div>

      <div>
        <MLResultsVisualization
          mlResults={{
            confusion_matrix: TrainedModelData?.model_metadata?.confusion_matrix,
            classification_report: TrainedModelData?.model_metadata?.classification_report,
          }}
        />
      </div>
    </>
  );
};
