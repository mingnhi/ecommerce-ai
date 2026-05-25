import { formatVnd } from "@/lib/format-currency";
import type { HomeProduct } from "@/types/catalog";
import {
  getRecentlyAdded,
  getTopRated,
  getTopSelling,
  getTrendingProducts,
} from "../lib";
import { ProductPhoto, ProductRating } from "./ProductCard";

const LIST_COLUMNS = [
  { title: "Bán chạy nhất", items: getTopSelling },
  { title: "Xu hướng", items: getTrendingProducts },
  { title: "Mới thêm", items: getRecentlyAdded },
  { title: "Đánh giá cao", items: getTopRated },
] as const;

function CompactRow({ product }: { product: HomeProduct }) {
  return (
    <article className="group flex gap-3 rounded-lg border border-transparent px-2 py-3.5 transition-colors hover:border-sky-100 hover:bg-sky-50/40">
      <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-b from-sky-50 to-white ring-1 ring-sky-100/80">
        <ProductPhoto src={product.image} alt={product.name} fill className="object-contain p-1.5" sizes="72px" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-slate-800 group-hover:text-sky-800">
          {product.name}
        </h3>
        <ProductRating rating={product.rating} className="mt-1.5" />
        <div className="mt-1.5 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-bold text-sky-700">{formatVnd(product.price)}</span>
          {product.originalPrice && (
            <span className="text-[11px] text-slate-400 line-through">{formatVnd(product.originalPrice)}</span>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductListsSection() {
  return (
    <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
      {LIST_COLUMNS.map(({ title, items }) => (
        <div key={title} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
          <h3 className="border-b border-sky-100 pb-3 text-base font-bold text-slate-900">{title}</h3>
          <div className="mt-1 divide-y divide-slate-100">
            {items().map((product) => (
              <CompactRow key={product.productId} product={product} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
