'use client';

import { ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ProductSort } from '../lib';
import { cn } from '@/lib/utils';

type ProductSortBarProps = {
  sort: ProductSort;
  onSortChange: (sort: ProductSort) => void;
};

const sortButtonClass = (active: boolean) =>
  cn(
    'rounded-lg border px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
    active
      ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
      : 'border-slate-200 bg-white text-slate-600 hover:border-sky-300 hover:text-sky-600',
  );

export function ProductSortBar({ sort, onSortChange }: ProductSortBarProps) {
  const priceLabel =
    sort === 'price_asc'
      ? 'Giá: Thấp đến cao'
      : sort === 'price_desc'
        ? 'Giá: Cao đến thấp'
        : 'Giá';

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <button
        type="button"
        onClick={() => onSortChange('newest')}
        className={sortButtonClass(sort === 'newest')}
      >
        Mới nhất
      </button>
      <button
        type="button"
        onClick={() => onSortChange('best_selling')}
        className={sortButtonClass(sort === 'best_selling')}
      >
        Nổi bật
      </button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={cn(
              sortButtonClass(sort === 'price_asc' || sort === 'price_desc'),
              'inline-flex items-center gap-1',
            )}
          >
            {priceLabel}
            <ChevronDown className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[180px]">
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSortChange('price_asc')}
          >
            Giá: Thấp đến cao
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer"
            onClick={() => onSortChange('price_desc')}
          >
            Giá: Cao đến thấp
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
