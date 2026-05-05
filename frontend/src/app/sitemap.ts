import { MetadataRoute } from 'next';
import { APP_URL } from '@/configs/site';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = APP_URL;
    const currentDate = new Date();

    return [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/dang-nhap`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/dang-ky`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
    ];
}
