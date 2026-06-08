import { ROUTES } from '@/lib/routes';

type SearchUrlParams = {
  q?: string;
  page?: number;
};

export function buildSearchUrl({ q, page }: SearchUrlParams) {
  const query = new URLSearchParams();
  const term = q?.trim();

  if (term) query.set('search', term);
  if (page && page > 1) query.set('page', String(page));

  const qs = query.toString();
  return qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS;
}

export function readSearchQuery(searchParams: URLSearchParams) {
  return searchParams.get('search') ?? '';
}
