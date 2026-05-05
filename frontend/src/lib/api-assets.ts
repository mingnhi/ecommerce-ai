const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function getApiBaseUrl(): string {
  return API_BASE;
}

export function getImageUrl(imagePath?: string | null): string | undefined {
  if (!imagePath) return undefined;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('blob:')) {
    return imagePath;
  }
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${API_BASE}${path}`;
}

export function getApiResourceUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}
