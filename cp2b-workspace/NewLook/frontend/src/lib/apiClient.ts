/**
 * Shared API Client Utility
 * Provides authentication headers for API requests
 */

/**
 * Get authentication headers from Supabase session
 * Returns headers with Authorization Bearer token if user is authenticated
 */
export async function getAuthHeaders(): Promise<HeadersInit> {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return {
      'Content-Type': 'application/json',
    };
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase credentials not found');
      return {
        'Content-Type': 'application/json',
      };
    }

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
 * Make an authenticated API call
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = await getAuthHeaders();

  return fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });
}
