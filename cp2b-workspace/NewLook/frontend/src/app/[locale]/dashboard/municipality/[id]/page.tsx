import MunicipalityClient from './MunicipalityClient';

// Enable dynamic params for municipality IDs not in generateStaticParams
export const dynamicParams = true;

// Generate static paths for all municipalities at build time
// This is required for static export mode
export async function generateStaticParams() {
  try {
    // Fetch municipality list from API
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://newlook-production.up.railway.app';
    const response = await fetch(`${apiUrl}/api/v1/geospatial/municipalities/polygons`, {
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.warn('Failed to fetch municipalities for static generation, using fallback');
      return [];
    }

    const data = await response.json();
    const municipalities = data.features || [];

    // Generate params for each municipality
    return municipalities.map((feature: any) => ({
      id: String(feature.properties.id || feature.properties.ibge_code || feature.id)
    }));
  } catch (error) {
    console.error('Error generating static params for municipalities:', error);
    return []; // Return empty array on error, allow dynamic params as fallback
  }
}

// Server component wrapper
// Data is fetched client-side, so pages can be pre-rendered at build time
export default function MunicipalityPage() {
  return <MunicipalityClient />;
}
