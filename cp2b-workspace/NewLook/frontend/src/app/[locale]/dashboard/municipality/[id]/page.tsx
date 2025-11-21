import MunicipalityClient from './MunicipalityClient';

// Server component wrapper
// Data is fetched client-side, so this page can be statically exported
export default function MunicipalityPage() {
  return <MunicipalityClient />;
}
