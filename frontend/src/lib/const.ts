export const envConfig = {
    API_URL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003',
    APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    NODE_ENV: process.env.NODE_ENV,
};
