'use client';

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
import { HistogramBin, DistributionStatistics } from '@/services/analysisApi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DistributionHistogramProps {
  histogram: HistogramBin[];
  statistics: DistributionStatistics;
  title?: string;
  loading?: boolean;
}

export default function DistributionHistogram({
  histogram,
  statistics,
  title = 'Distribuição de Potencial de Biogás',
  loading = false
}: DistributionHistogramProps) {
  // Prepare chart data
  const chartData: ChartData<'bar'> = {
    labels: histogram.map(bin => bin.label),
    datasets: [
      {
        label: 'Número de Municípios',
        data: histogram.map(bin => bin.count),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      }
    ]
  };

  const options: ChartOptions<'bar'> = {
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
          title: (tooltipItems) => {
            const index = tooltipItems[0].dataIndex;
            const bin = histogram[index];
            return `${(bin.bin_start / 1000000).toFixed(2)} - ${(bin.bin_end / 1000000).toFixed(2)} milhões m³/ano`;
          },
          label: (context) => {
            return `${context.parsed.y} município(s)`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Faixa de Potencial (milhões m³/ano)',
          color: '#6B7280',
          font: {
            size: 11
          }
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 9
          },
          maxRotation: 45,
          minRotation: 45
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Número de Municípios',
          color: '#6B7280',
          font: {
            size: 11
          }
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 10
          },
          stepSize: 1
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (!histogram || histogram.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 h-[400px] flex items-center justify-center">
        <span className="text-sm text-gray-500">Nenhum dado disponível</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="h-[300px]">
        <Bar data={chartData} options={options} />
      </div>

      {/* Statistics Summary */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase">Estatísticas</h4>
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500 block">Média</span>
            <span className="font-semibold text-gray-800">
              {(statistics.mean / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500 block">Mediana</span>
            <span className="font-semibold text-gray-800">
              {(statistics.median / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <span className="text-gray-500 block">Desvio Padrão</span>
            <span className="font-semibold text-gray-800">
              {(statistics.std / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
