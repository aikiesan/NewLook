import MunicipalityClient from './MunicipalityClient';

// Disable dynamic params - all routes must be pre-generated for static export
export const dynamicParams = false;

// Track if we've already generated params to prevent infinite loops
let hasGenerated = false;

// Generate static paths for all municipalities at build time
// This is REQUIRED for static export mode (output: 'export')
export async function generateStaticParams() {
  // Prevent infinite loop - only generate once
  if (hasGenerated) {
    console.log('⏭️ Skipping duplicate generateStaticParams call');
    return [];
  }

  hasGenerated = true;

  try {
    // For static export, we'll generate a limited set to avoid build issues
    // TODO: In production, this should generate all municipalities
    const LIMIT_FOR_BUILD = parseInt(process.env.NEXT_PUBLIC_STATIC_PATHS_LIMIT || '50');

    console.log(`🏗️ Generating static paths for up to ${LIMIT_FOR_BUILD} municipalities...`);

    // Use a simple hardcoded list of top municipalities to avoid API dependency
    // This prevents infinite loops and build timeouts
    const topMunicipalities = [
      '3550308', // São Paulo
      '3509502', // Campinas
      '3543402', // Ribeirão Preto
      '3548708', // Santos
      '3547809', // São José dos Campos
      '3552205', // Sorocaba
      '3518800', // Guarulhos
      '3548906', // Santo André
      '3534401', // Osasco
      '3505708', // Bauru
    ];

    console.log(`✅ Generating ${topMunicipalities.length} municipality pages (limited for build performance)`);
    console.log(`Sample IDs: ${topMunicipalities.slice(0, 3).join(', ')}...`);

    return topMunicipalities.map(id => ({ id }));

  } catch (error) {
    console.error('❌ Error generating static params:', error);
    return [];
  }
}

// Server component wrapper
// Data is fetched client-side, so pages can be pre-rendered at build time
export default function MunicipalityPage() {
  return <MunicipalityClient />;
}
