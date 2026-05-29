'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType, ReactNode } from 'react';
import { ChevronRight, CircleDollarSign, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import { useCategories } from '@/apis/category/queries';
import { useProductPriceRange } from '@/apis/product/queries';
import type { ApiEnvelope } from '@/types/common';
import type { Category, CategoryTreeResponse } from '@/apis/category/types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { formatVnd } from '@/lib/format-currency';
import {
  isFullPriceRange,
  priceSliderStep,
  roundPriceBounds,
  snapPriceRange,
  type PriceBounds,
  type PriceRange,
} from '../lib';
import { cn } from '@/lib/utils';

type FilterSidebarProps = {
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  priceRange: PriceRange;
  onPriceRangeCommit: (range: PriceRange) => void;
};

const popoverClass =
  'z-50 w-auto min-w-[200px] max-w-[min(90vw,320px)] rounded-md border border-sky-200 bg-white p-0 shadow-lg shadow-sky-100/60 outline-none';

function isInSubtree(category: Category, selectedId: string | null): boolean {
  if (!selectedId) return false;
  if (category.id === selectedId) return true;
  return (
    category.children?.some((child) => isInSubtree(child, selectedId)) ?? false
  );
}

function chipClass(active: boolean) {
  return cn(
    'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors cursor-pointer',
    active
      ? 'border-sky-500 bg-sky-500 text-white hover:bg-sky-600'
      : 'border-sky-200 bg-white text-sky-900/80 hover:border-sky-400 hover:bg-sky-50 hover:text-sky-700',
  );
}

function FilterSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-sky-100 first:border-t-0">
      <div className="flex items-center gap-2 border-l-[3px] border-sky-500 bg-sky-50/80 px-4 py-2.5">
        <Icon className="size-3.5 text-sky-500" />
        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-sky-800">
          {title}
        </h3>
      </div>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

function PriceRangeFilter({
  bounds,
  value,
  onCommit,
}: {
  bounds: PriceBounds;
  value: PriceRange;
  onCommit: (range: PriceRange) => void;
}) {
  const [draft, setDraft] = useState(value);
  const step = priceSliderStep(bounds.max);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (bounds.max <= bounds.min) {
    return (
      <p className="text-xs text-sky-400">Chưa có dữ liệu giá sản phẩm</p>
    );
  }

  return (
    <div className="space-y-3">
      <Slider
        min={bounds.min}
        max={bounds.max}
        step={step}
        value={draft}
        onValueChange={(next) => setDraft([next[0], next[1]])}
        onValueCommit={(next) =>
          onCommit(snapPriceRange([next[0], next[1]], bounds))
        }
        className="py-1"
      />
      <div className="flex items-center justify-between gap-2 text-[11px] font-semibold tabular-nums text-sky-800">
        <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1">
          {formatVnd(draft[0])}
        </span>
        <span className="text-sky-300">—</span>
        <span className="rounded-md border border-sky-200 bg-sky-50 px-2 py-1">
          {formatVnd(draft[1])}
        </span>
      </div>
    </div>
  );
}

function CategoryPopoverPanel({
  category,
  selectedId,
  onSelect,
}: {
  category: Category;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div>
      <div className="rounded-t-md border-b border-sky-200 bg-sky-50 px-3 py-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-600">
          {category.name}
        </p>
      </div>
      <ul className="space-y-1 p-2">
        <li>
          <button
            type="button"
            onClick={() => onSelect(category.id)}
            className={chipClass(selectedId === category.id)}
          >
            Tất cả
          </button>
        </li>
        {category.children?.map((child) => (
          <li key={child.id}>
            <CategoryPopoverRow
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

function CategoryPopoverRow({
  category,
  selectedId,
  onSelect,
}: {
  category: Category;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const hasChildren = Boolean(category.children?.length);
  const active =
    selectedId === category.id || isInSubtree(category, selectedId);

  if (!hasChildren) {
    return (
      <button
        type="button"
        onClick={() => onSelect(category.id)}
        className={chipClass(selectedId === category.id)}
      >
        <span className="truncate">{category.name}</span>
      </button>
    );
  }

  return (
    <Popover modal={false}>
      <PopoverTrigger asChild>
        <button type="button" className={chipClass(active)}>
          <span className="truncate">{category.name}</span>
          <ChevronRight className="size-3.5 shrink-0 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={6}
        className={popoverClass}
      >
        <CategoryPopoverPanel
          category={category}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      </PopoverContent>
    </Popover>
  );
}

function CategoryFilterPopover({
  category,
  open,
  onOpenChange,
  selectedId,
  onSelect,
  trigger,
}: {
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  trigger: ReactNode;
}) {
  const handleSelect = (id: string) => {
    onSelect(id);
    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className={popoverClass}
      >
        <CategoryPopoverPanel
          category={category}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}

export function FilterSidebar({
  selectedCategoryId,
  onCategorySelect,
  priceRange,
  onPriceRangeCommit,
}: FilterSidebarProps) {
  const { data: categoryData } = useCategories({ type: 'tree' });
  const { data: priceRangeResponse } = useProductPriceRange();
  const [openCategoryId, setOpenCategoryId] = useState<string | null>(null);

  const categories: Category[] =
    (categoryData as ApiEnvelope<CategoryTreeResponse> | undefined)?.data
      ?.categories ?? [];

  const bounds = useMemo(
    () =>
      roundPriceBounds(
        priceRangeResponse?.data ?? { min: 0, max: 10_000_000 },
      ),
    [priceRangeResponse?.data],
  );

  const hasPriceFilter = !isFullPriceRange(priceRange, bounds);

  return (
    <aside className="rounded-md border border-sky-200 bg-white">
      <div className="border-b border-sky-200 bg-gradient-to-r from-sky-500 to-sky-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-white" />
          <h2 className="text-sm font-bold tracking-tight text-white">
            Bộ lọc
          </h2>
        </div>
      </div>

      <FilterSection title="Khoảng giá" icon={CircleDollarSign}>
        <PriceRangeFilter
          bounds={bounds}
          value={priceRange}
          onCommit={onPriceRangeCommit}
        />
        {hasPriceFilter && (
          <button
            type="button"
            onClick={() => onPriceRangeCommit([bounds.min, bounds.max])}
            className="mt-3 w-full rounded-md border border-sky-200 py-1.5 text-xs font-semibold text-sky-700 transition-colors hover:border-sky-500 hover:bg-sky-50 cursor-pointer"
          >
            Xóa lọc giá
          </button>
        )}
      </FilterSection>

      <FilterSection title="Danh mục" icon={LayoutGrid}>
        <ul className="space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => onCategorySelect(null)}
              className={cn(
                'flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors cursor-pointer',
                !selectedCategoryId
                  ? 'bg-sky-500 text-white hover:bg-sky-600'
                  : 'text-sky-900/80 hover:bg-sky-50 hover:text-sky-700',
              )}
            >
              Tất cả danh mục
            </button>
          </li>

          {categories.map((category) => {
            const hasChildren = Boolean(category.children?.length);
            const isActive = isInSubtree(category, selectedCategoryId);

            if (!hasChildren) {
              return (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => onCategorySelect(category.id)}
                    className={cn(
                      'flex w-full items-center rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors cursor-pointer',
                      selectedCategoryId === category.id
                        ? 'bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-400'
                        : 'text-sky-900/80 hover:bg-sky-50 hover:text-sky-700',
                    )}
                  >
                    {category.name}
                  </button>
                </li>
              );
            }

            return (
              <li key={category.id}>
                <CategoryFilterPopover
                  category={category}
                  open={openCategoryId === category.id}
                  onOpenChange={(open) =>
                    setOpenCategoryId(open ? category.id : null)
                  }
                  selectedId={selectedCategoryId}
                  onSelect={onCategorySelect}
                  trigger={
                    <button
                      type="button"
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm font-medium transition-colors cursor-pointer',
                        isActive
                          ? 'bg-sky-100 text-sky-700 ring-1 ring-inset ring-sky-400'
                          : 'text-sky-900/80 hover:bg-sky-50 hover:text-sky-700',
                      )}
                    >
                      <span className="truncate">{category.name}</span>
                      <ChevronRight className="size-3.5 shrink-0 text-sky-400" />
                    </button>
                  }
                />
              </li>
            );
          })}
        </ul>
      </FilterSection>
    </aside>
  );
}
