import React from 'react';
import ReactECharts from 'echarts-for-react';

interface AreaChartProps {
  xAxisData: string[];
  yAxisData?: number[];
  xLabel?: string;
  yLabel?: string;
  plotoption?: string;
  color?: string;
}

const AreaChart: React.FC<AreaChartProps> = ({
  xAxisData,
  yAxisData,
  xLabel,
  yLabel,
  plotoption,
  color,
}) => {
  const option = {
    // title: {
    //   text: 'Area Chart Example',
    // },
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      // left: '20%',
      // right: '20%',
      // bottom: '20%',
      // top: '20%',
      show: false,
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
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
        type: 'line',
        stack: 'total',
        areaStyle: {},
        data: yAxisData,
        itemStyle: {
          color: color?color:'#E11D4890',
        },
      },
    ],
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <ReactECharts option={option} className="h-full w-full" />
    </div>
  );
};

export default AreaChart;
