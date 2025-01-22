import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, TrendingUp } from 'lucide-react';
import ActualVsPredictedChart from './actual-vs-predicted';
import HorizontalBarChart from '../../overview/horizontalChart';

type RegressionResults = {
  model_metadata: {
    mse: number;
    rmse: number;
    mae: number;
    r2_score: number;
    importance: {
      xlabel: string[];
      ylabel: number[];
    };
    training_history: {
      iterations: number[];
      train_score: number[];
    };
    actual_vs_predicted: {
      actual: number[];
      predicted: number[];
    };
  };
  is_trained: boolean;
  model: {
    name: string;
    description: string;
  };
  target_column: string;
};

function MetricsCard({ metrics }: { metrics: any }) {
  const interpretR2Score = (score: number) => {
    if (score >= 0.7) return 'Excellent fit';
    if (score >= 0.4) return 'Good fit';
    if (score >= 0) return 'Poor fit';
    return 'Poor fit (negative value indicates model performs worse than a horizontal line)';
  };

  return (
    <div className="grid gap-4">
      <Alert
        variant={metrics.r2_score < 0 ? 'destructive' : 'default'}
        className="flex flex-col h-full justify-center items-start border-none">
        <AlertDescription className='font-semibold px-4'>
          R² Score: {metrics.r2_score.toFixed(4)} - {interpretR2Score(metrics.r2_score)}
        </AlertDescription>
      </Alert>

      <Card className="shadow-none border-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Error Metrics
          </CardTitle>
          <CardDescription>Quantitative measures of prediction accuracy</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Interpretation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Mean Absolute Error (MAE)</TableCell>
                <TableCell>{metrics.mae.toFixed(2)}</TableCell>
                <TableCell>Average absolute prediction error</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Root Mean Square Error (RMSE)</TableCell>
                <TableCell>{metrics.rmse.toFixed(2)}</TableCell>
                <TableCell>Error magnitude (penalizes larger errors)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Mean Squared Error (MSE)</TableCell>
                <TableCell>{metrics.mse.toFixed(2)}</TableCell>
                <TableCell>Squared error magnitude</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export const RegressionReport = ({ TrainedModelData }: { TrainedModelData: RegressionResults }) => {
  return (
    <div className="space-y-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-none border-none">
          <CardHeader>
            <CardTitle>Prediction Accuracy</CardTitle>
            <CardDescription>Actual vs Predicted {TrainedModelData?.target_column}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ActualVsPredictedChart
                actual={TrainedModelData?.model_metadata?.actual_vs_predicted?.actual}
                predicted={TrainedModelData?.model_metadata?.actual_vs_predicted?.predicted}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 ">
          <MetricsCard metrics={TrainedModelData?.model_metadata} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Card className="shadow-none border-none">
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
            <CardDescription>
              Impact of each feature on {TrainedModelData?.target_column} prediction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <HorizontalBarChart
                xLabel={TrainedModelData?.model_metadata.importance.xlabel}
                yLabel={TrainedModelData?.model_metadata.importance.ylabel}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegressionReport;
