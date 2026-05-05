export type SiteConfig = typeof siteConfig;

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.learnking.org';

export const siteConfig = {
    name: 'LearnKing',
    metaTitle: 'LearnKing — Học tập & phát triển kỹ năng',
    description: 'LearnKing — Nền tảng học tập và phát triển kỹ năng của bạn.',
    ogImage: `${APP_URL}/og-image.png`,
    telegram: 'https://t.me/learnking',
    twitter: 'https://twitter.com/learnking',
    linkedin: 'https://www.linkedin.com/showcase/learnking',
    facebook: 'https://www.facebook.com/learnking',
    email: 'contact@learnking.vn',
};
