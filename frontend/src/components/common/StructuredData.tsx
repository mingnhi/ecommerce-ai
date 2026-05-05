// Structured Data (JSON-LD) component for SEO
import { APP_URL, siteConfig } from '@/configs/site';

interface StructuredDataProps {
    type: 'Organization' | 'WebSite' | 'Article' | 'JobPosting' | 'BreadcrumbList';
    data?: any;
}

export function StructuredData({ type, data }: StructuredDataProps) {
    const getStructuredData = () => {
        const baseData = {
            '@context': 'https://schema.org',
        };

        switch (type) {
            case 'Organization':
                return {
                    ...baseData,
                    '@type': 'Organization',
                    name: siteConfig.name,
                    url: APP_URL,
                    logo: `${APP_URL}/images/LearnKing-logo.png`,
                    sameAs: [
                        siteConfig.facebook,
                        siteConfig.twitter,
                        siteConfig.linkedin,
                        siteConfig.telegram,
                    ].filter(Boolean),
                    contactPoint: {
                        '@type': 'ContactPoint',
                        email: siteConfig.email,
                        contactType: 'customer service',
                    },
                };

            case 'WebSite':
                return {
                    ...baseData,
                    '@type': 'WebSite',
                    name: siteConfig.name,
                    url: APP_URL,
                };

            case 'Article':
                if (!data) return null;
                return {
                    ...baseData,
                    '@type': 'Article',
                    headline: data.title,
                    description: data.excerpt || data.description,
                    image: data.imageUrl || siteConfig.ogImage,
                    datePublished: data.createdAt ? new Date(data.createdAt).toISOString() : undefined,
                    dateModified: data.updatedAt ? new Date(data.updatedAt).toISOString() : undefined,
                    author: {
                        '@type': 'Organization',
                        name: siteConfig.name,
                    },
                    publisher: {
                        '@type': 'Organization',
                        name: siteConfig.name,
                        logo: {
                            '@type': 'ImageObject',
                            url: `${APP_URL}/images/LearnKing-logo.png`,
                        },
                    },
                };

            case 'JobPosting':
                if (!data) return null;
                return {
                    ...baseData,
                    '@type': 'JobPosting',
                    title: data.title,
                    description: data.description,
                    datePosted: data.created_at ? new Date(data.created_at).toISOString() : undefined,
                    validThrough: data.deadline ? new Date(data.deadline).toISOString() : undefined,
                    employmentType: data.job_type || 'FULL_TIME',
                    baseSalary: {
                        '@type': 'MonetaryAmount',
                        currency: 'VND',
                        value: {
                            '@type': 'QuantitativeValue',
                            minValue: data.salary_min,
                            maxValue: data.salary_max,
                        },
                    },
                    jobLocation: {
                        '@type': 'Place',
                        address: {
                            '@type': 'PostalAddress',
                            addressLocality: data.location,
                            addressCountry: 'VN',
                        },
                    },
                    hiringOrganization: {
                        '@type': 'Organization',
                        name: data.employer?.name || 'Unknown',
                    },
                };

            case 'BreadcrumbList':
                if (!data?.items || !Array.isArray(data.items)) return null;
                return {
                    ...baseData,
                    '@type': 'BreadcrumbList',
                    itemListElement: data.items.map((item: any, index: number) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: item.name,
                        item: item.url,
                    })),
                };

            default:
                return null;
        }
    };

    const structuredData = getStructuredData();

    if (!structuredData) return null;

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
    );
}

