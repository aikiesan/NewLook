import MunicipalityClient from './MunicipalityClient';

// Disable dynamic params - all routes must be pre-generated for static export
export const dynamicParams = false;

// Generate static paths for all municipalities at build time
// This is REQUIRED for static export mode (output: 'export')
export async function generateStaticParams() {
  try {
    // Fetch municipality list from API during build
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://newlook-production.up.railway.app';

    console.log('🏗️ Generating static paths for municipalities...');

    const response = await fetch(`${apiUrl}/api/v1/geospatial/municipalities/polygons`, {
      cache: 'no-store' // Don't cache during build
    });

    if (!response.ok) {
      console.error(`Failed to fetch municipalities: ${response.status} ${response.statusText}`);
      throw new Error('Failed to fetch municipalities for static generation');
    }

    const data = await response.json();
    const municipalities = data.features || [];

    console.log(`✅ Generating ${municipalities.length} municipality pages...`);

    // Generate params for each municipality
    const params = municipalities.map((feature: any) => {
      const id = String(feature.properties.id || feature.properties.ibge_code || feature.id);
      return { id };
    });

    // Log a sample for verification
    if (params.length > 0) {
      console.log(`Sample IDs: ${params.slice(0, 3).map(p => p.id).join(', ')}...`);
    }

    return params;
  } catch (error) {
    console.error('❌ Error generating static params for municipalities:', error);
    // In static export mode, we MUST return something, so return empty array
    // This will cause build to continue but those routes won't exist
    console.error('⚠️ Build will continue but municipality pages may not work!');
    return [];
  }
}

// Server component wrapper
// Data is fetched client-side, so pages can be pre-rendered at build time
export default function MunicipalityPage() {
  return <MunicipalityClient />;
}
