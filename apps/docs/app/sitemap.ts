import type { MetadataRoute } from 'next';
import { docsNavigation } from '../navigation-config';
import { BASE_URL } from '../lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${BASE_URL}/docs`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.9 },
    { url: `${BASE_URL}/playground`, lastModified: now, changeFrequency: 'monthly' as const, priority: 0.6 },
  ];

  const docPages: MetadataRoute.Sitemap = docsNavigation.groups.flatMap((group) =>
    group.items.map((item) => {
      let priority = 0.7;
      if (group.label === 'Get Started') priority = 0.9;
      else if (group.label === 'Theme') priority = 0.8;

      return {
        url: `${BASE_URL}${item.href}`,
        lastModified: now,
        changeFrequency: 'weekly' as const,
        priority,
      };
    })
  );

  return [...staticPages, ...docPages];
}
