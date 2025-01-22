'use client';

import { TrendingUp } from 'lucide-react';
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';


const chartConfig = {
  accuracy: {
    label: 'Accuracy',
    color: 'hsl(var(--chart-1))',
  },
  remaining: {
    label: 'Remaining',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export default function AccuracyChart({chartData}) {
  const totalAccuracy = chartData[0].accuracy + chartData[0].remaining;

  return (
    <ChartContainer config={chartConfig} className="mx-auto aspect-square w-full max-w-[200px]">
      <RadialBarChart
        data={chartData}
        startAngle={180}
        endAngle={0}
        innerRadius={80}
        outerRadius={130}>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 16}
                      className="fill-foreground text-2xl font-bold">
                      {chartData[0].accuracy}%
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 4}
                      className="fill-muted-foreground">
                      Accuracy
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </PolarRadiusAxis>
        <RadialBar
          dataKey="accuracy"
          stackId="a"
          cornerRadius={5}
          fill="var(--color-accuracy)"
          className="stroke-transparent stroke-2"
        />
        <RadialBar
          dataKey="remaining"
          fill="var(--color-remaining)"
          stackId="a"
          cornerRadius={5}
          className="stroke-transparent stroke-2"
        />
      </RadialBarChart>
    </ChartContainer>
  );
}
