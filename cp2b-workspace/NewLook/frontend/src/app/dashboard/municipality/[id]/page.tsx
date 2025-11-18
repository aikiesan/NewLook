'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Users, Factory, Leaf, TrendingUp, DollarSign, GitCompare } from 'lucide-react';
import { useComparison } from '@/contexts/ComparisonContext';

interface MunicipalityDetail {
  id: number;
  municipality_name: string;
  ibge_code: string | null;
  area_km2: number | null;
  population_density: number | null;

  // Main sectors
  total_biogas_m3_year: number;
  total_biogas_m3_day: number;
  urban_biogas_m3_year: number;
  agricultural_biogas_m3_year: number;
  livestock_biogas_m3_year: number;

  // Urban waste detail
  rsu_biogas_m3_year: number;
  rpo_biogas_m3_year: number;

  // Agricultural substrates
  sugarcane_biogas_m3_year: number;
  soybean_biogas_m3_year: number;
  corn_biogas_m3_year: number;
  coffee_biogas_m3_year: number;
  citrus_biogas_m3_year: number;

  // Livestock substrates
  cattle_biogas_m3_year: number;
  swine_biogas_m3_year: number;
  poultry_biogas_m3_year: number;
  aquaculture_biogas_m3_year: number;

  // Energy and environmental
  energy_potential_kwh_day: number;
  energy_potential_mwh_year: number;
  co2_reduction_tons_year: number;

  // Population
  population: number | null;
  urban_population: number | null;
  rural_population: number | null;

  // Economic
  gdp_total: number | null;
  gdp_per_capita: number | null;

  // Location
  centroid: any;
  administrative_region: string | null;
  immediate_region: string | null;
  intermediate_region: string | null;
}

export default function MunicipalityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addMunicipality, removeMunicipality, isSelected } = useComparison();
  const [municipality, setMunicipality] = useState<MunicipalityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMunicipalityDetail = async () => {
      try {
        setLoading(true);

        // Determine API URL based on environment
        const apiUrl = process.env.NODE_ENV === 'production'
          ? 'https://newlook-production.up.railway.app'
          : 'http://localhost:8000';

        const response = await fetch(`${apiUrl}/api/v1/geospatial/municipalities/${params.id}`);

        if (!response.ok) {
          throw new Error('Municipality not found');
        }

        const data = await response.json();
        setMunicipality(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load municipality data');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchMunicipalityDetail();
    }
  }, [params.id]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do município...</p>
        </div>
      </div>
    );
  }

  if (error || !municipality) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Município não encontrado'}</p>
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

  // Calculate percentages for sectors
  const totalBiogas = municipality.total_biogas_m3_year;
  const agriculturalPercent = totalBiogas > 0 ? (municipality.agricultural_biogas_m3_year / totalBiogas * 100) : 0;
  const livestockPercent = totalBiogas > 0 ? (municipality.livestock_biogas_m3_year / totalBiogas * 100) : 0;
  const urbanPercent = totalBiogas > 0 ? (municipality.urban_biogas_m3_year / totalBiogas * 100) : 0;

  const municipalityInComparison = isSelected(municipality.id);

  const handleToggleComparison = () => {
    if (municipalityInComparison) {
      removeMunicipality(municipality.id);
    } else {
      addMunicipality({
        id: municipality.id,
        name: municipality.municipality_name,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
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

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{municipality.municipality_name}</h1>
              <p className="text-gray-600 mt-1">
                {municipality.administrative_region && `${municipality.administrative_region} | `}
                IBGE: {municipality.ibge_code || 'N/A'}
              </p>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600">Potencial Total de Biogás</p>
              <p className="text-2xl font-bold text-green-600">
                {formatNumber(municipality.total_biogas_m3_year)} m³/ano
              </p>

              <button
                onClick={handleToggleComparison}
                className={`mt-3 flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  municipalityInComparison
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50'
                }`}
              >
                <GitCompare className="h-4 w-4" />
                {municipalityInComparison ? 'Na Comparação' : 'Adicionar à Comparação'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Population Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">População</h3>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(municipality.population)}</p>
            <div className="mt-2 text-sm text-gray-600">
              <p>Urbana: {formatNumber(municipality.urban_population)}</p>
              <p>Rural: {formatNumber(municipality.rural_population)}</p>
            </div>
          </div>

          {/* Energy Potential Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Factory className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Potencial Energético</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(municipality.energy_potential_mwh_year)}
            </p>
            <p className="text-sm text-gray-600 mt-2">MWh/ano</p>
          </div>

          {/* CO2 Reduction Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <Leaf className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Redução de CO₂</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatNumber(municipality.co2_reduction_tons_year)}
            </p>
            <p className="text-sm text-gray-600 mt-2">toneladas/ano</p>
          </div>

          {/* Geographic Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <MapPin className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Área e Densidade</h3>
            <p className="text-2xl font-bold text-gray-900">
              {formatDecimal(municipality.area_km2, 0)} km²
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Densidade: {formatDecimal(municipality.population_density, 1)} hab/km²
            </p>
          </div>
        </div>

        {/* Sector Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Distribuição por Setor</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Agricultural */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-700">Agrícola</h3>
                <span className="text-sm text-gray-600">{formatDecimal(agriculturalPercent, 1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${agriculturalPercent}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(municipality.agricultural_biogas_m3_year)} m³/ano
              </p>
            </div>

            {/* Livestock */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-700">Pecuária</h3>
                <span className="text-sm text-gray-600">{formatDecimal(livestockPercent, 1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-amber-600 h-2 rounded-full transition-all"
                  style={{ width: `${livestockPercent}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(municipality.livestock_biogas_m3_year)} m³/ano
              </p>
            </div>

            {/* Urban */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-700">Urbano</h3>
                <span className="text-sm text-gray-600">{formatDecimal(urbanPercent, 1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${urbanPercent}%` }}
                ></div>
              </div>
              <p className="text-lg font-bold text-gray-900">
                {formatNumber(municipality.urban_biogas_m3_year)} m³/ano
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Substrates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Agricultural Substrates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Leaf className="h-6 w-6 mr-2 text-green-600" />
              Substratos Agrícolas
            </h2>
            <div className="space-y-3">
              <SubstrateRow label="Cana-de-açúcar" value={municipality.sugarcane_biogas_m3_year} formatNumber={formatNumber} />
              <SubstrateRow label="Soja" value={municipality.soybean_biogas_m3_year} formatNumber={formatNumber} />
              <SubstrateRow label="Milho" value={municipality.corn_biogas_m3_year} formatNumber={formatNumber} />
              <SubstrateRow label="Café" value={municipality.coffee_biogas_m3_year} formatNumber={formatNumber} />
              <SubstrateRow label="Citrus" value={municipality.citrus_biogas_m3_year} formatNumber={formatNumber} />
            </div>
          </div>

          {/* Livestock Substrates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Factory className="h-6 w-6 mr-2 text-amber-600" />
              Substratos Pecuários
            </h2>
            <div className="space-y-3">
              <SubstrateRow label="Gado" value={municipality.cattle_biogas_m3_year} formatNumber={formatNumber} />
              <SubstrateRow label="Suínos" value={municipality.swine_biogas_m3_year} formatNumber={formatNumber} />
              <SubstrateRow label="Aves" value={municipality.poultry_biogas_m3_year} formatNumber={formatNumber} />
              <SubstrateRow label="Aquacultura" value={municipality.aquaculture_biogas_m3_year} formatNumber={formatNumber} />
            </div>
          </div>
        </div>

        {/* Urban Waste Detail */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
            Resíduos Urbanos
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SubstrateRow label="RSU (Resíduos Sólidos Urbanos)" value={municipality.rsu_biogas_m3_year} formatNumber={formatNumber} />
            <SubstrateRow label="RPO (Resíduos Orgânicos)" value={municipality.rpo_biogas_m3_year} formatNumber={formatNumber} />
          </div>
        </div>

        {/* Economic Data */}
        {(municipality.gdp_total || municipality.gdp_per_capita) && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="h-6 w-6 mr-2 text-green-600" />
              Dados Econômicos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {municipality.gdp_total && (
                <div>
                  <p className="text-sm text-gray-600">PIB Total</p>
                  <p className="text-lg font-bold text-gray-900">R$ {formatNumber(municipality.gdp_total)}</p>
                </div>
              )}
              {municipality.gdp_per_capita && (
                <div>
                  <p className="text-sm text-gray-600">PIB per Capita</p>
                  <p className="text-lg font-bold text-gray-900">R$ {formatDecimal(municipality.gdp_per_capita, 2)}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for substrate rows
interface SubstrateRowProps {
  label: string;
  value: number;
  formatNumber: (num: number) => string;
}

function SubstrateRow({ label, value, formatNumber }: SubstrateRowProps) {
  if (value === 0) return null;

  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-gray-700">{label}</span>
      <span className="font-semibold text-gray-900">{formatNumber(value)} m³/ano</span>
    </div>
  );
}
