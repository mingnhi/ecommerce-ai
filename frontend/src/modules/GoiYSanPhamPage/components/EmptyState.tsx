import Link from "next/link";
import { ArrowRight, Compass, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl  text-center">
      <div className="flex size-16 items-center justify-center rounded-full ">
        <Compass className="size-7 text-sky-500" strokeWidth={1.5} />
      </div>
      <h3 className="mt-6 text-lg font-semibold tracking-tight text-sky-500">
        Chưa có gợi ý phù hợp
      </h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
        Hãy xem thêm sản phẩm, thêm vào giỏ hàng hoặc mua sắm để hệ thống hiểu rõ sở thích của bạn
        hơn.
      </p>
      <Button
        asChild
        variant="outline"
        className="mt-8 rounded-full border-sky-200/70 px-8 font-medium text-sky-500 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
      >
        <Link href={ROUTES.PRODUCTS}>
          <ShoppingBag className="mr-2 size-4" />
          Khám phá sản phẩm
          <ArrowRight className="ml-2 size-4" />
        </Link>
      </Button>
    </div>
  );
}
