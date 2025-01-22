import React from 'react';
import ReactECharts from 'echarts-for-react';
import { EChartsOption } from 'echarts';

interface BarChartProps {
  xAxisData: string[];
  yAxisData?: number[];
  xLabel?: string;
  yLabel?: string;
  plotoption?: string;
  color?: string;
}

const BarChart: React.FC<BarChartProps> = ({
  xAxisData,
  yAxisData,
  xLabel,
  yLabel,
  plotoption,
  color,
}) => {
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    grid: {
      // left: '20%',
      // right: '20%',
      // bottom: '20%',
      // top: '20%',
      show: false,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
      name: xLabel,
      nameLocation: 'middle',
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        padding: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: yLabel ? yLabel + `(${plotoption})` : xLabel + `(${plotoption})`,
      nameLocation: 'end',
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        padding: 10,
      },
    },
    series: [
      {
        name: '',
        type: 'bar',
        data: yAxisData,
        itemStyle: {
          color: color? color :'#E11D4890',
        },
      },
    ],
  };

  return (
    <div className="h-full w-full flex items-center justify-center ">
      <ReactECharts option={option} className="h-full w-full" />
    </div>
  );
};

export default BarChart;
