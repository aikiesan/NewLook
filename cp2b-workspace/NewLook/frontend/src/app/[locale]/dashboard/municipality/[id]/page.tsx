import MunicipalityClient from './MunicipalityClient';

// Use dynamic rendering for all municipality pages
// This ensures all municipalities from the database can be accessed
export const dynamic = 'force-dynamic';

// Server component wrapper
export default function MunicipalityPage() {
  return <MunicipalityClient />;
}
