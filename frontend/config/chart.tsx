const AreaChart = React.lazy(() => import('@/components/data/visualize/chart-lists/AreaChart'));
const BarChart = React.lazy(() => import('@/components/data/visualize/chart-lists/BarChart'));
const ClusterPlot = React.lazy(
  () => import('@/components/data/visualize/chart-lists/ClusterChart'),
);
const CorellationMatrixChart = React.lazy(
  () => import('@/components/data/visualize/chart-lists/CorellationMatrix'),
);
const CustomizedPie = React.lazy(
  () => import('@/components/data/visualize/chart-lists/CustomizedPieChart'),
);
const Doughnut = React.lazy(() => import('@/components/data/visualize/chart-lists/DouhnutChat'));
const ExponentialChart = React.lazy(
  () => import('@/components/data/visualize/chart-lists/ExponentialChart'),
);
const HeatMapPlot = React.lazy(
  () => import('@/components/data/visualize/chart-lists/HeatMapPlot'),
);
const LinearRegressionChart = React.lazy(
  () => import('@/components/data/visualize/chart-lists/LinearRegressionChart'),
);
const LineChart = React.lazy(() => import('@/components/data/visualize/chart-lists/LineChart'));
const PiePlot = React.lazy(() => import('@/components/data/visualize/chart-lists/PieChart'));
const PolynomialRegressionChart = React.lazy(
  () => import('@/components/data/visualize/chart-lists/PolynomialRegressionChart'),
);
const ScatterPlot = React.lazy(
  () => import('@/components/data/visualize/chart-lists/ScatterChart'),
);
const StackedLineChart = React.lazy(
  () => import('@/components/data/visualize/chart-lists/StackedLine'),
);

import {
  AreaChartIcon,
  BarChartIcon,
  Circle,
  LineChartIcon,
  PieChart,
  ScatterChart,
  Torus,
} from 'lucide-react';
import React from 'react';

export const ChartsList = [
  {
    id: 1,
    key: 'bar',
    name: 'Bar Chart',
    description:
      'To use the Bar Chart, you need to select one of the following options:\n\n' +
      '1. Choose a single column to plot various statistics such as counts, maximum, minimum, average, sum, per-hundredths, or distribution.\n' +
      '2. Alternatively, select categorical values for the x-axis and numerical values for the y-axis to plot statistics like average, minimum, maximum, or sum.\n\n',
    list: ['count', 'average', 'sum', 'min', 'max', 'per-hundredths', 'distribution'],
    component: BarChart,
  },
  {
    id: 2,
    key: 'line',
    name: 'Line Chart',
    description:
      'The Line Chart displays data as a series of points (markers) connected by straight line segments. It is ideal for visualizing trends over time or continuous data. To create a Line Chart:\n\n' +
      '1. Choose the data series you want to plot.\n' +
      '2. Select the statistics you want to visualize, such as count, average, sum, minimum, maximum, per-hundredths, or distribution.\n\n',
    list: ['count', 'average', 'sum', 'min', 'max', 'per-hundredths', 'distribution'],
    component: LineChart,
  },

  {
    id: 3,
    key: 'area',
    name: 'Area Chart',
    description:
      'The Area Chart is a variant of the Line Chart that fills the space between the line and the x-axis with color or texture. This visualization emphasizes the magnitude of the values over time or across categories. To use an Area Chart:\n\n' +
      '1. Select the data series to be plotted.\n' +
      '2. Choose the statistical metrics you wish to display, such as count, average, sum, minimum, maximum, per-hundredths, or distribution.\n\n',
    list: ['count', 'average', 'sum', 'min', 'max', 'per-hundredths', 'distribution'],
    component: AreaChart,
  },
  {
    id: 4,
    key: 'scatter',
    name: 'Scatter Chart',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['scatter'],
    component: ScatterPlot,
  },
  {
    id: 5,
    key: 'pie',
    name: 'Pie Chart',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['count', 'distribution', 'average', 'sum', 'min', 'max','per-hundredths'],
    component: PiePlot,
  },
  {
    id: 6,
    key: 'doughnut',
    name: 'Doughnut Chart',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['count', 'distribution', 'average', 'sum', 'min', 'max','per-hundredths'],
    component: Doughnut,
  },
  {
    id: 7,
    key: 'customized_pie',
    name: 'Customized Pie Chart',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['count', 'distribution', 'average', 'sum', 'min', 'max','per-hundredths'],
    component: CustomizedPie,
  },
  {
    id: 8,
    key: 'linear_regression',
    name: 'Linear Regression Chart',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['scatter'],
    component: LinearRegressionChart,
  },
  {
    id: 9,
    key: 'polynomial_regression',
    name: 'Polynomial Regression Chart',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['scatter'],
    component: PolynomialRegressionChart,
  },
  {
    id: 10,
    key: 'exponential_regression',
    name: 'Exponential Regression Chart',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['scatter'],
    component: ExponentialChart,
  },
  {
    id: 11,
    key: 'cluster',
    name: 'Cluster Chart',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['scatter'],
    component: ClusterPlot,
  },
  {
    id: 12,
    key: 'heatmap',
    name: 'Heatmap Plot',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['average', 'sum', 'min', 'max'],
    component: HeatMapPlot,
  },
  {
    id: 13,
    key: 'correlation',
    name: 'Corelation Plot',
    description:
      'An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['pearson', 'spearman', 'kendall'],
    component: CorellationMatrixChart,
  },
  {
    id: 14,
    key: 'stacked_line',
    name: 'Stacked Line Chart',
    description:
      'An stacked line chart displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings.',
    list: ['average', 'sum', 'min', 'max'],
    component: StackedLineChart,
  },
];

export const ExcludeChartListForSingleColumnChart = [
  'scatter',
  'linear_regression',
  'polynomial_regression',
  'exponential_regression',
  'cluster',
  'heatmap',
  'correlation',
  'stacked_line',
];

export const ExcludeXaxisForMultiColumnChart = [
  'scatter',
  'linear_regression',
  'polynomial_regression',
  'exponential_regression',
  'cluster',
  'correlation',
];


export const IncludeChartsForOptions=[
  'bar',
  'line',
  'area',
  'pie',
  'heatmap',
  'correlation',
  'stacked_line'
]

export const ChangeChars = [
  {
    id: 1,
    key: 'bar',
    chanage_to: [
      {
        key: 'line',
        name: 'Line Chart',
        icon: <LineChartIcon size={16} />,
      },
      {
        key: 'area',
        name: 'Area Chart',
        icon: <AreaChartIcon size={16} />,
      },
      {
        key: 'pie',
        name: 'Pie Chart',
        icon: <PieChart size={16} />,
      },
      {
        key: 'doughnut',
        name: 'Doughnut Chart',
        icon: <Torus size={16} />,
      },
      {
        key: 'customized_pie',
        name: 'Customized Pie Chart',
        icon: <PieChart size={16} />,
      },
    ],
  },
  {
    id: 2,
    key: 'line',
    chanage_to: [
      {
        key: 'bar',
        name: 'Bar Chart',
        icon: <BarChartIcon size={16} />,
      },
      {
        key: 'area',
        name: 'Area Chart',
        icon: <AreaChartIcon size={16} />,
      },
      {
        key: 'pie',
        name: 'Pie Chart',
        icon: <PieChart size={16} />,
      },
      {
        key: 'doughnut',
        name: 'Doughnut Chart',
        icon: <Torus size={16} />,
      },
      {
        key: 'customized_pie',
        name: 'Customized Pie Chart',
        icon: <PieChart size={16} />,
      },
    ],
  },
  {
    id: 3,
    key: 'area',
    chanage_to: [
      {
        key: 'bar',
        name: 'Bar Chart',
        icon: <BarChartIcon size={16} />,
      },
      {
        key: 'line',
        name: 'Line Chart',
        icon: <LineChartIcon size={16} />,
      },
      {
        key: 'pie',
        name: 'Pie Chart',
        icon: <PieChart size={16} />,
      },
      {
        key: 'doughnut',
        name: 'Doughnut Chart',
        icon: <Torus size={16} />,
      },
      {
        key: 'customized_pie',
        name: 'Customized Pie Chart',
        icon: <PieChart size={16} />,
      },
    ],
  },
  {
    id: 4,
    key: 'scatter',
    chanage_to: [
      {
        key: 'linear_regression',
        name: 'Linear Regression Chart',
      },
      {
        key: 'exponential_regression',
        name: 'Exponential Regression Chart',
      },
      {
        key: 'polynomial_regression',
        name: 'Polynomial Regression Chart',
      },
    ],
  },
  {
    id: 5,
    key: 'pie',
    chanage_to: [
      {
        key: 'doughnut',
        name: 'Doughnut Chart',
        icon: <Torus size={16} />,
      },
      {
        key: 'customized_pie',
        name: 'Customized Pie Chart',
        icon: <PieChart size={16} />,
      },
      {
        key: 'bar',
        name: 'Bar Chart',
        icon: <BarChartIcon size={16} />,
      },
      {
        key: 'area',
        name: 'Area Chart',
        icon: <AreaChartIcon size={16} />,
      },
      {
        key: 'line',
        name: 'Line Chart',
        icon: <LineChartIcon size={16} />,
      },
    ],
  },
  {
    id: 6,
    key: 'doughnut',
    chanage_to: [
      {
        key: 'pie',
        name: 'Pie Chart',
        icon: <Circle size={16} />,
      },
      {
        key: 'customized_pie',
        name: 'Customized Pie Chart',
        icon: <PieChart size={16} />,
      },
      {
        key: 'bar',
        name: 'Bar Chart',
        icon: <BarChartIcon size={16} />,
      },
      {
        key: 'area',
        name: 'Area Chart',
        icon: <AreaChartIcon size={16} />,
      },
      {
        key: 'line',
        name: 'Line Chart',
        icon: <LineChartIcon size={16} />,
      },
    ],
  },
  {
    id: 7,
    key: 'customized_pie',
    chanage_to: [
      {
        key: 'pie',
        name: 'Pie Chart',
        icon: <Circle size={16} />,
      },
      {
        key: 'doughnut',
        name: 'Doughnut Chart',
        icon: <Torus size={16} />,
      },
      {
        key: 'bar',
        name: 'Bar Chart',
        icon: <BarChartIcon size={16} />,
      },
      {
        key: 'area',
        name: 'Area Chart',
        icon: <AreaChartIcon size={16} />,
      },
      {
        key: 'line',
        name: 'Line Chart',
        icon: <LineChartIcon size={16} />,
      },
    ],
  },
  {
    id: 8,
    key: 'linear_regression',
    chanage_to: [
      {
        key: 'polynomial_regression',
        name: 'Polynomial Regression Chart',
      },
      {
        key: 'exponential_regression',
        name: 'Exponential Regression Chart',
      },
      {
        key: 'scatter',
        name: 'Scatter Plot',
        icon: <ScatterChart size={16} />,
      },
    ],
  },
  {
    id: 9,
    key: 'polynomial_regression',
    chanage_to: [
      {
        key: 'linear_regression',
        name: 'Linear Regression Chart',
      },
      {
        key: 'exponential_regression',
        name: 'Exponential Regression Chart',
      },
      {
        key: 'scatter',
        name: 'Scatter Plot',
        icon: <ScatterChart size={16} />,
      },
    ],
  },
  {
    id: 10,
    key: 'exponential_regression',
    chanage_to: [
      {
        key: 'linear_regression',
        name: 'Linear Regression Chart',
      },
      {
        key: 'polynomial_regression',
        name: 'Polynomial Regression Chart',
      },
      {
        key: 'scatter',
        name: 'Scatter Plot',
        icon: <ScatterChart size={16} />,
      },
    ],
  },
  {
    id: 11,
    key: 'heatmap',
    chanage_to: [
      {
        key: 'stacked_line',
        name: 'Stacked Line Chart',
      },
    ],
  },
  {
    id: 12,
    key: 'stacked_line',
    chanage_to: [
      {
        key: 'heatmap',
        name: 'Heatmap Plot',
      },
    ],
  },
];

export const PlotOptions = [
  {
    id: 1,
    key: 'bar',
    plot_options: ['average', 'sum', 'min', 'max'],
  },
  {
    id: 2,
    key: 'line',
    plot_options: ['average', 'sum', 'min', 'max'],
  },
  {
    id: 3,
    key: 'area',
    plot_options: ['average', 'sum', 'min', 'max'],
  },
  {
    id: 4,
    key: 'scatter',
    plot_options: [],
  },
  {
    id: 5,
    key: 'pie',
    plot_options: ['average', 'sum', 'min', 'max'],
  },
  {
    id: 6,
    key: 'doughnut',
    plot_options: ['average', 'sum', 'min', 'max'],
  },
  {
    id: 7,
    key: 'customized_pie',
    plot_options: ['average', 'sum', 'min', 'max'],
  },
  {
    id: 8,
    key: 'linear_regression',
    plot_options: [],
  },
  {
    id: 9,
    key: 'polynomial_regression',
    plot_options: [],
  },
  {
    id: 10,
    key: 'exponential_regression',
    plot_options: [],
  },
  {
    id: 11,
    key: 'correlation',
    plot_options: ['kendall', 'pearson', 'spearman'],
  },
  {
    id: 12,
    key: 'heatmap',
    plot_options: ['average', 'sum', 'min', 'max'],
  },
  {
    id: 13,
    key: 'stacked_line',
    plot_options: ['average', 'sum', 'min', 'max'],
  },
];
