/**
 * PILAR-2b V3 - References API Service
 * API calls for unified references and FDE factor references from Supabase
 */

import { createClient } from '@supabase/supabase-js'
import {
  UnifiedReference,
  ReferenceWithResidue,
  FatorCompeticao,
  FatorColetaPrazo,
  FatorSazonalidade,
  FatorLogistica,
  FDEBreakdownWithReferences,
  ReferenceStatistics,
  ReferencesResponse,
  FDEFactorsResponse,
  ReferenceSearchFilters,
  FDEFactorType
} from '@/types/references'
import { logger } from '@/lib/logger'

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ==========================================
// UNIFIED REFERENCES API
// ==========================================

/**
 * Get all references for a specific residue
 */
export async function getReferencesForResidue(
  codigoResidue: string
): Promise<UnifiedReference[]> {
  try {
    const { data, error } = await supabase
      .from('referencias_unificadas')
      .select('*')
      .eq('codigo_residuo', codigoResidue)
      .order('ano', { ascending: false })

    if (error) {
      logger.error('Error fetching references for residue:', error)
      return []
    }

    return data || []
  } catch (error) {
    logger.error('Error in getReferencesForResidue:', error)
    return []
  }
}

/**
 * Get references with residue details (joined query)
 */
export async function getReferencesWithResidueDetails(
  codigoResidue?: string
): Promise<ReferenceWithResidue[]> {
  try {
    let query = supabase
      .from('referencias_unificadas')
      .select(`
        *,
        residuos_cp2b (
          codigo,
          residuo,
          setor,
          classificacao
        )
      `)
      .order('ano', { ascending: false })

    if (codigoResidue) {
      query = query.eq('codigo_residuo', codigoResidue)
    }

    const { data, error } = await query

    if (error) {
      logger.error('Error fetching references with residue details:', error)
      return []
    }

    // Transform joined data
    const references: ReferenceWithResidue[] = (data || []).map((item: any) => ({
      ...item,
      residuo_nome: item.residuos_cp2b?.residuo,
      residuo_setor: item.residuos_cp2b?.setor,
      residuo_classificacao: item.residuos_cp2b?.classificacao
    }))

    return references
  } catch (error) {
    logger.error('Error in getReferencesWithResidueDetails:', error)
    return []
  }
}

/**
 * Search references with filters
 */
export async function searchReferences(
  filters: ReferenceSearchFilters
): Promise<ReferencesResponse> {
  try {
    let query = supabase.from('referencias_unificadas').select('*', { count: 'exact' })

    // Apply filters
    if (filters.codigo_residuo) {
      query = query.eq('codigo_residuo', filters.codigo_residuo)
    }

    if (filters.parametro) {
      query = query.eq('parametro_relacionado', filters.parametro)
    }

    if (filters.validation_status) {
      query = query.eq('validation_status', filters.validation_status)
    }

    if (filters.fonte) {
      query = query.eq('fonte', filters.fonte)
    }

    if (filters.ano_min) {
      query = query.gte('ano', filters.ano_min)
    }

    if (filters.ano_max) {
      query = query.lte('ano', filters.ano_max)
    }

    if (filters.tem_doi !== undefined) {
      if (filters.tem_doi) {
        query = query.not('doi', 'is', null)
      } else {
        query = query.is('doi', null)
      }
    }

    query = query.order('ano', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      logger.error('Error searching references:', error)
      return { references: [], total: 0 }
    }

    return {
      references: data || [],
      total: count || 0
    }
  } catch (error) {
    logger.error('Error in searchReferences:', error)
    return { references: [], total: 0 }
  }
}

/**
 * Get reference statistics for a residue
 */
export async function getReferenceStatistics(
  codigoResidue: string
): Promise<ReferenceStatistics | null> {
  try {
    const references = await getReferencesForResidue(codigoResidue)

    if (references.length === 0) {
      return null
    }

    // Calculate statistics
    const validatedRefs = references.filter(
      (r) => r.validation_status === 'VALIDATED'
    ).length

    const refsWithDOI = references.filter((r) => r.doi && r.doi.trim() !== '').length

    const years = references
      .map((r) => r.ano)
      .filter((ano): ano is number => ano !== null && ano !== undefined)
      .sort()

    const parametros = Array.from(
      new Set(
        references
          .map((r) => r.parametro_relacionado)
          .filter((p): p is string => p !== null && p !== undefined)
      )
    )

    const fontes = Array.from(
      new Set(
        references
          .map((r) => r.fonte)
          .filter((f): f is 'CP2B' | 'WEBAPP' | 'LITERATURA' | 'MANUAL' => f !== null && f !== undefined)
      )
    )

    return {
      codigo_residuo: codigoResidue,
      total_referencias: references.length,
      referencias_validadas: validatedRefs,
      referencias_com_doi: refsWithDOI,
      anos_cobertura: years,
      parametros_cobertos: parametros,
      fontes_utilizadas: fontes
    }
  } catch (error) {
    logger.error('Error calculating reference statistics:', error)
    return null
  }
}

// ==========================================
// FDE FACTOR REFERENCES API
// ==========================================

/**
 * Get Fator de Competição for a residue
 */
export async function getFatorCompeticao(
  codigoResidue: string
): Promise<FatorCompeticao | null> {
  try {
    const { data, error } = await supabase
      .from('fator_competicao')
      .select('*')
      .eq('codigo_residuo', codigoResidue)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      logger.error('Error fetching fator_competicao:', error)
      return null
    }

    return data ? { ...data, factor_type: 'FC' as const } : null
  } catch (error) {
    logger.error('Error in getFatorCompeticao:', error)
    return null
  }
}

/**
 * Get Fator de Coleta e Prazo for a residue
 */
export async function getFatorColetaPrazo(
  codigoResidue: string
): Promise<FatorColetaPrazo | null> {
  try {
    const { data, error } = await supabase
      .from('fator_coleta_prazo')
      .select('*')
      .eq('codigo_residuo', codigoResidue)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logger.error('Error fetching fator_coleta_prazo:', error)
      return null
    }

    return data ? { ...data, factor_type: 'FCP' as const } : null
  } catch (error) {
    logger.error('Error in getFatorColetaPrazo:', error)
    return null
  }
}

/**
 * Get Fator de Sazonalidade for a residue
 */
export async function getFatorSazonalidade(
  codigoResidue: string
): Promise<FatorSazonalidade | null> {
  try {
    const { data, error } = await supabase
      .from('fator_sazonalidade')
      .select('*')
      .eq('codigo_residuo', codigoResidue)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logger.error('Error fetching fator_sazonalidade:', error)
      return null
    }

    return data ? { ...data, factor_type: 'FS' as const } : null
  } catch (error) {
    logger.error('Error in getFatorSazonalidade:', error)
    return null
  }
}

/**
 * Get Fator de Logística for a residue
 */
export async function getFatorLogistica(
  codigoResidue: string
): Promise<FatorLogistica | null> {
  try {
    const { data, error } = await supabase
      .from('fator_logistica')
      .select('*')
      .eq('codigo_residuo', codigoResidue)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      logger.error('Error fetching fator_logistica:', error)
      return null
    }

    return data ? { ...data, factor_type: 'FL' as const } : null
  } catch (error) {
    logger.error('Error in getFatorLogistica:', error)
    return null
  }
}

/**
 * Get all FDE factors for a residue
 */
export async function getAllFDEFactors(
  codigoResidue: string
): Promise<FDEFactorsResponse> {
  try {
    const [fc, fcp, fs, fl] = await Promise.all([
      getFatorCompeticao(codigoResidue),
      getFatorColetaPrazo(codigoResidue),
      getFatorSazonalidade(codigoResidue),
      getFatorLogistica(codigoResidue)
    ])

    return {
      fator_competicao: fc || undefined,
      fator_coleta_prazo: fcp || undefined,
      fator_sazonalidade: fs || undefined,
      fator_logistica: fl || undefined
    }
  } catch (error) {
    logger.error('Error in getAllFDEFactors:', error)
    return {}
  }
}

/**
 * Get complete FDE breakdown with all factors and references
 */
export async function getFDEBreakdown(
  codigoResidue: string
): Promise<FDEBreakdownWithReferences | null> {
  try {
    // Fetch residue data
    const { data: residueData, error: residueError } = await supabase
      .from('residuos_cp2b')
      .select('codigo, residuo, fde, classificacao')
      .eq('codigo', codigoResidue)
      .single()

    if (residueError || !residueData) {
      logger.error('Error fetching residue data:', residueError)
      return null
    }

    // Fetch all factors and references in parallel
    const [factors, references] = await Promise.all([
      getAllFDEFactors(codigoResidue),
      getReferencesForResidue(codigoResidue)
    ])

    // Ensure we have all required factors
    if (!factors.fator_competicao ||
        !factors.fator_coleta_prazo ||
        !factors.fator_sazonalidade ||
        !factors.fator_logistica) {
      logger.warn(`Missing FDE factors for residue: ${codigoResidue}`)
      return null
    }

    return {
      codigo_residuo: residueData.codigo,
      residuo_nome: residueData.residuo,
      fde_final: residueData.fde || 0,
      fde_classificacao: residueData.classificacao || 'N/A',
      fator_competicao: factors.fator_competicao,
      fator_coleta_prazo: factors.fator_coleta_prazo,
      fator_sazonalidade: factors.fator_sazonalidade,
      fator_logistica: factors.fator_logistica,
      fde_formula: 'FDE = (1 - FC) × FCP × FS × FL',
      referencias_gerais: references
    }
  } catch (error) {
    logger.error('Error in getFDEBreakdown:', error)
    return null
  }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

/**
 * Get all unique parameter types from references
 */
export async function getAvailableParameters(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('referencias_unificadas')
      .select('parametro_relacionado')
      .not('parametro_relacionado', 'is', null)

    if (error) {
      logger.error('Error fetching parameters:', error)
      return []
    }

    const parameters = Array.from(
      new Set(
        data
          .map((item) => item.parametro_relacionado)
          .filter((p): p is string => p !== null)
      )
    )

    return parameters.sort()
  } catch (error) {
    logger.error('Error in getAvailableParameters:', error)
    return []
  }
}

/**
 * Get references count by year
 */
export async function getReferencesCountByYear(): Promise<Record<number, number>> {
  try {
    const { data, error } = await supabase
      .from('referencias_unificadas')
      .select('ano')
      .not('ano', 'is', null)

    if (error) {
      logger.error('Error fetching references by year:', error)
      return {}
    }

    const countByYear: Record<number, number> = {}

    data.forEach((item) => {
      if (item.ano) {
        countByYear[item.ano] = (countByYear[item.ano] || 0) + 1
      }
    })

    return countByYear
  } catch (error) {
    logger.error('Error in getReferencesCountByYear:', error)
    return {}
  }
}

/**
 * Get total references count
 */
export async function getTotalReferencesCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('referencias_unificadas')
      .select('*', { count: 'exact', head: true })

    if (error) {
      logger.error('Error counting references:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    logger.error('Error in getTotalReferencesCount:', error)
    return 0
  }
}
