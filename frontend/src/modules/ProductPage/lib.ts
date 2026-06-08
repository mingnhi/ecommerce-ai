import { ROUTES } from '@/lib/routes';

export type ProductSort =
  | 'newest'
  | 'best_selling'
  | 'price_asc'
  | 'price_desc';

export type PriceBounds = { min: number; max: number };

export type PriceRange = [number, number];

export function parseProductSort(value: string | null): ProductSort {
  if (
    value === 'best_selling' ||
    value === 'price_asc' ||
    value === 'price_desc'
  ) {
    return value;
  }
  return 'newest';
}

export function parsePriceRange(
  minParam: string | null,
  maxParam: string | null,
  bounds: PriceBounds,
): PriceRange {
  const min =
    minParam != null && Number.isFinite(Number(minParam))
      ? Number(minParam)
      : bounds.min;
  const max =
    maxParam != null && Number.isFinite(Number(maxParam))
      ? Number(maxParam)
      : bounds.max;
  return [
    Math.max(bounds.min, Math.min(min, max)),
    Math.min(bounds.max, Math.max(min, max)),
  ];
}

export function isFullPriceRange(
  range: PriceRange,
  bounds: PriceBounds,
): boolean {
  return range[0] <= bounds.min && range[1] >= bounds.max;
}

export function buildProductPageUrl(params: {
  search?: string;
  categoryId?: string;
  sort?: ProductSort;
  page?: number;
  minPrice?: number;
  maxPrice?: number;
  priceBounds?: PriceBounds;
}) {
  const query = new URLSearchParams();
  if (params.search?.trim()) query.set('search', params.search.trim());
  if (params.categoryId) query.set('category', params.categoryId);
  if (params.sort && params.sort !== 'newest') query.set('sort', params.sort);
  if (params.page && params.page > 1) query.set('page', String(params.page));

  if (
    params.minPrice != null &&
    params.maxPrice != null &&
    params.priceBounds &&
    !isFullPriceRange(
      [params.minPrice, params.maxPrice],
      params.priceBounds,
    )
  ) {
    query.set('minPrice', String(params.minPrice));
    query.set('maxPrice', String(params.maxPrice));
  }

  const qs = query.toString();
  return qs ? `${ROUTES.PRODUCTS}?${qs}` : ROUTES.PRODUCTS;
}

function roundUpPrice(value: number): number {
  if (value <= 0) return 0;
  const power = Math.pow(10, Math.floor(Math.log10(value)));
  const unit = value / power;
  const factor =
    unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10;
  return factor * power;
}

export function roundPriceBounds(raw: PriceBounds): PriceBounds {
  const max = roundUpPrice(raw.max);
  return {
    min: 0,
    max: max > 0 ? max : 10,
  };
}

export function priceSliderStep(max: number): number {
  if (max >= 100_000_000) return 1_000_000;
  if (max >= 10_000_000) return 100_000;
  if (max >= 1_000_000) return 10_000;
  if (max >= 100_000) return 1_000;
  if (max >= 10_000) return 100;
  return 10;
}

export function snapPriceRange(
  range: PriceRange,
  bounds: PriceBounds,
): PriceRange {
  const step = priceSliderStep(bounds.max);
  const snap = (value: number) =>
    Math.round(Math.max(0, value) / step) * step;
  const min = Math.max(bounds.min, snap(range[0]));
  const max = Math.min(bounds.max, Math.max(min, snap(range[1])));
  return [min, max];
}
