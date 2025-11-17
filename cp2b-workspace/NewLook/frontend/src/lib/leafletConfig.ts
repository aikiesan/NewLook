/**
 * CP2B Maps V3 - Leaflet Configuration for Next.js
 * Fixes default marker icon paths in Next.js
 */

import L from 'leaflet';

// Fix for default marker icons in Next.js
// Next.js doesn't handle Leaflet's default icon paths correctly
export function fixLeafletIcons() {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl;

  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/leaflet/marker-icon-2x.png',
    iconUrl: '/leaflet/marker-icon.png',
    shadowUrl: '/leaflet/marker-shadow.png',
  });
}

// Call this before using Leaflet
if (typeof window !== 'undefined') {
  fixLeafletIcons();
}
