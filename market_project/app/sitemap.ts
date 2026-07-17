import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const routes = ['', '/about', '/buyer', '/seller', '/terms', '/privacy'];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/buyer' ? 'hourly' : 'weekly',
    priority: route === '' ? 1 : 0.7,
  }));
}