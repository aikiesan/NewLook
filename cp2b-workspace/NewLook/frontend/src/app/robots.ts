import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/settings/'],
      },
    ],
    sitemap: 'https://pilar2b.vercel.app/sitemap.xml',
  }
}
