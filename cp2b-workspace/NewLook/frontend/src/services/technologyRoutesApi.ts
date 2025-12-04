/**
 * CP2B Maps V3 - Technology Routes API Service
 * Educational tool for visualizing biogas technology pathways
 * Calculation-free, reference-based learning platform
 */

import type {
  TechnologyCardWithReferences,
  TechnologyCard,
  UserRoute,
  CreateRoutePayload,
  UpdateRoutePayload,
  ConnectionValidationResponse,
} from '@/types/technology-routes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Helper function to get auth headers from Supabase session
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { session } } = await supabase.auth.getSession();

    if (session?.access_token) {
      return {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
    }
  } catch (error) {
    console.error('Failed to get auth headers:', error);
  }

  return {
    'Content-Type': 'application/json',
  };
}

/**
 * Helper function for API calls with error handling
 */
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  console.log(`[TechRoutes API] Calling: ${url}`);

  const headers = await getAuthHeaders();

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    console.log(`[TechRoutes API] Response status: ${response.status}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData.detail || `API error: ${response.status}`;
      console.error(`[TechRoutes API] Error response:`, errorData);
      throw new Error(errorMsg);
    }

    const data = await response.json();
    console.log(`[TechRoutes API] Success:`, data.length, 'items received');
    return data;
  } catch (error) {
    console.error(`[TechRoutes API] Call failed for ${endpoint}:`, error);
    if (error instanceof Error) {
      console.error(`[TechRoutes API] Error details:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    throw error;
  }
}

// ============================================================================
// TECHNOLOGY CARDS API
// ============================================================================

export const technologyRoutesApi = {
  /**
   * Get all technologies with their scientific references
   * Optionally filter by category
   */
  getTechnologies: async (category?: string): Promise<TechnologyCardWithReferences[]> => {
    const params = category ? `?category=${encodeURIComponent(category)}` : '';
    return apiCall<TechnologyCardWithReferences[]>(
      `/api/v1/technology-routes/technologies${params}`
    );
  },

  /**
   * Get a specific technology by ID with its references
   */
  getTechnologyById: async (techId: string): Promise<TechnologyCardWithReferences> => {
    return apiCall<TechnologyCardWithReferences>(
      `/api/v1/technology-routes/technologies/${encodeURIComponent(techId)}`
    );
  },

  /**
   * Create a custom user-defined technology card
   */
  createCustomTechnology: async (data: Partial<TechnologyCard>): Promise<TechnologyCard> => {
    return apiCall<TechnologyCard>(
      '/api/v1/technology-routes/technologies/custom',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a custom technology card (only owner can delete)
   */
  deleteCustomTechnology: async (techId: string): Promise<void> => {
    await apiCall<void>(
      `/api/v1/technology-routes/technologies/custom/${encodeURIComponent(techId)}`,
      {
        method: 'DELETE',
      }
    );
  },

  // ==========================================================================
  // USER ROUTES API
  // ==========================================================================

  /**
   * Get all routes created by the current user
   */
  getUserRoutes: async (): Promise<UserRoute[]> => {
    return apiCall<UserRoute[]>('/api/v1/technology-routes/routes');
  },

  /**
   * Get a specific route by ID (must be owner)
   */
  getRouteById: async (routeId: string): Promise<UserRoute> => {
    return apiCall<UserRoute>(
      `/api/v1/technology-routes/routes/${encodeURIComponent(routeId)}`
    );
  },

  /**
   * Create a new technology route
   */
  createRoute: async (data: CreateRoutePayload): Promise<UserRoute> => {
    return apiCall<UserRoute>(
      '/api/v1/technology-routes/routes',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Update an existing route (must be owner)
   */
  updateRoute: async (
    routeId: string,
    data: UpdateRoutePayload
  ): Promise<UserRoute> => {
    return apiCall<UserRoute>(
      `/api/v1/technology-routes/routes/${encodeURIComponent(routeId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(data),
      }
    );
  },

  /**
   * Delete a route (must be owner)
   */
  deleteRoute: async (routeId: string): Promise<void> => {
    await apiCall<void>(
      `/api/v1/technology-routes/routes/${encodeURIComponent(routeId)}`,
      {
        method: 'DELETE',
      }
    );
  },

  // ==========================================================================
  // PUBLIC SHARING API
  // ==========================================================================

  /**
   * Get public routes (no authentication required)
   */
  getPublicRoutes: async (limit = 20, offset = 0): Promise<UserRoute[]> => {
    return apiCall<UserRoute[]>(
      `/api/v1/technology-routes/public/routes?limit=${limit}&offset=${offset}`
    );
  },

  /**
   * Get a route by its share token (no authentication required)
   */
  getRouteByShareToken: async (shareToken: string): Promise<UserRoute> => {
    return apiCall<UserRoute>(
      `/api/v1/technology-routes/share/${encodeURIComponent(shareToken)}`
    );
  },

  // ==========================================================================
  // VALIDATION API
  // ==========================================================================

  /**
   * Validate if two technologies can be connected
   */
  validateConnection: async (
    sourceTechId: string,
    targetTechId: string
  ): Promise<ConnectionValidationResponse> => {
    return apiCall<ConnectionValidationResponse>(
      '/api/v1/technology-routes/validate-connection',
      {
        method: 'POST',
        body: JSON.stringify({
          source_tech_id: sourceTechId,
          target_tech_id: targetTechId,
        }),
      }
    );
  },
};
