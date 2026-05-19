export type SiteConfig = typeof siteConfig;

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.learnking.org';

export const siteConfig = {
    name: 'Ecommerce-AI',
    metaTitle: 'Ecommerce-AI —  Mua sắm online dễ dàng',
    description: 'Ecommerce-AI — Mua sắm online dễ dàng, giao hàng nhanh chóng.',
    ogImage: `${APP_URL}/og-image.png`,
    telegram: 'https://t.me/learnking',
    twitter: 'https://twitter.com/learnking',
    linkedin: 'https://www.linkedin.com/showcase/learnking',
    facebook: 'https://www.facebook.com/learnking',
    email: 'contact@learnking.vn',
};
