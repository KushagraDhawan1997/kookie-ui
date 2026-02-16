import type { MetadataRoute } from 'next';
import { docsNavigation } from '../navigation-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://hellokookie.com';
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/docs`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/playground`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const docPages: MetadataRoute.Sitemap = docsNavigation.groups.flatMap((group) =>
    group.items.map((item) => {
      let priority = 0.7;
      if (group.label === 'Get Started') priority = 0.9;
      else if (group.label === 'Theme') priority = 0.8;

      return {
        url: `${baseUrl}${item.href}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority,
      };
    })
  );

  return [...staticPages, ...docPages];
}
