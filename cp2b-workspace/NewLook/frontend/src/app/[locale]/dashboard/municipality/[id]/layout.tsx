import { routing } from '@/i18n/routing';

// Generate static params for all 645 São Paulo municipalities
// This enables static export for Cloudflare Pages
export function generateStaticParams() {
  const municipalityIds = Array.from({ length: 645 }, (_, i) => (i + 1).toString());

  // Generate combinations of locale and municipality ID
  return routing.locales.flatMap((locale) =>
    municipalityIds.map((id) => ({
      locale,
      id,
    }))
  );
}

export default function MunicipalityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
