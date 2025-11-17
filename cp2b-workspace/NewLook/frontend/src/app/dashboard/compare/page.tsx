'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MunicipalityData {
  id: number;
  municipality_name: string;
  ibge_code: string | null;
  total_biogas_m3_year: number;
  urban_biogas_m3_year: number;
  agricultural_biogas_m3_year: number;
  livestock_biogas_m3_year: number;
  energy_potential_mwh_year: number;
  co2_reduction_tons_year: number;
  population: number | null;
  area_km2: number | null;
  population_density: number | null;
  administrative_region: string | null;
}

export default function ComparePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [municipalities, setMunicipalities] = useState<MunicipalityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMunicipalities = async () => {
      try {
        const idsParam = searchParams.get('ids');
        if (!idsParam) {
          router.push('/dashboard');
          return;
        }

        const ids = idsParam.split(',').map((id) => parseInt(id.trim()));

        if (ids.length < 2) {
          setError('Selecione pelo menos 2 municípios para comparar');
          return;
        }

        setLoading(true);

        // Determine API URL based on environment
        const apiUrl = process.env.NODE_ENV === 'production'
          ? 'https://newlook-production.up.railway.app'
          : 'http://localhost:8000';

        // Fetch all municipalities in parallel
        const promises = ids.map((id) =>
          fetch(`${apiUrl}/api/v1/geospatial/municipalities/${id}`).then((res) => {
            if (!res.ok) throw new Error(`Municipality ${id} not found`);
            return res.json();
          })
        );

        const data = await Promise.all(promises);
        setMunicipalities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load municipalities');
      } finally {
        setLoading(false);
      }
    };

    fetchMunicipalities();
  }, [searchParams, router]);

  const formatNumber = (num: number | null | undefined): string => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR').format(Math.round(num));
  };

  const formatDecimal = (num: number | null | undefined, decimals: number = 2): string => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const getComparisonIcon = (values: number[], index: number) => {
    const value = values[index];
    const max = Math.max(...values);
    const min = Math.min(...values);

    if (value === max && max !== min) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (value === min && max !== min) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando comparação...</p>
        </div>
      </div>
    );
  }

  if (error || municipalities.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Nenhum município encontrado'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Voltar ao Dashboard
          </button>

          <h1 className="text-3xl font-bold text-gray-900">
            Comparação de Municípios
          </h1>
          <p className="text-gray-600 mt-1">
            Comparando {municipalities.length} municípios
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Comparison Table */}
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="sticky left-0 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider z-10">
                  Indicador
                </th>
                {municipalities.map((m) => (
                  <th
                    key={m.id}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="font-bold text-gray-900">{m.municipality_name}</div>
                    <div className="font-normal text-gray-500 normal-case">
                      IBGE: {m.ibge_code || 'N/A'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* Location */}
              <ComparisonRow
                label="Região Administrativa"
                values={municipalities.map((m) => m.administrative_region || 'N/A')}
                isNumeric={false}
              />

              {/* Geographic */}
              <ComparisonRow
                label="Área (km²)"
                values={municipalities.map((m) => formatDecimal(m.area_km2, 0))}
                numericValues={municipalities.map((m) => m.area_km2 || 0)}
                getComparisonIcon={getComparisonIcon}
              />

              <ComparisonRow
                label="População"
                values={municipalities.map((m) => formatNumber(m.population))}
                numericValues={municipalities.map((m) => m.population || 0)}
                getComparisonIcon={getComparisonIcon}
              />

              <ComparisonRow
                label="Densidade Populacional (hab/km²)"
                values={municipalities.map((m) => formatDecimal(m.population_density, 1))}
                numericValues={municipalities.map((m) => m.population_density || 0)}
                getComparisonIcon={getComparisonIcon}
              />

              {/* Biogas Potential */}
              <tr className="bg-green-50">
                <td colSpan={municipalities.length + 1} className="px-6 py-2 text-sm font-bold text-green-900">
                  POTENCIAL DE BIOGÁS
                </td>
              </tr>

              <ComparisonRow
                label="Potencial Total (m³/ano)"
                values={municipalities.map((m) => formatNumber(m.total_biogas_m3_year))}
                numericValues={municipalities.map((m) => m.total_biogas_m3_year)}
                getComparisonIcon={getComparisonIcon}
                highlight
              />

              <ComparisonRow
                label="Biogás Agrícola (m³/ano)"
                values={municipalities.map((m) => formatNumber(m.agricultural_biogas_m3_year))}
                numericValues={municipalities.map((m) => m.agricultural_biogas_m3_year)}
                getComparisonIcon={getComparisonIcon}
              />

              <ComparisonRow
                label="Biogás Pecuário (m³/ano)"
                values={municipalities.map((m) => formatNumber(m.livestock_biogas_m3_year))}
                numericValues={municipalities.map((m) => m.livestock_biogas_m3_year)}
                getComparisonIcon={getComparisonIcon}
              />

              <ComparisonRow
                label="Biogás Urbano (m³/ano)"
                values={municipalities.map((m) => formatNumber(m.urban_biogas_m3_year))}
                numericValues={municipalities.map((m) => m.urban_biogas_m3_year)}
                getComparisonIcon={getComparisonIcon}
              />

              {/* Energy and Environmental */}
              <tr className="bg-yellow-50">
                <td colSpan={municipalities.length + 1} className="px-6 py-2 text-sm font-bold text-yellow-900">
                  POTENCIAL ENERGÉTICO E AMBIENTAL
                </td>
              </tr>

              <ComparisonRow
                label="Potencial Energético (MWh/ano)"
                values={municipalities.map((m) => formatNumber(m.energy_potential_mwh_year))}
                numericValues={municipalities.map((m) => m.energy_potential_mwh_year)}
                getComparisonIcon={getComparisonIcon}
              />

              <ComparisonRow
                label="Redução de CO₂ (ton/ano)"
                values={municipalities.map((m) => formatNumber(m.co2_reduction_tons_year))}
                numericValues={municipalities.map((m) => m.co2_reduction_tons_year)}
                getComparisonIcon={getComparisonIcon}
              />
            </tbody>
          </table>
        </div>

        {/* Individual Links */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {municipalities.map((m) => (
            <button
              key={m.id}
              onClick={() => router.push(`/dashboard/municipality/${m.id}`)}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
            >
              <p className="font-medium text-gray-900">{m.municipality_name}</p>
              <p className="text-sm text-green-600 mt-1">Ver detalhes completos →</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper component for comparison rows
interface ComparisonRowProps {
  label: string;
  values: (string | number)[];
  numericValues?: number[];
  getComparisonIcon?: (values: number[], index: number) => React.ReactNode;
  isNumeric?: boolean;
  highlight?: boolean;
}

function ComparisonRow({
  label,
  values,
  numericValues,
  getComparisonIcon,
  isNumeric = true,
  highlight = false,
}: ComparisonRowProps) {
  return (
    <tr className={highlight ? 'bg-green-50' : ''}>
      <td className={`sticky left-0 ${highlight ? 'bg-green-50' : 'bg-white'} px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 z-10`}>
        {label}
      </td>
      {values.map((value, index) => (
        <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
          <div className="flex items-center gap-2">
            {numericValues && getComparisonIcon && getComparisonIcon(numericValues, index)}
            <span className={highlight ? 'font-bold text-green-900' : ''}>{value}</span>
          </div>
        </td>
      ))}
    </tr>
  );
}
