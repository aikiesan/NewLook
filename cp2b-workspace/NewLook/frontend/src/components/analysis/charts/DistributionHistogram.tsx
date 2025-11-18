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
            return `${context.parsed.y ?? 0} município(s)`;
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
      <div className="bg-white rounded-xl shadow-md p-6 h-[450px] flex items-center justify-center border border-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-600 font-medium">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (!histogram || histogram.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 h-[450px] flex items-center justify-center border border-gray-100">
        <div className="text-center">
          <div className="text-4xl mb-3">📈</div>
          <span className="text-sm text-gray-500">Nenhum dado disponível</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
      <div className="h-[320px]">
        <Bar data={chartData} options={options} />
      </div>

      {/* Statistics Summary */}
      <div className="mt-5 pt-5 border-t border-gray-200">
        <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          Estatísticas da Distribuição
        </h4>
        <div className="grid grid-cols-3 gap-3 text-xs">
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-3 border border-blue-100">
            <span className="text-gray-600 block mb-1">Média</span>
            <span className="font-bold text-blue-900 text-base">
              {(statistics.mean / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-3 border border-purple-100">
            <span className="text-gray-600 block mb-1">Mediana</span>
            <span className="font-bold text-purple-900 text-base">
              {(statistics.median / 1000000).toFixed(2)}M
            </span>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-3 border border-orange-100">
            <span className="text-gray-600 block mb-1">Desvio Padrão</span>
            <span className="font-bold text-orange-900 text-base">
              {(statistics.std / 1000000).toFixed(2)}M
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
