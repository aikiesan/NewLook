import MunicipalityClient from './MunicipalityClient';

// Generate static params for all municipalities at build time
export async function generateStaticParams() {
  try {
    console.log('Starting static generation for municipalities...');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://newlook-production.up.railway.app';
    
    // Add timeout to fetch to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`${apiUrl}/api/v1/geospatial/municipalities?limit=1000`, {
      cache: 'force-cache',
      next: { revalidate: 86400 },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.warn(`Failed to fetch municipalities: ${response.status}`);
      throw new Error(`API responded with ${response.status}`);
    }
    
    const municipalities = await response.json();
    console.log(`✓ Successfully fetched ${municipalities.length} municipalities`);
    
    return municipalities.map((muni: any) => ({
      id: muni.id.toString(),
    }));
  } catch (error) {
    console.error('Error generating municipality static params:', error);
    
    // FALLBACK: Return a few known IDs so the build doesn't fail completely
    // This allows testing the deployment even if the full list fails
    console.log('⚠️ Using fallback ID list for build');
    return [
      { id: '54' }, // Barretos (from test)
      { id: '1' },
      { id: '2' },
      { id: '3' }
    ];
  }
}

// Server component wrapper
export default function MunicipalityPage() {
  return <MunicipalityClient />;
}
