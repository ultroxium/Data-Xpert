import React from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import * as ecStat from 'echarts-stat';

interface ClusterPlotChartProps {
  data: any[];
  xLabel?: string;
  yLabel?: string;
}

const ClusterPlot: React.FC<ClusterPlotChartProps> = ({ data, xLabel, yLabel }) => {
  echarts.registerTransform(ecStat["transform"].clustering);

  var pieces = [];
  var COLOR_ALL = ['#E11D48', '#e1ab16', '#37a354', '#b55dba', '#b5bd48', '#8378EA', '#96BFFF'];
  for (var i = 0; i < 5; i++) {
    pieces.push({
      value: i,
      label: 'C- ' + i,
      color: COLOR_ALL[i],
    });
  }
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    grid: {
      // left: '20%',
      // right: '20%',
      // bottom: '20%',
      // top: '20%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {}
      }
    },
    dataset: [
      {
        source: data,
      },
      {
        transform: {
          type: 'ecStat:clustering',
          // print: true,
          config: {
            clusterCount: 5,
            outputType: 'single',
            outputClusterIndexDimension: 2,
          },
        },
      },
    ],
    visualMap: {
      type: 'piecewise',
      top: 'start',
      min: 0,
      max: 5,
      left: 'right',
      splitNumber: 5,
      dimension: 2,
      pieces: pieces,
    },
    xAxis: {
      // type: 'value',
      // min: 'dataMin',
      name: xLabel,
      nameLocation: 'middle',
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        padding: 10,
      },
    },
    yAxis: {
      // type: 'value', e'
      // min: 'dataMin',
      name: yLabel,
      nameLocation: 'end',
      nameTextStyle: {
        fontWeight: 'bold',
        fontSize: 12,
        padding: 10,
      },
    },
    series: {
      type: 'scatter',
      encode: {
        x: 0, // Encoding the x-axis data
        y: 1, // Encoding the y-axis data
        tooltip: [0, 1], // Include both x and y data in tooltip
      },
      symbolSize: 5,
      itemStyle: {
        borderColor: 'none',
      },
      datasetIndex: 1,
    },
    dataZoom: [
      {
        type: 'inside', // Enable zooming using the mouse wheel and dragging
        xAxisIndex: 0, // Apply to the x-axis
        yAxisIndex: 0, // Apply to the y-axis
      },
      // {
      //   type: 'slider', // Enable zooming using a slider
      //   xAxisIndex: 0, // Apply to the x-axis
      //   yAxisIndex: 0, // Apply to the y-axis
      // },
    ],
  };

  return (
    <div className="h-full w-full flex items-center justify-center">
      <ReactECharts option={option} className="h-full w-full" />
    </div>
  );
};

export default ClusterPlot;
