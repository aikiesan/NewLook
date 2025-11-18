'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { RegionData } from '@/services/analysisApi';

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

interface RegionalPieChartProps {
  data: RegionData[];
  title?: string;
  loading?: boolean;
  maxRegions?: number;
}

// Color palette for regions
const COLORS = [
  'rgba(34, 197, 94, 0.8)',   // Green
  'rgba(59, 130, 246, 0.8)',  // Blue
  'rgba(249, 115, 22, 0.8)',  // Orange
  'rgba(168, 85, 247, 0.8)',  // Purple
  'rgba(236, 72, 153, 0.8)',  // Pink
  'rgba(245, 158, 11, 0.8)',  // Amber
  'rgba(20, 184, 166, 0.8)',  // Teal
  'rgba(99, 102, 241, 0.8)',  // Indigo
  'rgba(239, 68, 68, 0.8)',   // Red
  'rgba(107, 114, 128, 0.8)', // Gray
];

const BORDER_COLORS = [
  'rgba(34, 197, 94, 1)',
  'rgba(59, 130, 246, 1)',
  'rgba(249, 115, 22, 1)',
  'rgba(168, 85, 247, 1)',
  'rgba(236, 72, 153, 1)',
  'rgba(245, 158, 11, 1)',
  'rgba(20, 184, 166, 1)',
  'rgba(99, 102, 241, 1)',
  'rgba(239, 68, 68, 1)',
  'rgba(107, 114, 128, 1)',
];

export default function RegionalPieChart({
  data,
  title = 'Distribuição Regional',
  loading = false,
  maxRegions = 8
}: RegionalPieChartProps) {
  // Process data - group smaller regions into "Outros"
  let processedData = [...data];
  if (data.length > maxRegions) {
    const topRegions = data.slice(0, maxRegions - 1);
    const othersTotal = data.slice(maxRegions - 1).reduce((sum, r) => sum + r.biogas_m3_year, 0);
    const othersPercentage = data.slice(maxRegions - 1).reduce((sum, r) => sum + r.percentage, 0);
    processedData = [
      ...topRegions,
      { region: 'Outros', biogas_m3_year: othersTotal, percentage: othersPercentage }
    ];
  }

  // Prepare chart data
  const chartData: ChartData<'doughnut'> = {
    labels: processedData.map(r => r.region),
    datasets: [
      {
        data: processedData.map(r => r.biogas_m3_year),
        backgroundColor: COLORS.slice(0, processedData.length),
        borderColor: BORDER_COLORS.slice(0, processedData.length),
        borderWidth: 2,
      }
    ]
  };

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '50%',
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 11
          },
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels && data.datasets[0].data) {
              return data.labels.map((label, i) => ({
                text: `${label} (${processedData[i]?.percentage.toFixed(1)}%)`,
                fillStyle: COLORS[i],
                strokeStyle: BORDER_COLORS[i],
                lineWidth: 2,
                hidden: false,
                index: i,
                pointStyle: 'circle'
              }));
            }
            return [];
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 14,
          weight: 'bold'
        },
        color: '#374151'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed;
            const label = context.label || '';
            const percentage = processedData[context.dataIndex]?.percentage || 0;

            if (value >= 1000000) {
              return `${label}: ${(value / 1000000).toFixed(2)}M m³/ano (${percentage.toFixed(1)}%)`;
            } else if (value >= 1000) {
              return `${label}: ${(value / 1000).toFixed(2)}k m³/ano (${percentage.toFixed(1)}%)`;
            }
            return `${label}: ${value.toFixed(2)} m³/ano (${percentage.toFixed(1)}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-[400px] flex items-center justify-center">
        <span className="text-sm text-gray-500">Nenhum dado disponível</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="h-[350px]">
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
