import MunicipalityClient from './MunicipalityClient';

// Force static rendering
export const dynamic = 'force-static';

// Pre-defined municipality IDs for static generation
// Using fallback IDs to ensure build passes without API dependency
// These cover common test cases and real municipality IDs
const STATIC_MUNICIPALITY_IDS = [
  '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
  '20', '30', '40', '50', '54', '100', '200', '300', '400', '500'
];

export function generateStaticParams() {
  // Return pre-defined IDs without API fetch to ensure fast, reliable builds
  // Dynamic municipality pages will be generated on-demand via ISR
  return STATIC_MUNICIPALITY_IDS.map(id => ({ id }));
}

// Server component wrapper
export default function MunicipalityPage() {
  return <MunicipalityClient />;
}
