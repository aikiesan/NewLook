'use client';

import { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Municipality } from '@/services/analysisApi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TopMunicipalitiesChartProps {
  data: Municipality[];
  title?: string;
  loading?: boolean;
  maxItems?: number;
}

export default function TopMunicipalitiesChart({
  data,
  title = 'Top Municípios por Potencial de Biogás',
  loading = false,
  maxItems = 10
}: TopMunicipalitiesChartProps) {
  // Prepare chart data
  const chartData: ChartData<'bar'> = {
    labels: data.slice(0, maxItems).map(m => m.municipality_name),
    datasets: [
      {
        label: 'Biogás (m³/ano)',
        data: data.slice(0, maxItems).map(m => m.biogas_m3_year),
        backgroundColor: 'rgba(34, 197, 94, 0.7)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
            const value = context.parsed.x;
            if (value >= 1000000) {
              return `${(value / 1000000).toFixed(2)} milhões m³/ano`;
            } else if (value >= 1000) {
              return `${(value / 1000).toFixed(2)} mil m³/ano`;
            }
            return `${value.toFixed(2)} m³/ano`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Potencial de Biogás (m³/ano)',
          color: '#6B7280',
          font: {
            size: 11
          }
        },
        ticks: {
          callback: (value) => {
            const num = Number(value);
            if (num >= 1000000) {
              return `${(num / 1000000).toFixed(1)}M`;
            } else if (num >= 1000) {
              return `${(num / 1000).toFixed(0)}k`;
            }
            return num.toString();
          },
          color: '#6B7280',
          font: {
            size: 10
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      y: {
        ticks: {
          color: '#374151',
          font: {
            size: 11
          }
        },
        grid: {
          display: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
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
      <div className="h-[400px]">
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}
