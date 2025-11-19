import MunicipalityClient from './MunicipalityClient';

// Force static rendering
export const dynamic = 'force-static';

export async function generateStaticParams() {
  // FALLBACK IDs to ensure build passes even if API fails
  // We include a few real IDs and a dummy one
  const fallbackIds = [
    { id: '1' }, { id: '2' }, { id: '3' }, { id: '54' }
  ];

  try {
    console.log('Starting static generation for municipalities...');
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://newlook-production.up.railway.app';

    // Short timeout (5s) to fail fast and use fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${apiUrl}/api/v1/geospatial/municipalities?limit=100`, {
      cache: 'force-cache',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`API status: ${response.status}`);

    const municipalities = await response.json();
    console.log(`Fetched ${municipalities.length} municipalities for static generation`);

    return municipalities.map((muni: any) => ({
      id: muni.id.toString(),
    }));
  } catch (error) {
    console.error('API Fetch failed, using fallback IDs:', error);
    return fallbackIds;
  }
}

export default function MunicipalityPage() {
  return <MunicipalityClient />;
}
