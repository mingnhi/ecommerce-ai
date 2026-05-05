import { MetadataRoute } from 'next';
import { APP_URL } from '@/configs/site';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/'],
            },
        ],
        sitemap: `${APP_URL}/sitemap.xml`,
    };
}
